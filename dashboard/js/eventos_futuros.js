import { db } from "../../js/firebase_config.js";
import { addDoc, collection, serverTimestamp, query, getDocs, getDoc, orderBy, updateDoc, doc, deleteDoc, where, Timestamp } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js';


import * as validations from "../../js/validations.js";

const COLLECTION_NAME = "events";
let events = [];

/**
 * Obtiene todos los eventos futuros desde Firestore.
 */
async function getAllUpcomingEvents() {
    try {
        const q = query(
            collection(db, COLLECTION_NAME), where("status", "==", "upcoming")
        );

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

    } catch (error) {
        console.error("Error obteniendo eventos:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Renderiza la tabla HTML con los datos almacenados en 'events'.
 */
async function renderTable() {
    const tableBody = document.getElementById("tableBody");

    // Muestra "cargando"
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4">Cargando...</td></tr>';

    const res = await getAllUpcomingEvents();

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

    if (res.data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No hay eventos registrados.</td></tr>';
        return;
    }

    res.data.forEach((event) => {
        const row = `
            <tr class="hover:bg-gray-50 transition-colors border-b border-gray-100">
                <td class="px-6 py-4 text-sm font-semibold text-gray-800">
                    ${event.title}
                </td>

                <td class="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                    ${event.date ? validations.formatDate(event.date) : 'Sin fecha'}
                </td>

                <td class="px-6 py-4">
                        <span class="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#004aad] to-[#4f1e5d] text-white">
                            ${event.modality}
                        </span>
                </td>

                <td class="px-6 py-4">
                        <span class="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#004aad] to-[#4f1e5d] text-white">
                            ${event.visibility ? 'Visible' : 'No visible'}
                        </span>
                </td>

                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex justify-center space-x-3">
                        <button class="btn-edit text-blue-600 hover:text-blue-800 transition-colors p-1" data-id="${event.id}">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                        <button class="btn-del text-red-600 hover:text-red-800 transition-colors p-1" data-id="${event.id}">
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

/**
 * Abre el modal y resetea el formulario.
 */
function openModal() {
    const modal = document.getElementById('modal');
    const form = document.getElementById('modalForm');
    const title = document.getElementById('modalTitle');

    modal.classList.remove('hidden');
    title.innerText = 'Agregar evento futuro';

    form.reset();
    document.getElementById('eventId').value = '';
    clearImagePreviews();

    // Resetear pestañas a la primera
    const firstTabBtn = document.querySelector('.tabBtn[data-target="tab-banner"]');
    if (firstTabBtn) firstTabBtn.click();
}

/**
 * Cierra el modal.
 */
function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

// Lógica de Pestañas (Tabs)
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tabBtn');
    const tabContents = document.querySelectorAll('.tabContent');

    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); // Prevenir submit si están dentro del form

            // 1. Resetear botones
            tabButtons.forEach(btn => {
                btn.className = "tabBtn text-gray-500 hover:text-gray-700 pb-2 border-b-2 border-transparent transition-colors cursor-pointer";
            });

            // 2. Ocultar contenidos
            tabContents.forEach(content => {
                content.classList.add('hidden');
            });

            // 3. Activar botón actual
            button.className = "tabBtn text-[#004aad] border-b-2 border-[#004aad] pb-2 font-bold transition-colors cursor-pointer";

            // 4. Mostrar contenido
            const targetId = button.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.remove('hidden');
            }
        });
    });
}

// Lógica para previsualización de imágenes
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

/**
 * Función para limpiar previsualizaciones de imágenes existentes.
 */
function clearImagePreviews() {
    // Selecciona todas las imágenes creadas dinámicamente con la clase .preview-image
    const previewElements = document.querySelectorAll('.preview-image');

    // Las elimina del DOM
    previewElements.forEach(el => el.remove());
}

// Otras partes del CRUD

/**
 * Captura y estructura los datos del formulario.
 */
function getEventFormData() {
    const form = document.getElementById('modalForm');
    const formData = new FormData(form);

    const dateString = formData.get('date');

    let firebaseDate = null;
    if (dateString) {
        const jsDate = new Date(dateString + 'T12:00:00');
        firebaseDate = Timestamp.fromDate(jsDate);
    }

    const eventData = {
        id: formData.get('id').trim(), // Si tiene ID es edición

        // Banner
        heroPrefix: formData.get('heroPrefix').trim(),
        title: formData.get('title').trim(),
        participantsText: formData.get('participantsText').trim(),
        summary: formData.get('summary').trim(),

        // Acerca de
        description: formData.get('description').trim(),

        // Detalles
        date: firebaseDate,
        modality: formData.get('modality').trim(),
        location: formData.get('location').trim(),
        awardsText: formData.get('awardsText').trim(),
        visibility: formData.get('visibility'),

        // Archivos
        bannerFile: formData.get('banner'),
        coverImageFile: formData.get('coverImage'),

        // Array de Razones
        reasons: []
    };

    // Procesar las 3 razones
    for (let i = 1; i <= 3; i++) {
        const title = formData.get(`reason_${i}_title`);
        const text = formData.get(`reason_${i}_text`);

        // Solo guardar si tiene minimo titulo
        if (title && title.trim() !== "") {
            eventData.reasons.push({
                order: parseInt(formData.get(`reason_${i}_order`)),
                icon: formData.get(`reason_${i}_icon`),
                title: title,
                text: text
            });
        }
    }

    return eventData;
}

async function addNewUpcomingEvent(eventData) {
    if (eventData.heroPrefix.trim() === "" ||
        eventData.title.trim() === "" ||
        eventData.participantsText.trim() === "" || eventData.summary.trim() === "" || eventData.description.trim() === "" || !eventData.date || eventData.modality.trim() === "" ||
        eventData.location.trim() === "" || eventData.awardsText.trim() === "" || eventData.reasons.length === 0 || !eventData.bannerFile || !eventData.coverImageFile) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            html: `
        Por favor, completa todos los campos obligatorios marcados con un asterisco <b>(*)</b>.
        <br><br>
        <b>(Consejo: Revisa todas las pestañas)</b>
    `,
            confirmButtonText: "Ok",
            buttonsStyling: false,
            customClass: {
                confirmButton: "bg-gradient-to-r from-[#004aad] to-[#3f3dc8] text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg"
            }
        });
        return { success: false, error: 'Campos incompletos' };
    }

    try {
        Swal.fire({
            title: 'Guardando evento...',
            text: 'Subiendo imágenes y procesando datos',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Subir archivos a cloudinary
        const [bannerUrl, coverImageUrl] = await Promise.all([
            eventData.bannerFile ? validations.uploadImageToCloudinary(eventData.bannerFile) : Promise.resolve(null),
            eventData.coverImageFile ? validations.uploadImageToCloudinary(eventData.coverImageFile) : Promise.resolve(null)
        ]);

        const isVisible = eventData.visibility === "visible";

        const firestoreData = {
            // Seccion banner
            heroPrefix: eventData.heroPrefix,
            title: eventData.title,
            participantsText: eventData.participantsText,
            summary: eventData.summary,
            banner: bannerUrl || "",

            // Seccion acerca de
            description: eventData.description,
            coverImage: coverImageUrl || "",

            // Seccion detalles
            date: eventData.date,
            modality: eventData.modality,
            location: eventData.location,
            awardsText: eventData.awardsText,
            visibility: isVisible,

            // Metadata
            createdAt: serverTimestamp(),
            status: "upcoming"
        };

        const docRef = await addDoc(collection(db, COLLECTION_NAME), firestoreData);

        const reasonsRef = collection(db, COLLECTION_NAME, docRef.id, "reasons");

        const reasonsPromises = eventData.reasons.map(reason => {
            return addDoc(reasonsRef, {
                title: reason.title,
                text: reason.text,
                icon: reason.icon,
                order: reason.order
            });
        });

        await Promise.all(reasonsPromises);

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: '¡Éxito!',
            text: 'El evento se ha creado correctamente.',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });

        return { success: true };

    } catch (error) {
        console.error("Error agregando evento: ", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al crear el evento. ',
            confirmButtonText: "Ok",
            buttonsStyling: false,
            customClass: {
                confirmButton: "bg-gradient-to-r from-[#004aad] to-[#3f3dc8] text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg"
            }
        });
        return { success: false, error: error.message };
    }
}

async function deleteUpcomingEvent(id) {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        html: "Se eliminará el evento y sus datos asociados.<br><b>No podrás revertir esta acción.</b>",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        buttonsStyling: false,
        customClass: {
            confirmButton: "bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 mr-2",
            cancelButton: "bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300"
        }
    });

    if (!result.isConfirmed) return;

    Swal.fire({
        title: 'Eliminando...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const eventDocRef = doc(db, COLLECTION_NAME, id);

        const reasonsRef = collection(db, COLLECTION_NAME, id, "reasons");
        const reasonsSnapshot = await getDocs(reasonsRef);

        const deleteReasonsPromises = [];
        reasonsSnapshot.forEach((docReason) => {
            deleteReasonsPromises.push(deleteDoc(docReason.ref));
        });

        await Promise.all(deleteReasonsPromises);

        await deleteDoc(eventDocRef);

        // 3. Éxito visual
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Eliminado',
            text: 'El evento ha sido eliminado correctamente.',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });

        await renderTable();

    } catch (error) {
        console.error("Error eliminando evento:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar el evento: ',
            confirmButtonText: "Ok",
            buttonsStyling: false,
            customClass: {
                confirmButton: "bg-gradient-to-r from-[#004aad] to-[#3f3dc8] text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg"
            }
        });
    }
}

// ==========================================
// 6. INICIALIZACIÓN (DOM READY)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    // Cargar datos iniciales
    renderTable();

    // Configurar pestañas
    setupTabs();

    // Listeners de Botones Estáticos (Agregar, Cerrar)
    const btnAgregar = document.getElementById('btnAgregar');
    if (btnAgregar) btnAgregar.addEventListener('click', openModal);

    const btnCerrar = document.getElementById('btnCerrarModal');
    if (btnCerrar) btnCerrar.addEventListener('click', closeModal);

    const btnCancelar = document.getElementById('btnCancelarFooter');
    if (btnCancelar) btnCancelar.addEventListener('click', closeModal);

    setupImagePreview('banner');
    setupImagePreview('coverImage');

    const tableBody = document.getElementById('tableBody');

    if (tableBody) {
        tableBody.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            const id = btn.dataset.id;

            if (btn.classList.contains('btn-edit')) {
                // Aca se carga el modal para editar
            }
            else if (btn.classList.contains('btn-del')) {
                deleteUpcomingEvent(id);
            }
        });
    }

    // Manejo del Submit del Formulario
    const form = document.getElementById('modalForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const eventData = getEventFormData();

        if (eventData.id) {
            // Lógica de ACTUALIZAR (La haremos después)
            console.log("Actualizando evento...", eventData.id);
            // await updateEvent(eventData);
        } else {
            // Aca crea
            const res = await addNewUpcomingEvent(eventData);

            if (res.success) {
                closeModal();
                renderTable();
            }
        }
    });
});