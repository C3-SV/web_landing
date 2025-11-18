import { db } from "./firebase_config.js";
import {
    doc, getDocs, collection, getDoc, query, where, orderBy
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";


function getEventIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text || "";
}

function setHTML(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html || "";
}

function setImage(id, url) {
    const el = document.getElementById(id);
    if (el) el.src = url || "assets/images/hackathon.jpg";
}

const reasonsIcons = [
    `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#61b3ff" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" class="absolute top-1 left-1 size-6">
        <path d="M15.5 13a3.5 3.5 0 0 0 -3.5 3.5v1a3.5 3.5 0 0 0 7 0v-1.8"/>
        <path d="M8.5 13a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1 -7 0v-1.8"/>
        <path d="M17.5 16a3.5 3.5 0 0 0 0 -7h-.5"/>
        <path d="M19 9.3v-2.8a3.5 3.5 0 0 0 -7 0"/>
        <path d="M6.5 16a3.5 3.5 0 0 1 0 -7h.5"/>
        <path d="M5 9.3v-2.8a3.5 3.5 0 0 1 7 0v10"/>
    </svg>
    `,
    `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#61b3ff" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" class="absolute top-1 left-1 size-6">
        <path d="M6 9a6 6 0 1 0 12 0a6 6 0 0 0 -12 0" />
        <path d="M12 3c1.333 .333 2 2.333 2 6s-.667 5.667 -2 6" />
        <path d="M12 3c-1.333 .333 -2 2.333 -2 6s.667 5.667 2 6" />
        <path d="M6 9h12" />
        <path d="M3 20h7" />
        <path d="M14 20h7" />
        <path d="M10 20a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
        <path d="M12 15v3" />
    </svg>
    `,
    `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#61b3ff" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" class="absolute top-1 left-1 size-6">
        <path d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2z"/>
        <path d="M16 6a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2z"/>
        <path d="M9 18a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6z"/>
    </svg>
    `
];
function loadReasons(reasons) {
    const container = document.getElementById("eventDescriptionReasonsContainer");
    if (!container) return;

    container.innerHTML = "";

    reasons.forEach((reason, index) => {
        const icono = reasonsIcons[index % reasonsIcons.length];
        container.insertAdjacentHTML(
            "beforeend",
            `
            <div class="relative pl-9 text-lg">
                <dt class="inline font-semibold text-[#61b3ff]">
                    ${icono}
                    ${reason.title}:
                </dt>
                <dd class="inline text-white">
                    ${reason.text}
                </dd>
            </div>
            `
        );
    });
}

async function loadEvent() {
    const eventId = getEventIdFromURL();

    if (!eventId) {
        console.error("No hay id en URL");
        return;
    }

    const ref = doc(db, "events", eventId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        console.error("El evento no existe en Firestore.");
        return;
    }

    const data = snap.data();

    // HERO 
    setImage("eventHeroImg", data.banner || data.coverImage);
    setText("eventHeroPrefix", data.heroPrefix || "Participa en la");
    setText("eventHeroTitle", data.title || "Evento");
    setText("eventHeroSubtitle", data.participantsText || "");

    // Hero - reasons 
    const reasonsRef = collection(db, "events", eventId, "reasons");
    const q = query(reasonsRef, orderBy("order", "asc"));
    const reasonsSnap = await getDocs(q);

    const reasons = reasonsSnap.docs.map(doc => doc.data());

    loadReasons(reasons);

    // Hero - inscripcion 
    const formBtn = document.getElementById("eventHeroLink");
    if (formBtn) {
        formBtn.href = data.formLink || "#";
    }

    // INFORMACION DEL EVENTO 

    setText("eventDescriptionText", data.description || data.summary || "Sin descripción.");
    setImage("eventDescriptionImg", data.coverImage || data.banner);

    // DETALLES
    setText("eventLocation", data.location || "Por definir");
    setText("eventModalidad", data.modality || "Por definir");
    setText("eventAwards", data.awardsText || "Por definir");

    // Segundo boton de inscripcion 
    const secondFormButton = document.getElementById("inscriptionForm");
    if (secondFormButton) {
        secondFormButton.href = data.formLink || "#";
    }

    console.log("Evento cargado correctamente.");
}

document.addEventListener("DOMContentLoaded", loadEvent);
