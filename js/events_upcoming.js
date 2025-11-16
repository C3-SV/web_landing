//! Para mostrar proximos eventos en el sitio events.html
import { collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js"
import { db } from "./firebase_config.js"

const containerUpcomingEvents = document.getElementById("upcomingEventsContainer");

// CalcularFecha 

function CalcularFecha(tiempo){
    try { 
    const date = tiempo.toDate();
    const fechaBreve = {year: 'numeric', month: 'long'};
    let fecha =  date.toLocaleDateString('es-ES', fechaBreve).toString(); 
    fecha = fecha[0].toUpperCase() + fecha.slice(1);
    return fecha;
    } catch {
        return "";
    }
}
// Crear tarjeta 

function crearTarjeta(eventId, eventData) {
    const {
        title,
        summary,
        shortDescription,
        categories = [],
        banner,
        coverImage,
        date
    } = eventData;
    console.log(date);
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
    
// Cargar eventos 

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
        const tarjeta = crearTarjeta(doc.id, doc.data());
        containerUpcomingEvents.insertAdjacentHTML("beforeend", tarjeta);
    });
} catch(error){
    console.log("Error cargando eventos", error); 
    containerUpcomingEvents.innerHTML = `
        <p class="text-white text-xl text-center col-span-3">Error cargando eventos. </p>;
        `
}
}

document.addEventListener("DOMContentLoaded", loadUpcomingEvents);