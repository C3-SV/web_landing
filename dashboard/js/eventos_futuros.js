import { db } from "../../js/firebase_config.js";
import { addDoc, collection, serverTimestamp, query, getDocs, getDoc, orderBy, updateDoc, doc, deleteDoc, where, Timestamp } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js';


import * as validations from "../../js/validations.js";

const COLLECTION_NAME = "events";
let events = [];
let filteredEvents = [];
let currentPage = 1;
const itemsPerPage = 5;

/**
 * Obtiene todos los eventos futuros desde Firestore.
 */
async function getAllUpcomingEvents() {
    try {
        const q = query(
            collection(db, COLLECTION_NAME), where("status", "==", "upcoming")
        );

        const res = await getDocs(q);

        res.forEach((doc) => {
            const data = doc.data();
            events.push({
                id: doc.id,
                ...data,
            });
        });

        filteredEvents = [...events];
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
    tableBody.innerHTML = "";

    if (filteredEvents.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-gray-500">No se encontraron eventos.</td></tr>';
        renderPagination(); // Actualizar paginación a vacío
        return;
    }

    // Lógica de Paginación
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

    paginatedEvents.forEach((event) => {
        // Badges
        const row = `<tr class="hover:bg-gray-50 transition-colors border-b border-gray-100">
                <td class="px-6 py-4 text-sm font-semibold text-gray-800 truncate">
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
<td class="px-6 py-4 whitespace-nowrap text-center">
        <div class="flex justify-center space-x-3 opacity-80 group-hover:opacity-100 transition-opacity">
            
            <button class="btn-finish text-[#3F95E2] hover:text-blue-600 p-1 transition-transform hover:scale-110" data-id="${event.id}" title="Marcar como finalizado">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </button>

            <button class="btn-edit text-blue-600 hover:text-blue-800 p-1 transition-transform hover:scale-110" data-id="${event.id}" title="Editar">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            </button>
            
            <button class="btn-del text-red-600 hover:text-red-800 p-1 transition-transform hover:scale-110" data-id="${event.id}" title="Eliminar">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
        </div>
    </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });

    renderPagination();
}

function renderPagination() {
    const paginationContainer = document.querySelector('.mt-6.flex.justify-center');
    if (!paginationContainer) return;

    const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let buttonsHTML = '<div class="flex space-x-2" id="pagination-wrapper">';

    // Botón Anterior
    const prevDisabled = currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50';
    buttonsHTML += `
        <button data-page="${currentPage - 1}" class="pagination-btn px-4 py-2 bg-white border border-gray-300 rounded-lg transition ${prevDisabled}" ${currentPage === 1 ? 'disabled' : ''}>
            Anterior
        </button>
    `;

    // Números de página
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            // Página Activa (Sin data-page porque ya estamos ahí)
            buttonsHTML += `<button class="px-4 py-2 bg-gradient-to-r from-[#004aad] to-[#3f3dc8] text-white rounded-lg shadow-md cursor-default">${i}</button>`;
        } else {
            // Otras Páginas
            buttonsHTML += `<button data-page="${i}" class="pagination-btn px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">${i}</button>`;
        }
    }

    // Botón Siguiente
    const nextDisabled = currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50';
    buttonsHTML += `
        <button data-page="${currentPage + 1}" class="pagination-btn px-4 py-2 bg-white border border-gray-300 rounded-lg transition ${nextDisabled}" ${currentPage === totalPages ? 'disabled' : ''}>
            Siguiente
        </button>
    `;

    buttonsHTML += '</div>';
    paginationContainer.innerHTML = buttonsHTML;
}

let availableCategories = [];

async function loadCategories() {
    const categoryList = document.getElementById('categoryList');

    try {
        const q = query(collection(db, "categories"), orderBy("name", "asc"));
        const querySnapshot = await getDocs(q);

        availableCategories = [];
        querySnapshot.forEach((doc) => {
            availableCategories.push({
                id: doc.id,
                ...doc.data()
            });
        });

        categoryList.innerHTML = '';

        if (availableCategories.length === 0) {
            categoryList.innerHTML = '<li class="p-2 text-gray-500 text-xs">No hay categorías disponibles</li>';
            return;
        }

        availableCategories.forEach(cat => {
            const li = document.createElement('li');
            li.innerHTML = `
                <label class="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                    <input 
                        type="checkbox" 
                        value="${cat.id}" 
                        data-name="${cat.name}"
                        class="category-checkbox w-4 h-4 text-[#004aad] bg-gray-100 border-gray-300 rounded focus:ring-[#004aad] focus:ring-2"
                    >
                    <span class="ml-2">${cat.name}</span>
                </label>
            `;
            categoryList.appendChild(li);
        });

        setupMultiSelectLogic();

    } catch (error) {
        console.error("Error cargando categorías:", error);
        categoryList.innerHTML = '<li class="p-2 text-red-500 text-xs">Error al cargar</li>';
    }
}

function setupMultiSelectLogic() {
    const btnText = document.getElementById('categoryBtnText');
    const checkboxes = document.querySelectorAll('.category-checkbox');

    const updateButtonText = () => {
        const selected = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.getAttribute('data-name'));

        if (selected.length === 0) {
            btnText.innerText = "Seleccionar categorías...";
            btnText.classList.add("text-gray-500");
            btnText.classList.remove("text-gray-900");
        } else {
            if (selected.length > 2) {
                btnText.innerText = `${selected.length} seleccionadas`;
            } else {
                btnText.innerText = selected.join(", ");
            }
            btnText.classList.remove("text-gray-500");
            btnText.classList.add("text-gray-900");
        }
    };

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateButtonText);
    });
}

function initMultiSelectUI() {
    const btn = document.getElementById('categoryBtn');
    const dropdown = document.getElementById('categoryDropdown');
    const searchInput = document.getElementById('categorySearch');
    const wrapper = document.getElementById('category-wrapper');

    btn.addEventListener('click', () => {
        dropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const listItems = document.querySelectorAll('#categoryList li');

        listItems.forEach(item => {
            const text = item.innerText.toLowerCase();
            if (text.includes(term)) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
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
 *  Buscador
 */

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();

        filteredEvents = events.filter(event =>
            event.title.toLowerCase().includes(searchTerm) ||
            event.modality.toLowerCase().includes(searchTerm)
        );

        currentPage = 1;
        renderTable();
    });
}

/**
 * Captura y estructura los datos del formulario.
 */
function getEventFormData() {
    const form = document.getElementById('modalForm');
    const formData = new FormData(form);

    // Procesamiento de fecha para Firebase
    const dateString = formData.get('date');
    let firebaseDate = null;
    let rawDate = null; // Fecha cruda para validación

    if (dateString) {
        const jsDate = new Date(dateString + 'T12:00:00');
        firebaseDate = Timestamp.fromDate(jsDate);
        rawDate = new Date(dateString + 'T00:00:00');
    }

    // Captura de categorias
    const selectedCategories = [];
    document.querySelectorAll('.category-checkbox:checked').forEach(cb => {
        selectedCategories.push(
            cb.getAttribute('data-name')
        );
    });

    const eventData = {
        id: formData.get('id').trim(),

        // Banner
        heroPrefix: formData.get('heroPrefix').trim(),
        title: formData.get('title').trim(),
        participantsText: formData.get('participantsText').trim(),
        summary: formData.get('summary').trim(),

        // Acerca de
        description: formData.get('description').trim(),

        // Detalles
        date: firebaseDate,
        rawDate: rawDate, // Usado solo para validación
        modality: formData.get('modality').trim(),
        location: formData.get('location').trim(),
        awardsText: formData.get('awardsText').trim(),
        visibility: formData.get('visibility'),

        // Archivos
        bannerFile: formData.get('banner'),
        coverImageFile: formData.get('coverImage'),

        // Arrays
        reasons: [],
        categories: selectedCategories // <--- NUEVO CAMPO
    };

    // Procesar las 3 razones
    for (let i = 1; i <= 3; i++) {
        const title = formData.get(`reason_${i}_title`);
        const text = formData.get(`reason_${i}_text`);

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

function validateEventData(data) {
    // 1. Validación de Campos de Texto y Archivos (General)
    const isNew = !data.id;
    if (
        data.heroPrefix === "" ||
        data.title === "" ||
        data.participantsText === "" ||
        data.description === "" ||
        !data.date ||
        data.location === "" ||
        data.awardsText === "" ||
        (isNew && (!data.bannerFile || data.bannerFile.size === 0)) ||
        (isNew && (!data.coverImageFile || data.coverImageFile.size === 0))
    ) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            html: `Por favor, completa todos los campos obligatorios marcados con asterisco <b>(*)</b>, incluyendo imágenes. <br> <b> Consejo: </b> Revisa todas las pestañas.`,
            confirmButtonText: "Ok",
            buttonsStyling: false,
            customClass: { confirmButton: "bg-gradient-to-r from-[#004aad] to-[#3f3dc8] text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg" }
        });
        return false;
    }

    // 2. Validación de Fecha (No permitir pasado)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (data.rawDate && data.rawDate < today) {
        Swal.fire({
            icon: 'warning',
            title: 'Fecha inválida',
            text: 'No puedes crear un evento futuro con una fecha anterior al día de hoy.',
            confirmButtonText: "Corregir",
            buttonsStyling: false,
            customClass: { confirmButton: "bg-gradient-to-r from-[#004aad] to-[#3f3dc8] text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg" }
        });
        return false;
    }

    // 3. Validación de Razones (Al menos una)
    if (data.reasons.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'Faltan Razones',
            html: `Debes agregar al menos una <b>razón</b> para asistir al evento.<br>(Pestaña: <b>Acerca de</b>)`,
            confirmButtonText: "Ir a razones",
            buttonsStyling: false,
            customClass: { confirmButton: "bg-gradient-to-r from-[#004aad] to-[#3f3dc8] text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg" }
        }).then(() => {
            // Opcional: Cambiar automáticamente a la pestaña
            document.querySelector('.tabBtn[data-target="tab-about"]').click();
        });
        return false;
    }

    // 4. Validación de Categorías (Al menos una)
    if (data.categories.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'Sin Categorías',
            html: `Debes seleccionar al menos una <b>categoría</b> para el evento.<br>(Pestaña: <b>Detalles</b>)`,
            confirmButtonText: "Ir a categorías",
            buttonsStyling: false,
            customClass: { confirmButton: "bg-gradient-to-r from-[#004aad] to-[#3f3dc8] text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg" }
        }).then(() => {
            document.querySelector('.tabBtn[data-target="tab-details"]').click();
        });
        return false;
    }

    return true;
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
            categories: eventData.categories,
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

async function getUpcomingEvent(id) {
    const event = events.find(e => e.id === id);
    if (!event) return;

    openModal();

    document.getElementById('modalTitle').innerText = 'Editar Evento';
    document.getElementById('eventId').value = event.id;

    // Pestaña Banner
    document.getElementById('heroPrefix').value = event.heroPrefix || '';
    document.getElementById('title').value = event.title || '';
    document.getElementById('participantsText').value = event.participantsText || '';
    document.getElementById('summary').value = event.summary || '';

    // Pestaña Acerca de
    document.getElementById('description').value = event.description || '';

    // Pestaña Detalles
    document.getElementById('modality').value = event.modality || 'Presencial';
    document.getElementById('location').value = event.location || '';
    document.getElementById('awardsText').value = event.awardsText || '';

    // Visibilidad (Convertir booleano a string del select)
    document.getElementById('visibility').value = event.visibility ? 'visible' : 'not_visible';

    // Fecha (convertir el timestamp)
    if (event.date && event.date.toDate) {
        const dateObj = event.date.toDate();
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        document.getElementById('date').value = `${year}-${month}-${day}`;
    }

    //Previsualizar imagenes
    const showExistingImage = (inputId, imageUrl) => {
        if (!imageUrl) return;

        const input = document.getElementById(inputId);
        const container = input.closest('label');

        const oldImg = container.querySelector('.preview-image');
        if (oldImg) oldImg.remove();

        const img = document.createElement('img');
        img.src = imageUrl;
        img.className = 'preview-image absolute inset-0 w-full h-full object-cover rounded-lg z-10';

        container.appendChild(img);
        container.classList.add('relative', 'overflow-hidden');
    };

    //Mostrar con las url
    showExistingImage('banner', event.banner);
    showExistingImage('coverImage', event.coverImage);

    //Razones ordenadas según "order"
    try {
        const reasonsRef = collection(db, COLLECTION_NAME, id, "reasons");

        const q = query(reasonsRef, orderBy("order", "asc"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log("Este evento no tiene razones guardadas.");
        }

        querySnapshot.forEach((doc) => {
            const reason = doc.data();
            const slot = reason.order;

            if (slot && slot <= 3) {
                const titleInput = document.getElementById(`reason_${slot}_title`);
                const textInput = document.getElementById(`reason_${slot}_text`);
                const iconInput = document.getElementById(`reason_${slot}_icon`);

                if (titleInput) titleInput.value = reason.title || '';
                if (textInput) textInput.value = reason.text || '';
                if (iconInput) iconInput.value = reason.icon || 'trophy';
            }
        });
    } catch (error) {
        Swal.fire({
            toast: true,
            icon: 'warning',
            title: 'Alerta',
            text: 'No se pudieron cargar los detalles de las razones.',
            confirmButtonText: "Ok",
            buttonsStyling: false,
            customClass: {
                confirmButton: "bg-gradient-to-r from-[#004aad] to-[#3f3dc8] text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg"
            }
        });
    }

    //Marcar las categorias
    const checkboxes = document.querySelectorAll('.category-checkbox');

    checkboxes.forEach(cb => cb.checked = false);

    if (event.categories && Array.isArray(event.categories)) {
        event.categories.forEach(catName => {
            const checkbox = document.querySelector(`.category-checkbox[data-name="${catName}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
    }

    if (checkboxes.length > 0) {
        checkboxes[0].dispatchEvent(new Event('change'));
    }
}

async function updateExistingEvent(eventData) {
    try {
        Swal.fire({
            title: 'Actualizando...',
            text: 'Procesando cambios',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        const currentEvent = events.find(e => e.id === eventData.id);

        let bannerUrl = currentEvent.banner;
        if (eventData.bannerFile && eventData.bannerFile.size > 0) {
            bannerUrl = await validations.uploadImageToCloudinary(eventData.bannerFile);
        }

        let coverImageUrl = currentEvent.coverImage;
        if (eventData.coverImageFile && eventData.coverImageFile.size > 0) {
            coverImageUrl = await validations.uploadImageToCloudinary(eventData.coverImageFile);
        }

        const isVisible = eventData.visibility === "visible";

        const updateData = {
            heroPrefix: eventData.heroPrefix,
            title: eventData.title,
            participantsText: eventData.participantsText,
            summary: eventData.summary,
            banner: bannerUrl,

            description: eventData.description,
            coverImage: coverImageUrl,

            date: eventData.date,
            modality: eventData.modality,
            location: eventData.location,
            awardsText: eventData.awardsText,
            visibility: isVisible,
            categories: eventData.categories
        };

        const eventRef = doc(db, COLLECTION_NAME, eventData.id);
        await updateDoc(eventRef, updateData);

        const reasonsRef = collection(db, COLLECTION_NAME, eventData.id, "reasons");

        const qReasons = query(reasonsRef);
        const snapshot = await getDocs(qReasons);
        const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
        await Promise.all(deletePromises);

        const createPromises = eventData.reasons.map(r => addDoc(reasonsRef, r));
        await Promise.all(createPromises);

        Swal.fire({
            toast: true, position: 'top-end', icon: 'success',
            title: 'Actualizado', text: 'El evento se actualizó correctamente.',
            showConfirmButton: false, timer: 3000, timerProgressBar: true
        });

        return { success: true };

    } catch (error) {
        console.error("Error actualizando:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar el evento ',
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
        confirmButtonText: 'Eliminar',
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

async function markAsFinished(id) {
    const result = await Swal.fire({
        title: '¿Finalizar evento?',
        text: "El evento pasará al historial de eventos pasados.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Finalizar',
        cancelButtonText: 'Cancelar',
        buttonsStyling: false,
        customClass: {
            confirmButton: "bg-gradient-to-r from-[#004aad] to-[#3f3dc8] text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg mr-2",
            cancelButton: "bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300"
        }
    });

    if (!result.isConfirmed) return;

    try {
        // Actualizamos solo el estado
        const eventRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(eventRef, { status: "finished" });

        // Actualizamos UI localmente (lo quitamos de la lista porque ya no es 'upcoming')
        events = events.filter(e => e.id !== id);
        filteredEvents = filteredEvents.filter(e => e.id !== id);
        renderTable();

        Swal.fire({
            toast: true, position: 'top-end', icon: 'success',
            title: 'Evento finalizado', showConfirmButton: false, timer: 3000, timerProgressBar: true
        });

    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
    }
}

// ==========================================
// 6. INICIALIZACIÓN (DOM READY)
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {

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

    // Configurar select de categorías
    initMultiSelectUI();
    await loadCategories();

    setupSearch();

    const res = await getAllUpcomingEvents();
    if (res.success) {
        renderTable();
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al cargar los eventos.',
            confirmButtonText: "Ok",
            buttonsStyling: false,
            customClass: {
                confirmButton: "bg-gradient-to-r from-[#004aad] to-[#3f3dc8] text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg"
            }
        });
    }

    const tableBody = document.getElementById('tableBody');

    if (tableBody) {
        tableBody.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            const id = btn.dataset.id;

            if (btn.classList.contains('btn-edit')) {
                getUpcomingEvent(id);
            }
            else if (btn.classList.contains('btn-del')) {
                deleteUpcomingEvent(id);
            } else if (btn.classList.contains('btn-finish')) {
                markAsFinished(id);
            }
        });
    }

    const paginationContainer = document.querySelector('.mt-6.flex.justify-center');

    if (paginationContainer) {
        paginationContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.pagination-btn');

            if (!btn || btn.disabled) return;

            const newPage = parseInt(btn.dataset.page);

            if (newPage) {
                currentPage = newPage;
                renderTable();
            }
        });
    }

    // Manejo del Submit del Formulario
    const form = document.getElementById('modalForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const eventData = getEventFormData();

        if (!validateEventData(eventData)) {
            return;
        }

        if (!eventData.id) {
            const res = await addNewUpcomingEvent(eventData);
            if (res.success) {
                closeModal();
                renderTable();
            }
        }
        else {
            const res = await updateExistingEvent(eventData);
            if (res.success) {
                closeModal();
                renderTable();
            }
        }
    });
});