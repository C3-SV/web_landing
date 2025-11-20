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

function loadReasons(reasons) {
    const container = document.getElementById("eventDescriptionReasonsContainer");
    if (!container) return;

    container.innerHTML = "";

    reasons.forEach((reason) => {
        container.innerHTML += `
        <div class="relative pl-7 text-lg">
            <dt class="inline-flex items-center font-semibold text-[#61b3ff]">
                <i class="${reason.icon} mr-2 text-xl" style="-webkit-text-stroke:0.8px currentColor;"></i>
                ${reason.title}:
            </dt>
            <dd class="inline text-white ml-1">
                ${reason.text}
            </dd>
        </div>
        `;
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
        formBtn.href = data.formUrl || "#";
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
        secondFormButton.href = data.formUrl || "#";
    }

    console.log("Evento cargado correctamente.");
}

document.addEventListener("DOMContentLoaded", loadEvent);