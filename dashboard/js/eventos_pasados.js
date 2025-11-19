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
    orderBy,
    addDoc,
    deleteDoc,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

import * as validations from "../../js/validations.js";

import * as structure from "./modules/structure.js";

const COLLECTION_NAME = "events";
let events = [];
let editingId = null;

//! 0. UTILIDADES 

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

//! 1. Cargar datos 

async function loadEvents() {
    try {
        const ref = collection(db, COLLECTION_NAME);
        const q = query(ref, where("status", "==", "finished"), orderBy("date", "asc"));
        const res = await getDocs(q);

        events = [];
        res.forEach((doc) => {
            const data = doc.data();
            events.push({
                id: doc.id,
                ...data,
            });
        });

        return { success: true, data: events };
    } catch (err) {
        console.error("Error cargando eventos", err);
        return { success: false, error: err.message };

    }
}


//! 2. Mostrar datos -- Tabla 

async function renderTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    const res = await loadEvents();

    // Cargando...
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4">Cargando...</td></tr>';

    // si falla 

    if (!res.success) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudieron cargar los eventos",
            confirmButtonText: "Ok",
            buttonsStyling: false,
            customClass: {
                confirmButton: "bg-gradient-to-r from-[#004aad] to-[#3f3dc8] text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg"
            }
        });
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-red-500">Error al cargar datos</td></tr>';
        return;
    }

    tableBody.innerHTML = "";

    // Si no hay
    if (res.data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No hay eventos registrados.</td></tr>';
        return;
    }

    // Si hay, mostrar
    res.data.forEach(event => {
        const row = `
                <tr class="hover:bg-gray-50 transition-colors border-b border-gray-100">
                    
                    <td class="px-6 py-4 text-sm text-gray-900">
                        ${event.id}
                    </td>

                    <td class="px-6 py-4 text-sm font-semibold text-gray-800">
                        ${event.title}
                    </td>

                    <td class="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        ${event.date ? formatearFecha(event.date) : 'Sin fecha'}
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

//! 3. GESTION DEL MODAL  - abrir, cerrar, 
// Abrir y resetear 
function openModal() {
    const modal = document.getElementById('modal');
    const form = document.getElementById('modalForm');
    const title = document.getElementById('modalTitle');

    modal.classList.remove('hidden');
    title.innerText = 'Agregar evento pasado';
    form.reset();
    document.getElementById('eventId').value = '';

    clearImagePreviews();

    // Ir a primera tab 
    const firstTabBtn = document.querySelector('.tabBtn[data-target="tab-general"]');
    if (firstTabBtn) firstTabBtn.click();
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}




//! 4. Llenar el formulario con datos + Editar

//* TAB 1 -- General 
// Dentro de tab 1 -- reasons 
async function loadReasons(eventId) {
    const reasonsRef = collection(db, COLLECTION_NAME, eventId, "reasons");
    const q = query(reasonsRef, orderBy("order", "asc"));
    const res = await getDocs(q);

    const reasons = [];
    res.forEach(doc => {
        reasons.push({
            id: doc.id,
            ...doc.data()
        });
    });

    return reasons;
}
function fillGeneralTab(data) {
    document.getElementById("eventPrefix").value = data.heroPrefix || "";
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

}

function fillGeneralImages(data) {
    const container = document.getElementById("eventImage").closest("label");
    clearImagePreviews();

    if (data.banner) {
        const img = document.createElement('img');
        img.src = data.banner;
        img.className = 'preview-image absolute inset-0 w-full h-full object-cover rounded-lg z-10';
        container.appendChild(img);
    }
}

function fillReasons(reasons) {
    const fields = [
        { icon: "reason1Icon", title: "reason1Title", desc: "reason1Description" },
        { icon: "reason2Icon", title: "reason2Title", desc: "reason2Description" },
        { icon: "reason3Icon", title: "reason3Title", desc: "reason3Description" },
    ];

    fields.forEach(f => {
        document.getElementById(f.icon).value = "";
        document.getElementById(f.title).value = "";
        document.getElementById(f.desc).value = "";
    });

    // Llenar según orden
    reasons.forEach((r, idx) => {
        if (idx >= 3) return;
        document.getElementById(fields[idx].icon).value = r.icon || "";
        document.getElementById(fields[idx].title).value = r.title || "";
        document.getElementById(fields[idx].desc).value = r.text || "";
    });
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
    //! TAB GENERAL

    fillGeneralTab(data);
    fillGeneralImages(data);
    const reasons = await loadReasons(id);
    fillReasons(reasons);

    // TODO: El resto de tabs + reazons
}

//! 5. Crud -- guardar cambios y eliminar 

// tomar reasons para guardar y guardar Reasons 
function getReasonsFromForm() {
    const data = [
        {
            icon: document.getElementById("reason1Icon").value,
            title: document.getElementById("reason1Title").value.trim(),
            text: document.getElementById("reason1Description").value.trim(),
            order: 1
        },
        {
            icon: document.getElementById("reason2Icon").value,
            title: document.getElementById("reason2Title").value.trim(),
            text: document.getElementById("reason2Description").value.trim(),
            order: 2
        },
        {
            icon: document.getElementById("reason3Icon").value,
            title: document.getElementById("reason3Title").value.trim(),
            text: document.getElementById("reason3Description").value.trim(),
            order: 3
        }
    ]
    return data.filter(r =>
        r.title !== "" || r.text !== "" || r.icon !== ""
    );
}

async function guardarRazones(eventId, reasons) {
    const reasonsRef = collection(db, COLLECTION_NAME, eventId, "reasons");

    // 1. Borrar todas las razones previas
    const existing = await getDocs(reasonsRef);
    const deletions = existing.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletions.map(d => d.catch(() => { }))); 

    // 2. Crear nuevas
    const creates = reasons.map(r => addDoc(reasonsRef, r));
    await Promise.all(creates);
}

// on submit para guardar 
document.getElementById("modalForm").addEventListener("submit", async (element) => {
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

    //* Guardar razones 
    const reasons = getReasonsFromForm();
    try {
        await guardarRazones(editingId, reasons);
    } catch (err) {
        console.error("Error guardando razones", err);
    }
    closeModal();
    renderTable();
});


// Eliminar evento 
function deleteEvent(id) {
    if (confirm('¿Borrar evento?')) {
        events = events.filter(e => e.id !== id);
        renderTable();
    }
}



//! 6. Gestion de imagenes 

function clearImagePreviews() {
    // Selecciona todas las imágenes creadas dinámicamente con la clase .preview-image
    const previewElements = document.querySelectorAll('.preview-image');

    // Las elimina del DOM
    previewElements.forEach(el => el.remove());
}


const setupImagePreview = (inputId) => {
    const input = document.getElementById(inputId);
    const container = input.closest('label');

    if (!input || !container) return;

    container.classList.add('relative', 'overflow-hidden');

    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) {
            // Si no hay archivo, remover la previsualización existente
            const oldPreview = container.querySelector('.preview-image');
            if (oldPreview) oldPreview.remove();
            return;
        }

        const oldPreview = container.querySelector('.preview-image');
        if (oldPreview) oldPreview.remove();

        const imageUrl = URL.createObjectURL(file);

        const img = document.createElement('img');
        img.src = imageUrl;
        img.className = 'preview-image absolute inset-0 w-full h-full object-cover rounded-lg z-10';

        container.appendChild(img);
    });
};


//! DOM + init + tabs

// Logica de Tabs 
function setupTabs() {
    const tabButtons = document.querySelectorAll(".tabBtn");
    const tabContents = document.querySelectorAll(".tabContent");

    tabButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();

            // Resetear clase de botones
            tabButtons.forEach(btn => {
                btn.className = "tabBtn text-gray-500 hover:text-gray-700 pb-2 border-b-2 border-transparent transition-colors cursor-pointer";
            });

            // Ocultar todos 
            tabContents.forEach(c => c.classList.add("hidden"));

            // Activar boton actual 
            btn.className = "tabBtn text-[#004aad] border-b-2 border-[#004aad] pb-2 font-bold transition-colors cursor-pointer";
            const targetTab = btn.dataset.tab;

            // Mostrar contenido
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.remove('hidden');
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    renderTable();
    setupTabs();

    // Listener de botones 

    // Imagenes 
    setupImagePreview('eventImage');

});

window.openModal = openModal;
window.closeModal = closeModal;
window.editEvent = editEvent;
window.deleteEvent = deleteEvent;
