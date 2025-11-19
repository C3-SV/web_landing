import { db } from "./firebase_config.js";
import {
    doc,
    collection,
    getDoc,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";


// tomar url 

function getEventIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

// setear datos 

function setText(id, text, defaultText) {
    const el = document.getElementById(id);
    if (el) el.textContent = text || defaultText || "";
}

function setImage(id, url) {
    const el = document.getElementById(id);
    if (el) el.src = url || "assets/images/hackathon.jpg";
}

function setHTML(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html || "";
}

// manejo de fechas 

function calcularFecha(tiempo) {
    try {
        const date = tiempo.toDate();
        const fechaBreve = { year: 'numeric', month: 'long', day : 'numeric' };
        let fecha = date.toLocaleDateString('es-ES', fechaBreve).toString();
        fecha = fecha[0].toUpperCase() + fecha.slice(1);
        return fecha;
    } catch {
        return "";
    }
}

// cargar evento 

async function loadEvent(eventId) {

    const ref = doc(db, "events", eventId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        console.error("El evento no existe en Firestore.");
        return;
    }

    return snap.data();
}


// mostrar para cada apartado 
// data principal o normal 

function mostrarDataPrincipal(data) {
    // titulo 
    setText("eventTitle", data.title, "Sin titulo.");
    // imagen 
    setImage("eventBanner", data.banner || data.coverImage);
    // descripcion
    setText("eventDescription", data.description, "Sin descripción");

    // TODO: Datos generales 
    // DURACION, UBICACION, MODALIDAD, FECHAS, PARTICIPANTES, AGREGAR ICONOS DE BOOTSTRAP
    setHTML("eventDuration", `
        <i class="bi bi-clock-fill"></i>
        <span class="font-semibold"> Duración: </span> ${data.duration || "—"}
    `);

    setHTML("eventUbication", `
        <i class="bi bi-geo-alt-fill"></i>
        <span class="font-semibold"> Lugar: </span> ${data.location || "—"}
    `);

    setHTML("eventDates", `
        <i class="bi bi-calendar-event"></i>
        <span class="font-semibold"> Fechas: </span> ${calcularFecha(data.date)}
    `);

    setHTML("eventParticipantes", `
        <i class="bi bi-people-fill"></i>
        <span class="font-semibold"> Participantes: </span> ${data.participantsText || "—"}
    `);

    if (document.getElementById("eventModality")) {
        setHTML("eventModality", `
            <i class="bi bi-laptop-fill"></i>
            <span class="font-semibold"> Modalidad: </span> ${data.modality || "—"}
        `);
    }
}

// categorias

function mostrarCategorias(categorias) {
    const container = document.getElementById("eventCategories");
    container.innerHTML = "";

    if (!categorias || categorias.length == 0) return;

    categorias.forEach(element => {
        const parrafo = document.createElement("p");
        parrafo.className = "grow relative z-10 rounded-full bg-gradient-to-r from-[#408cd3] to-[#3f3dc8] px-3 py-1.5 text-lg text-white text-center font-semibold w-[48%]";
        const contenido = element[0].toUpperCase() + element.slice(1);
        parrafo.textContent = contenido;
        container.appendChild(parrafo);
    });
}

// estructura del evento 

async function mostrarEstructura(eventId) {
    const container = document.getElementById("eventStructureContainer");
    container.innerHTML = "";
    container.className = "flex flex-row flex-wrap gap-8 items-stretch justify-center";
    // tomar los items 

    const ref = collection(db, "events", eventId, "structure");
    const q = query(ref, orderBy("order", "asc"));
    const snap = await getDocs(q);

    if (snap.size == 0) return;

    // por cada uno, recorrer e ir creando 

    for (const doc of snap.docs){
        const item = doc.data();
        // este tiene un icono, titulo, tipo
        // crear el articulo y el contenido html 
        let contenidoHTML = "";
        const article = document.createElement("article");
        article.className = "w-full lg:w-[48%] p-6 bg-white/5 border border-gray-700 rounded-lg shadow-sm min-h-[300px] flex flex-col justify-center";

        // poner titulo e icono 
        const iconHTML = item.icon ? `<i class="${item.icon} text-white text-3xl"></i>` : `<i class="bi bi-star text-white text-3xl"></i>`;
        contenidoHTML += `
        <h3 class="mb-10 text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2 text-center lg:text-left">
            ${iconHTML}
            ${item.title || ""}
        </h3>
        <div class="flex flex-col">
        `

        // necesitamos el contenido de este elemento, items internos 

        const refContenido = collection(db, "events", eventId, "structure", doc.id, "items");
        const qContenido = query(refContenido, orderBy("order", "asc"));
        const contenidoSnap = await getDocs(qContenido); 

        for (const contenidoDoc of contenidoSnap.docs){
            const c = contenidoDoc.data(); 

            const cIcon = c.icon? `<i class="${c.icon} text-white"></i>`
                : `<i class="bi bi-circle text-white"></i>`;

            contenidoHTML += `
            <p class="text-md text-white mb-3 text-center lg:text-left">
                ${cIcon}
                <span>
                    <span class="font-semibold">${c.title ? c.title + ": " : ""}</span>
                    ${c.text || ""}
                </span>
            </p>
            `
        }

        contenidoHTML += `</div>`;
        article.innerHTML = contenidoHTML;
        container.appendChild(article);
    };
}

// mostrar estadisticas 

async function mostrarEstadisticas(eventId) {
    const container = document.getElementById("eventStatsContainer");
    container.className ="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0.5 rounded-2xl border border-gray-700 overflow-hidden";
    container.innerHTML = "";

    const ref = collection(db, "events", eventId, "stats");
    const q = query(ref, orderBy("order", "asc"));
    const snap = await getDocs(q);

    if (snap.size === 0) return;

    for (const docSnap of snap.docs) {
        const stat = docSnap.data();

        const bloque = document.createElement("div");
        bloque.className = "flex flex-col bg-white/5 p-8";

        const icono = stat.icon
            ? `<i class="${stat.icon} text-[#61b3ff] text-4xl"></i>`
            : `<i class="bi bi-circle text-[#61b3ff] text-4xl"></i>`;

        bloque.innerHTML = `
            <dt class="text-lg font-semibold text-white">
                ${stat.text || ""}
            </dt>
            <dd class="order-first text-4xl font-semibold tracking-tight text-[#61b3ff] flex justify-center items-center gap-2">
                ${icono}
                ${stat.value || "—"}
            </dd>
        `;

        container.appendChild(bloque);
    }
}

// galeria 
async function mostrarGaleria(eventId) {
    const container = document.getElementById("eventGalleryContainer");
    container.innerHTML = "";

    const ref = collection(db, "events", eventId, "gallery");
    const q = query(ref, orderBy("order", "asc"));
    const snap = await getDocs(q);

    if (snap.size === 0) return;

    for (const docSnap of snap.docs) {
        const foto = docSnap.data();

        const div = document.createElement("div");
        div.className = "grid gap-4";

        div.innerHTML = `
            <img class="h-full w-full rounded-lg object-cover"
                 src="${foto.url}"
                 alt="${foto.caption || ""}">
        `;

        container.appendChild(div);
    }
}

// premiacion 

async function mostrarPremiacion(eventId) {
    const container = document.getElementById("eventAwardsContainer");
    container.innerHTML = "";

    const ref = collection(db, "events", eventId, "awards");
    const q = query(ref, orderBy("order", "asc"));
    const snap = await getDocs(q);

    if (snap.size === 0) return;

    for (const docSnap of snap.docs) {
        const award = docSnap.data();

        const img = document.createElement("img");
        img.src = award.url;
        img.alt = award.caption || "";
        img.className = "w-full rounded-lg object-cover mb-6";

        container.appendChild(img);
    }
}
// mostrar links 

async function mostrarEnlaces(eventId) {
    const container = document.getElementById("eventLinksContainer");
    container.innerHTML = "";

    const ref = collection(db, "events", eventId, "links");
    const q = query(ref, orderBy("order", "asc"));
    const snap = await getDocs(q);

    if (snap.size === 0) return;

    for (const docSnap of snap.docs) {
        const link = docSnap.data();

        const a = document.createElement("a");
        a.href = link.url;
        a.target = "_blank";
        a.className =
            "w-full lg:w-[48%] block p-6 bg-gradient-to-r from-[#408cd3] to-[#3f3dc8] rounded-lg shadow-sm transition-transform duration-500 hover:scale-105";

        const icono = `<i class="bi bi-link-45deg text-white text-3xl mr-2"></i>`;

        a.innerHTML = `
            <h5 class="text-2xl font-bold text-white text-center flex items-center justify-center">
                ${icono}
                ${link.title || "Enlace"}
            </h5>
        `;

        container.appendChild(a);
    }
}

// iniciar todo 
async function iniciar() {
    const eventId = getEventIdFromURL();
    if (!eventId) {
        console.error("No hay Id del evento");
        return;
    }

    const eventData = await loadEvent(eventId);
    if (!eventData) return;

    // data principal 
    mostrarDataPrincipal(eventData);

    mostrarCategorias(eventData.categories);

    await mostrarEstructura(eventId);
    await mostrarEstadisticas(eventId);
    await mostrarGaleria(eventId);
    await mostrarPremiacion(eventId);
    await mostrarEnlaces(eventId); 

}

document.addEventListener("DOMContentLoaded", iniciar);
