// Firebase y datos 
import { db } from "../../js/firebase_config.js";
import {
    doc,
    collection,
    getDoc,
    updateDoc,
    getDocs,
    where,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

let events = [];
let editingId = null;

// formato de fecha 

function formatearFecha(timestamp) {
    try {
        const date = timestamp.toDate();
        return date.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        });
    } catch {
        return "—";
    }
}

// cargar eventos 

async function loadEvents() {
    const ref = collection(db, "events");
    const q = query(ref, where("status", "==", "finished"), orderBy("date", "asc"));
    const snapshot = await getDocs(q);

    events = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
    }));

    renderTable();
}

// Función para mostrar la tabla 

function renderTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    events.forEach(event => {
        const row = `
                <tr class="hover:bg-gray-50 transition-colors border-b border-gray-100">
                    
                    <td class="px-6 py-4 text-sm text-gray-900">
                        ${event.id}
                    </td>

                    <td class="px-6 py-4 text-sm font-semibold text-gray-800">
                        ${event.title}
                    </td>

                    <td class="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        ${formatearFecha(event.date)}
                    </td>

                    <td class="px-6 py-4">
                            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#004aad] to-[#4f1e5d] text-white">
                                ${event.modality}
                            </span>
                    </td>

                    <td class="px-6 py-4">
                            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#004aad] to-[#4f1e5d] text-white">
                                ${event.status}
                            </span>
                    </td>

                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex justify-center space-x-3">
                            <button onclick="editEvent('${event.id}')" class="text-blue-600 hover:text-blue-800 transition-colors p-1">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                            </button>
                            <button onclick="deleteEvent('${event.id}')" class="text-red-600 hover:text-red-800 transition-colors p-1">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        tableBody.innerHTML += row;
    });
}

// Funciones del Modal y tabs 
function openModal() {
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('modalForm').reset();

    document.querySelectorAll(".tabContent").forEach(c => c.classList.add("hidden"));
    document.querySelector("#tab-general").classList.remove("hidden");

    document.querySelectorAll(".tabBtn").forEach(b => b.classList.remove("activeTab"));
    document.querySelector('.tabBtn[data-tab="tab-general"]').classList.add("activeTab");
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}


async function editEvent(id) {
    editingId = id;

    console.log("EDITANDO EVENTO:", id);

    const ref = doc(db, "events", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        console.error("Evento no encontrado");
        return;
    }

    const data = snap.data();
    openModal();

    //*  Cargar informacion
    //! TAB 1 
    document.getElementById("eventId").value = id;
    document.getElementById("eventPrefix").value = data.heroPrefix;
    document.getElementById("eventTitle").value = data.title || "";
    document.getElementById("eventSubtitle").value = data.subtitle || "";
    document.getElementById("eventDescription").value = data.description || "";

    document.getElementById("eventModality").value = data.modality || "presencial";
    document.getElementById("eventLocation").value = data.location || "";
    document.getElementById("eventPrizes").value = data.awardsText || "";

    // Fecha 
    if (data.date?.toDate) {
        const d = data.date.toDate();
        document.getElementById("eventDate").value = d.toISOString().split("T")[0];
    }

    //! RAZONES -- PENDIENTE DE APLICAR, CONSULTAR ESTRUCTURA 
}

document.getElementById("modalForm").addEventListener("submit", async(element) => {
    element.preventDefault(); 

    if (!editingId) return;

    const ref = doc(db, "events", editingId); 

    const updated = {
        heroPrefix: document.getElementById("eventPrefix").value,
        title: document.getElementById("eventTitle").value,
        subtitle: document.getElementById("eventSubtitle").value,
        description: document.getElementById("eventDescription").value,

        date: new Date(document.getElementById("eventDate").value),
        modality: document.getElementById("eventModality").value,
        location: document.getElementById("eventLocation").value,
        awardsText: document.getElementById("eventPrizes").value
    }

    await updateDoc(ref, updated);
    closeModal();
    loadEvents(); 
});

function deleteEvent(id) {
    if (confirm('¿Borrar evento?')) {
        events = events.filter(e => e.id !== id);
        renderTable();
    }
}

function iniciarTabs() {
    const tabButtons = document.querySelectorAll(".tabBtn");
    const tabContents = document.querySelectorAll(".tabContent");

    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.dataset.tab;

            // quitar estado anterior
            tabButtons.forEach(b => b.classList.remove("activeTab"));
            tabContents.forEach(c => c.classList.add("hidden"));

            // activar el nuevo
            btn.classList.add("activeTab");
            document.getElementById(targetTab).classList.remove("hidden");
        });
    });
}

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
    loadEvents(), iniciarTabs();
});

window.openModal = openModal;
window.closeModal = closeModal;
window.editEvent = editEvent;
window.deleteEvent = deleteEvent;
