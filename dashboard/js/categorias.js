//  FIREBASE CONFIG:
const firebaseConfig = {
    apiKey: "AIzaSyCLNj65uwgORStzqR7FulNIuDT7lqnaE5s",
    authDomain: "landing-c3.firebaseapp.com",
    projectId: "landing-c3",
    storageBucket: "landing-c3.firebasestorage.app",
    messagingSenderId: "911691009600",
    appId: "1:911691009600:web:e8c1433f78823634b0d9a5",
    measurementId: "G-Z2JB5KBFZK"
};

// Inicializar Firebase
if (!firebase.apps?.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

let categories = [];
let editingId = null;

// Mobile menu
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');

mobileMenuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('-translate-x-full');
    sidebarOverlay.classList.toggle('hidden');
});

sidebarOverlay.addEventListener('click', () => {
    sidebar.classList.add('-translate-x-full');
    sidebarOverlay.classList.add('hidden');
});

// RENDER TABLE
function renderTable(list = categories) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    list.forEach(category => {
        const row = `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 text-sm text-gray-900 font-medium">${category.name}</td>
                <td class="px-6 py-4 text-sm text-gray-600">${category.description || ""}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex justify-center space-x-3">
                        <button onclick="editCategory('${category.id}')" class="text-blue-600 hover:text-blue-800 transition-colors p-1">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>

                        <button onclick="deleteCategory('${category.id}')" class="text-red-600 hover:text-red-800 transition-colors p-1">
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

// FIREBASE LISTENER
db.collection("categories")
  .orderBy("name")
  .onSnapshot(snapshot => {
      categories = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
      }));
      renderTable();
  });

// MODAL OPEN/CLOSE
function openModal() {
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('modalTitle').textContent = 'Agregar Categoría';
    document.getElementById('categoryForm').reset();
    editingId = null;
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

// EDIT
function editCategory(id) {
    const category = categories.find(c => c.id === id);
    editingId = id;

    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('modalTitle').textContent = 'Editar Categoría';

    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryDescription').value = category.description || "";
}

// DELETE
async function deleteCategory(id) {
    if (confirm("¿Eliminar categoría?")) {
        await db.collection("categories").doc(id).delete();
    }
}

// FORM SUBMIT
document.getElementById('categoryForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        name: document.getElementById('categoryName').value,
        description: document.getElementById('categoryDescription').value
    };

    if (editingId) {
        await db.collection("categories").doc(editingId).update(data);
    } else {
        await db.collection("categories").add(data);
    }

    closeModal();
});

// SEARCH
document.getElementById('searchInput').addEventListener('input', (e) => {
    const t = e.target.value.toLowerCase();
    renderTable(
        categories.filter(c =>
            c.name.toLowerCase().includes(t) ||
            (c.description || "").toLowerCase().includes(t)
        )
    );
});

// Exponer funciones
window.openModal = openModal;
window.closeModal = closeModal;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
