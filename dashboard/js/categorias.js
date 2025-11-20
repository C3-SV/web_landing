import { db } from "../../js/firebase_config.js";
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    onSnapshot
} from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js';

const COLLECTION_NAME = "categories";
let categories = [];
let filteredCategories = [];
let currentPage = 1;
const itemsPerPage = 5;
let editingId = null;

/**
 * Renderiza la tabla de categorías con paginación
 */
function renderTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    if (filteredCategories.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-gray-500">No se encontraron categorías.</td></tr>';
        renderPagination();
        return;
    }

    // Lógica de paginación
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

    paginatedCategories.forEach(category => {
        const row = `
            <tr class="hover:bg-gray-50 transition border-b border-gray-100">
                <td class="px-6 py-4 text-sm text-gray-900 font-medium">${category.name}</td>
                <td class="px-6 py-4 text-sm text-gray-600">${category.description || ""}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex justify-center space-x-3">
                        <button class="btn-edit text-blue-600 hover:text-blue-800 transition-transform hover:scale-110 p-1" data-id="${category.id}" title="Editar">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                        <button class="btn-del text-red-600 hover:text-red-800 transition-transform hover:scale-110 p-1" data-id="${category.id}" title="Eliminar">
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

    renderPagination();
}

/**
 * Renderiza los controles de paginación
 */
function renderPagination() {
    const paginationContainer = document.querySelector('.mt-6.flex.justify-center');
    if (!paginationContainer) return;

    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

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
            buttonsHTML += `<button class="px-4 py-2 bg-gradient-to-r from-[#004aad] to-[#3f3dc8] text-white rounded-lg shadow-md cursor-default">${i}</button>`;
        } else {
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

/**
 * Configura el listener en tiempo real de Firestore
 */
function setupRealtimeListener() {
    const q = query(collection(db, COLLECTION_NAME), orderBy("name", "asc"));

    onSnapshot(q, (snapshot) => {
        categories = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        filteredCategories = [...categories];
        renderTable();
    }, (error) => {
        console.error("Error en listener:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo conectar con la base de datos.',
            confirmButtonText: 'Ok',
            buttonsStyling: false,
            customClass: {
                confirmButton: 'bg-gradient-to-r from-[#004aad] to-[#3f3dc8] text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg'
            }
        });
    });
}

/**
 * Abre el modal
 */
function openModal() {
    const modal = document.getElementById('modal');
    const form = document.getElementById('categoryForm');
    const title = document.getElementById('modalTitle');

    modal.classList.remove('hidden');
    title.textContent = 'Agregar Categoría';
    form.reset();
    editingId = null;
}

/**
 * Cierra el modal
 */
function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

/**
 * Edita una categoría
 */
function editCategory(id) {
    const category = categories.find(c => c.id === id);
    if (!category) return;

    editingId = id;

    const modal = document.getElementById('modal');
    const title = document.getElementById('modalTitle');

    modal.classList.remove('hidden');
    title.textContent = 'Editar Categoría';

    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryDescription').value = category.description || "";
}

/**
 * Elimina una categoría
 */
async function deleteCategory(id) {
    const category = categories.find(c => c.id === id);
    if (!category) return;

    const result = await Swal.fire({
        title: '¿Estás seguro?',
        html: `Se eliminará la categoría <strong>${category.name}</strong>.<br><br><b>No podrás revertir esta acción.</b>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar',
        buttonsStyling: false,
        customClass: {
            confirmButton: 'bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 mr-2',
            cancelButton: 'bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300'
        }
    });

    if (!result.isConfirmed) return;

    try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Categoría eliminada',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });

    } catch (error) {
        console.error("Error eliminando categoría:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar la categoría.',
            confirmButtonText: 'Ok',
            buttonsStyling: false,
            customClass: {
                confirmButton: 'bg-gradient-to-r from-[#004aad] to-[#3f3dc8] text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg'
            }
        });
    }
}

/**
 * Configurar búsqueda
 */
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();

        filteredCategories = categories.filter(category =>
            category.name.toLowerCase().includes(searchTerm) ||
            (category.description || "").toLowerCase().includes(searchTerm)
        );

        currentPage = 1;
        renderTable();
    });
}

// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    if (mobileMenuBtn && sidebar && sidebarOverlay) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
            sidebarOverlay.classList.toggle('hidden');
        });

        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.add('-translate-x-full');
            sidebarOverlay.classList.add('hidden');
        });
    }

    // Cerrar el sidebar al hacer clic en cualquier enlace del menú
    const sidebarLinks = sidebar?.querySelectorAll('a');
    sidebarLinks?.forEach(link => {
        link.addEventListener('click', () => {
            sidebar.classList.add('-translate-x-full');
            sidebarOverlay.classList.add('hidden');
        });
    });

    // Configurar listener en tiempo real
    setupRealtimeListener();

    // Configurar búsqueda
    setupSearch();

    // Botón agregar
    const btnAgregar = document.getElementById('btnAgregar');
    if (btnAgregar) {
        btnAgregar.addEventListener('click', openModal);
    }

    // Botones cerrar modal
    const btnCerrarModal = document.getElementById('btnCerrarModal');
    if (btnCerrarModal) {
        btnCerrarModal.addEventListener('click', closeModal);
    }

    const btnCancelar = document.getElementById('btnCancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', closeModal);
    }

    // Event delegation para botones de la tabla
    const tableBody = document.getElementById('tableBody');
    if (tableBody) {
        tableBody.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            const id = btn.dataset.id;

            if (btn.classList.contains('btn-edit')) {
                editCategory(id);
            } else if (btn.classList.contains('btn-del')) {
                deleteCategory(id);
            }
        });
    }

    // Event delegation para paginación
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

    // Submit del formulario
    const form = document.getElementById('categoryForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('categoryName').value.trim();
            const description = document.getElementById('categoryDescription').value.trim();

            // Validación
            if (!name) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Campo requerido',
                    text: 'El nombre de la categoría es obligatorio.',
                    confirmButtonText: 'Ok',
                    buttonsStyling: false,
                    customClass: {
                        confirmButton: 'bg-gradient-to-r from-[#004aad] to-[#3f3dc8] text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg'
                    }
                });
                return;
            }

            const data = {
                name,
                description: description || ""
            };

            try {
                Swal.fire({
                    title: editingId ? 'Actualizando...' : 'Guardando...',
                    text: 'Procesando datos',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                if (editingId) {
                    // Actualizar
                    await updateDoc(doc(db, COLLECTION_NAME, editingId), data);

                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'Categoría actualizada',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true
                    });
                } else {
                    // Crear
                    await addDoc(collection(db, COLLECTION_NAME), data);

                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'Categoría creada',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true
                    });
                }

                closeModal();

            } catch (error) {
                console.error("Error guardando categoría:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo guardar la categoría.',
                    confirmButtonText: 'Ok',
                    buttonsStyling: false,
                    customClass: {
                        confirmButton: 'bg-gradient-to-r from-[#004aad] to-[#3f3dc8] text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg'
                    }
                });
            }
        });
    }
});
