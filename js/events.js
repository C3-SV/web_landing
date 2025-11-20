//! Para mostrar proximos eventos en el sitio events.html
import { collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js"
import { db } from "./firebase_config.js"

const containerUpcomingEvents = document.getElementById("upcomingEventsContainer");
const containerPastEvents = document.getElementById("pastEventsContainer");

const inputBusqueda = document.getElementById("barraBusqueda");
const btnOrdenar = document.getElementById("btnOrdenarEventos")

// CalcularFecha 

function CalcularFecha(tiempo) {
    try {
        const date = tiempo.toDate();
        const fechaBreve = { year: 'numeric', month: 'long' };
        let fecha = date.toLocaleDateString('es-ES', fechaBreve).toString();
        fecha = fecha[0].toUpperCase() + fecha.slice(1);
        return fecha;
    } catch {
        return "";
    }
}
// Crear tarjeta de proximos eventos

function crearTarjetaProximo(eventId, eventData) {
    const {
        title,
        summary,
        shortDescription,
        categories = [],
        banner,
        coverImage,
        date
    } = eventData;
    //console.log(title, summary, shortDescription, categories, banner, coverImage, date); 

    const textoCategoria = categories.length ? categories[0] : "General";
    const textoResumen = summary || shortDescription || "";
    const img = banner || coverImage || "assets/images/hackathon.jpg";
    const fecha = CalcularFecha(date);

    return `
    <article class="flex flex-col items-start justify-between rounded-2xl bg-white/5">
        <div class="relative w-full">
            <img
                src="${img}"
                alt="${title}"
                class="aspect-[2/1] w-full rounded-2xl object-cover lg:aspect-[99/100]"
            />
            <div class="absolute inset-0 rounded-2xl inset-ring inset-ring-white/10"></div>
        </div>

        <div class="w-full px-5 pb-5 flex grow flex-col justify-between">
            <div class="mt-4 flex items-center gap-x-4 text-xs">
                <time class="text-white">${fecha}</time>
                <p class="rounded-full bg-gradient-to-r from-[#408cd3] to-[#3f3dc8] px-3 py-1.5 text-md text-white font-semibold">
                    ${textoCategoria}
                </p>
            </div>

            <div class="w-full flex flex-col">
                <h3 class="mt-4 text-2xl font-semibold text-[#61b3ff]">
                    ${title}
                </h3>

                <p class="mt-2 line-clamp-6 text-sm text-white text-justify">
                    ${textoResumen}
                </p>

                <a
                    href="future_event.html?id=${eventId}"
                    class="mt-5 text-white text-md font-bold bg-gradient-to-r from-[#408cd3] to-[#3f3dc8] py-2 rounded-full w-36 hover:scale-105 transition-transform duration-500 self-center text-center"
                >
                    Ver más
                </a>
            </div>
        </div>
    </article>
    `;
}

// Cargar eventos futuros

async function loadUpcomingEvents() {
    try {
        const eventsCollection = collection(db, "events");
        const q = query(eventsCollection, where("status", "==", "upcoming"), orderBy("date", "asc"));
        const snapshot = await getDocs(q);

        // Reiniciar el contenedor
        containerUpcomingEvents.innerHTML = "";

        // Si no hay eventos
        if (snapshot.empty) {
            containerUpcomingEvents.innerHTML = `
        <p class="text-white text-xl text-center col-span-3">No hay eventos próximos <br> Vuelve Pronto!!</p>;
        `
        }
        // Por cada elemento, crear tarjeta e insertar 

        snapshot.forEach(doc => {
            const tarjeta = crearTarjetaProximo(doc.id, doc.data());
            containerUpcomingEvents.insertAdjacentHTML("beforeend", tarjeta);
        });
    } catch (error) {
        console.log("Error cargando eventos", error);
        containerUpcomingEvents.innerHTML = `
        <p class="text-white text-xl text-center col-span-3">Error cargando eventos. </p>;
        `
    }
}

//! EVENTOS PASADOS 

let eventosPasados = [];
let eventosPasadosFiltrados = [];
let paginaActual = 1;
const itemsPorPagina = 6;
let ordenamientoActual = "desc";

function crearTarjetaPasado(eventId, eventData) {
    const {
        title,
        summary,
        shortDescription,
        description,
        categories = [],
        banner,
        coverImage,
        date
    } = eventData;
    //console.log(title, summary, shortDescription, categories, banner, coverImage, date); 

    const desc = description || summary || "";
    const textoCategoria = categories.length ? categories[0] : "General";
    const textoResumen = summary || shortDescription || "";
    const img = banner || coverImage || "assets/images/hackathon.jpg";
    const fecha = CalcularFecha(date);

    return `
    <article class="bg-white/5 border border-gray-700 rounded-lg shadow-sm">
                        <img class="rounded-t-lg min-h-[250px] object-cover" src="${img}"
                            alt="img_evento" />
                        <div class="p-5">
                            <h5 class="mb-2 text-2xl font-bold tracking-tight text-[#61b3ff]">
                                ${title}
                            </h5>
                            <p class="mb-3 font-normal text-white">
                                ${desc}
                            </p>
                            <div class="w-full flex justify-end items-center">
                                <a href="past_event.html?id=${eventId}"
                                    class="inline-flex items-center px-3 py-2 text-md font-semibold text-center text-white rounded-full bg-gradient-to-r from-[#408cd3] to-[#3f3dc8] transition-transform duration-500 hover:scale-105">
                                    Conocer más
                                    <i class="bi bi-arrow-right ml-1"></i>
                                </a>
                            </div>
                        </div>
                    </article>       
    `;
}

// para hacer la paginacion 

function mostrarEventosPasados() {
    containerPastEvents.innerHTML = "";

    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;

    // elementos en la pagina actual 

    const itemsPagina = eventosPasadosFiltrados.slice(inicio, fin);

    if (itemsPagina.length === 0) {
        // no hay eventos 
        containerPastEvents.innerHTML = `
            <p class="text-white text-xl text-center col-span-3">No se encontraron eventos.</p>
        `;
        return;
    }

    itemsPagina.forEach(evento => {
        const tarjeta = crearTarjetaPasado(evento.id, evento.data);
        containerPastEvents.insertAdjacentHTML("beforeend", tarjeta);
    });

    cargarPaginacion(); 
}

// para ordenar los eventos 

function ordenarEventos() {
    ordenamientoActual = ordenamientoActual === "asc" ? "desc" : "asc";

    // ordenar el arreglo de eventos filtrados 

    eventosPasadosFiltrados.sort((a, b) => {
        const fechaA = a.data.date.toDate();
        const fechaB = b.data.date.toDate();
        return ordenamientoActual === "asc" ? fechaA - fechaB : fechaB - fechaA;
    });

    // reiniicar 
    paginaActual = 1;
    mostrarEventosPasados();
}

// buscar 

function filtrarBusqueda() {
    const busqueda = inputBusqueda.value.toLowerCase();

    eventosPasadosFiltrados = eventosPasados.filter(evento =>
        evento.data.title.toLowerCase().includes(busqueda) ||
        (evento.data.summary || "").toLowerCase().includes(busqueda)
    );

    paginaActual = 1;
    mostrarEventosPasados();
}
async function loadPastEvents() {
    try {
        const eventsCollection = collection(db, "events");
        const q = query(eventsCollection, where("status", "==", "finished"), orderBy("date", "asc"));
        const snapshot = await getDocs(q);

        eventosPasados = [];
        snapshot.forEach(doc => {
            eventosPasados.push({
                id: doc.id,
                data: doc.data()
            })
        })

        eventosPasadosFiltrados = [...eventosPasados];
        ordenarEventos();

    } catch (error) {
        console.log("Error cargando eventos pasados", error);
        containerPastEvents.innerHTML = `
        <p class="text-white text-xl text-center col-span-3">Error cargando eventos. </p>;
        `
    }
}

//! PAGINACION 

function cargarPaginacion() {
    const paginacion = document.getElementById("paginationControls");
    paginacion.innerHTML = "";

    const totalItems = eventosPasadosFiltrados.length;
    const totalPaginas = Math.ceil(totalItems / itemsPorPagina);

    // boton de anterior 

    const prevButonHabilitado = paginaActual === 1 ? "opacity-40 pointer-events-none" : "";
    paginacion.insertAdjacentHTML("beforeend", `
        <li>
            <button
                class="flex items-center justify-center px-4 h-10 ms-0 leading-tight bg-gradient-to-r from-[#408cd3] to-[#3f3dc8] rounded-s-lg ${prevButonHabilitado}"
                data-page="prev" data-pagination = "true">
                <svg xmlns="http://www.w3.org/2000/svg" fill="#fff" class="size-6"><path d="M14 6l-6 6l6 6v-12" /></svg>
            </button>
        </li>
    `);

    // paginas 

    for (let i = 1; i <= totalPaginas; i++) {
        const actual = i === paginaActual
            ? "z-10 text-white font-semibold bg-gradient-to-r from-[#408cd3] to-[#3f3dc8]"
            : "text-gray-500 bg-[var(--azul-fondo)] border border-gray-700 hover:bg-gradient-to-r from-[#408cd3] to-[#3f3dc8] hover:text-white hover:font-semibold";

        paginacion.insertAdjacentHTML("beforeend", `
            <li>
                <button
                    class="flex items-center justify-center px-4 h-10 leading-tight transition-transform duration-500 hover:scale-105 ${actual}"
                    data-page="${i}"
                    data-pagination = "true">
                    ${i}
                </button>
            </li>
        `);
    }

    // boton de siguiente

    const sigBotonHabilitado = paginaActual === totalPaginas ? "opacity-40 pointer-events-none" : "";
    paginacion.insertAdjacentHTML("beforeend", `
        <li>
            <button
                class="flex items-center justify-center px-4 h-10 ms-0 leading-tight bg-gradient-to-r from-[#408cd3] to-[#3f3dc8] rounded-r-lg ${sigBotonHabilitado}"
                data-page="next"
                data-pagination = "true">
                <svg xmlns="http://www.w3.org/2000/svg" fill="#fff" class="size-6"><path d="M10 18l6 -6l-6 -6v12" /></svg>
            </button>
        </li>
    `);

    // para cada click
    paginacion.querySelectorAll("button").forEach(btn => {
        // si no es de aqui 
        const esPaginacion = btn.dataset.pagination == "true";
        if (esPaginacion) {
            btn.addEventListener("click", () => {
                const page = btn.dataset.page;

                if (page === "prev") paginaActual--;
                else if (page === "next") paginaActual++;
                else paginaActual = Number(page);

                mostrarEventosPasados();
                cargarPaginacion();
            });
        }
    });

}

document.addEventListener("DOMContentLoaded", () => { loadUpcomingEvents(); loadPastEvents(); });
btnOrdenar.addEventListener("click", ordenarEventos);
inputBusqueda.addEventListener("input", filtrarBusqueda);