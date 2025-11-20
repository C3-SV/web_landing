import { db, auth } from "../../js/firebase_config.js";
import {
    collection,
    getDocs,
    getDoc,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp,
    orderBy
} from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js';

import {
    createUserWithEmailAndPassword,
    deleteUser as deleteAuthUser
} from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';

const COLLECTION_NAME = "users";
let users = [];
let filteredUsers = [];
let currentPage = 1;
const itemsPerPage = 5;
let editingId = null;

/**
 * Genera una contraseña por defecto
 */
function generateRandomPassword() {
    // Contraseña por defecto para todos los usuarios
    return "password";
}

/**
 * Obtiene todos los usuarios desde Firestore
 */
async function getAllUsers() {
    try {
        users = [];
        const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            users.push({
                id: doc.id,
                ...doc.data()
            });
        });

        filteredUsers = [...users];
        return { success: true, data: users };

    } catch (error) {
        console.error("Error obteniendo usuarios:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Renderiza la tabla con paginación
 */
function renderTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    if (filteredUsers.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-gray-500">No se encontraron usuarios.</td></tr>';
        renderPagination();
        return;
    }

    // Paginación
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    paginatedUsers.forEach(user => {
        const row = `
            <tr class="hover:bg-gray-50 transition border-b border-gray-100">
                <td class="px-6 py-4 text-sm font-semibold text-gray-800">${user.firstName || ''} ${user.lastName || ''}</td>
                <td class="px-6 py-4 text-sm text-gray-600">${user.username || ''}</td>
                <td class="px-6 py-4 text-sm text-gray-600">${user.email || ''}</td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'moderator' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                    }">${
                        user.role === 'admin' ? 'Administrador' :
                        user.role === 'moderator' ? 'Moderador' :
                        'Usuario'
                    }</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                    <div class="flex justify-center space-x-3">
                        <button class="btn-edit text-blue-600 hover:text-blue-800 p-1 transition-transform hover:scale-110" data-id="${user.id}" title="Editar">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                        <button class="btn-del text-red-600 hover:text-red-800 p-1 transition-transform hover:scale-110" data-id="${user.id}" title="Eliminar">
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

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

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
 * Configurar búsqueda
 */
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();

        filteredUsers = users.filter(user =>
            (user.firstName && user.firstName.toLowerCase().includes(searchTerm)) ||
            (user.lastName && user.lastName.toLowerCase().includes(searchTerm)) ||
            (user.username && user.username.toLowerCase().includes(searchTerm)) ||
            (user.email && user.email.toLowerCase().includes(searchTerm)) ||
            (user.role && user.role.toLowerCase().includes(searchTerm))
        );

        currentPage = 1;
        renderTable();
    });
}

/**
 * Abre el modal
 */
function openModal() {
    const modal = document.getElementById('modal');
    const form = document.getElementById('userForm');
    const title = document.getElementById('modalTitle');

    modal.classList.remove('hidden');
    title.innerText = 'Agregar Usuario';
    form.reset();
    document.getElementById('userId').value = '';
    editingId = null;
}

/**
 * Cierra el modal
 */
function closeModal() {
    document.getElementById('modal').classList.add('hidden');
    document.getElementById('email').disabled = false;
}

/**
 * Obtiene los datos del formulario
 */
function getUserFormData() {
    const form = document.getElementById('userForm');
    const formData = new FormData(form);

    return {
        id: formData.get('id').trim(),
        firstName: formData.get('firstName').trim(),
        lastName: formData.get('lastName').trim(),
        username: formData.get('username').trim(),
        email: formData.get('email').trim(),
        role: formData.get('role'),
        phone: formData.get('phone').trim(),
        birthdate: formData.get('birthdate').trim()
    };
}

/**
 * Valida los datos del formulario
 */
async function validateUserData(data, isNew) {
    // Campos requeridos
    if (!data.firstName || !data.lastName || !data.username || !data.email || !data.role) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: 'Por favor, completa todos los campos obligatorios marcados con asterisco (*).',
            confirmButtonText: 'Ok',
            buttonsStyling: false,
            customClass: {
                confirmButton: 'bg-gradient-to-r from-[#004aad] to-[#3f3dc8] text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg'
            }
        });
        return false;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        Swal.fire({
            icon: 'warning',
            title: 'Email inválido',
            text: 'Por favor, ingresa un email válido.',
            confirmButtonText: 'Ok',
            buttonsStyling: false,
            customClass: {
                confirmButton: 'bg-gradient-to-r from-[#004aad] to-[#3f3dc8] text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg'
            }
        });
        return false;
    }

    // Verificar username único (solo para nuevos usuarios o si cambió el username)
    if (isNew || (editingId && data.username !== users.find(u => u.id === editingId)?.username)) {
        const q = query(collection(db, COLLECTION_NAME), where("username", "==", data.username));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            Swal.fire({
                icon: 'warning',
                title: 'Username no disponible',
                text: 'El nombre de usuario ya está en uso. Por favor, elige otro.',
                confirmButtonText: 'Ok',
                buttonsStyling: false,
                customClass: {
                    confirmButton: 'bg-gradient-to-r from-[#004aad] to-[#3f3dc8] text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg'
                }
            });
            return false;
        }
    }

    return true;
}

/**
 * Crea un nuevo usuario
 */
async function addNewUser(userData) {
    try {
        Swal.fire({
            title: 'Creando usuario...',
            text: 'Generando credenciales y guardando datos',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Generar contraseña por defecto
        const generatedPassword = generateRandomPassword();

        // Crear usuario en Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, generatedPassword);
        const uid = userCredential.user.uid;

        // Crear documento en Firestore con el UID como ID
        await setDoc(doc(db, COLLECTION_NAME, uid), {
            username: userData.username,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role,
            phone: userData.phone || "",
            birthdate: userData.birthdate || "",
            profilePhoto: "",
            badges: [],
            createdAt: serverTimestamp(),
            lastLoginAt: null
        });

        // Mostrar contraseña generada al administrador
        Swal.fire({
            icon: 'success',
            title: '¡Usuario creado exitosamente!',
            html: `
                <div class="text-left">
                    <p class="mb-4">El usuario ha sido creado con las siguientes credenciales:</p>
                    <div class="bg-gray-100 p-4 rounded-lg mb-4">
                        <p class="mb-2"><strong>Email:</strong> ${userData.email}</p>
                        <p class="mb-2"><strong>Username:</strong> ${userData.username}</p>
                        <p class="mb-2"><strong>Contraseña temporal:</strong></p>
                        <div class="bg-white p-3 rounded border border-gray-300 font-mono text-sm break-all">
                            ${generatedPassword}
                        </div>
                    </div>
                    <p class="text-sm text-red-600">⚠️ <strong>Importante:</strong> Copia esta contraseña ahora. No se volverá a mostrar.</p>
                </div>
            `,
            confirmButtonText: 'Copiar contraseña',
            showCancelButton: true,
            cancelButtonText: 'Cerrar',
            buttonsStyling: false,
            customClass: {
                confirmButton: 'bg-gradient-to-r from-[#004aad] to-[#3f3dc8] text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg mr-2',
                cancelButton: 'bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300'
            },
            width: '600px'
        }).then((result) => {
            if (result.isConfirmed) {
                // Copiar contraseña al portapapeles
                navigator.clipboard.writeText(generatedPassword).then(() => {
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'Contraseña copiada',
                        showConfirmButton: false,
                        timer: 2000
                    });
                });
            }
        });

        return { success: true };

    } catch (error) {
        console.error("Error creando usuario:", error);

        let errorMessage = 'Hubo un problema al crear el usuario.';
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'El email ya está registrado en el sistema.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'El formato del email no es válido.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'La contraseña es demasiado débil.';
        }

        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage,
            confirmButtonText: 'Ok',
            buttonsStyling: false,
            customClass: {
                confirmButton: 'bg-gradient-to-r from-[#004aad] to-[#3f3dc8] text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg'
            }
        });

        return { success: false, error: error.message };
    }
}

/**
 * Obtiene un usuario y lo carga en el modal
 */
async function getUser(id) {
    const user = users.find(u => u.id === id);
    if (!user) return;

    openModal();
    editingId = id;

    document.getElementById('modalTitle').innerText = 'Editar Usuario';
    document.getElementById('userId').value = user.id;
    document.getElementById('firstName').value = user.firstName || '';
    document.getElementById('lastName').value = user.lastName || '';
    document.getElementById('username').value = user.username || '';
    document.getElementById('email').value = user.email || '';

    document.getElementById('email').disabled = true; 

    document.getElementById('role').value = user.role || 'user';
    document.getElementById('phone').value = user.phone || '';
    document.getElementById('birthdate').value = user.birthdate || '';
}

/**
 * Actualiza un usuario existente
 */
async function updateExistingUser(userData) {
    try {
        Swal.fire({
            title: 'Actualizando...',
            text: 'Procesando cambios',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        const updateData = {
            firstName: userData.firstName,
            lastName: userData.lastName,
            username: userData.username,
            role: userData.role,
            phone: userData.phone || "",
            birthdate: userData.birthdate || ""
        };

        const userRef = doc(db, COLLECTION_NAME, userData.id);
        await updateDoc(userRef, updateData);

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Usuario actualizado',
            text: 'Los datos se actualizaron correctamente.',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });

        return { success: true };

    } catch (error) {
        console.error("Error actualizando usuario:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar el usuario.',
            confirmButtonText: 'Ok',
            buttonsStyling: false,
            customClass: {
                confirmButton: 'bg-gradient-to-r from-[#004aad] to-[#3f3dc8] text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg'
            }
        });
        return { success: false, error: error.message };
    }
}

/**
 * Elimina un usuario
 */
async function deleteUser(id) {
    const user = users.find(u => u.id === id);
    if (!user) return;

    const result = await Swal.fire({
        title: '¿Estás seguro?',
        html: `Se eliminará el usuario <strong>${user.firstName} ${user.lastName}</strong> (${user.email}).<br><br><b>No podrás revertir esta acción.</b>`,
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

    Swal.fire({
        title: 'Eliminando...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        // Eliminar de Firestore
        await deleteDoc(doc(db, COLLECTION_NAME, id));

        // Nota: No se puede eliminar del Authentication desde el cliente
        // Esto requeriría Cloud Functions o Admin SDK

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Usuario eliminado',
            text: 'El usuario ha sido eliminado correctamente.',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });

        // Actualizar lista local
        users = users.filter(u => u.id !== id);
        filteredUsers = filteredUsers.filter(u => u.id !== id);
        renderTable();

    } catch (error) {
        console.error("Error eliminando usuario:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar el usuario.',
            confirmButtonText: 'Ok',
            buttonsStyling: false,
            customClass: {
                confirmButton: 'bg-gradient-to-r from-[#004aad] to-[#3f3dc8] text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg'
            }
        });
    }
}

// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
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

    // Cargar usuarios
    const res = await getAllUsers();
    if (res.success) {
        renderTable();
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al cargar los usuarios.',
            confirmButtonText: 'Ok',
            buttonsStyling: false,
            customClass: {
                confirmButton: 'bg-gradient-to-r from-[#004aad] to-[#3f3dc8] text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg'
            }
        });
    }

    // Event delegation para botones de la tabla
    const tableBody = document.getElementById('tableBody');
    if (tableBody) {
        tableBody.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            const id = btn.dataset.id;

            if (btn.classList.contains('btn-edit')) {
                getUser(id);
            } else if (btn.classList.contains('btn-del')) {
                deleteUser(id);
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
    const form = document.getElementById('userForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const userData = getUserFormData();
            const isNew = !userData.id;

            // Validar datos
            const isValid = await validateUserData(userData, isNew);
            if (!isValid) {
                return;
            }

            if (isNew) {
                // Crear nuevo usuario
                const res = await addNewUser(userData);
                if (res.success) {
                    closeModal();
                    // Recargar usuarios
                    await getAllUsers();
                    renderTable();
                }
            } else {
                // Actualizar usuario existente
                const res = await updateExistingUser(userData);
                if (res.success) {
                    closeModal();
                    // Recargar usuarios
                    await getAllUsers();
                    renderTable();
                }
            }
        });
    }
});
