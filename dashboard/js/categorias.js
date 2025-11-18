// Sample data
let categories = [
    { id: 1, name: 'Algoritmos', description: 'Problemas relacionados con algoritmos y estructuras de datos', color: 'Azul', status: 'Activo' },
    { id: 2, name: 'Desarrollo Web', description: 'Tecnologías web frontend y backend', color: 'Verde', status: 'Activo' },
    { id: 3, name: 'Inteligencia Artificial', description: 'Machine Learning y Deep Learning', color: 'Púrpura', status: 'Activo' },
    { id: 4, name: 'Bases de Datos', description: 'Gestión y diseño de bases de datos', color: 'Naranja', status: 'Activo' },
    { id: 5, name: 'Ciberseguridad', description: 'Seguridad informática y ethical hacking', color: 'Rojo', status: 'Inactivo' }
];

let editingId = null;

// Mobile menu toggle
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

// Get color classes
function getColorClasses(color) {
    const colorMap = {
        'Azul': 'bg-blue-100 text-blue-800',
        'Verde': 'bg-green-100 text-green-800',
        'Rojo': 'bg-red-100 text-red-800',
        'Amarillo': 'bg-yellow-100 text-yellow-800',
        'Púrpura': 'bg-purple-100 text-purple-800',
        'Naranja': 'bg-orange-100 text-orange-800'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800';
}

// Render table
function renderTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    categories.forEach(category => {
        const row = `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 text-sm text-gray-900">${category.id}</td>
                <td class="px-6 py-4 text-sm text-gray-900 font-medium">${category.name}</td>
                <td class="px-6 py-4 text-sm text-gray-600">${category.description}</td>
                <td class="px-6 py-4 text-sm">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${getColorClasses(category.color)}">${category.color}</span>
                </td>
                <td class="px-6 py-4 text-sm">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${
                        category.status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }">${category.status}</span>
                </td>
                <td class="px-6 py-4 text-sm text-center">
                    <button onclick="editCategory(${category.id})" class="text-blue-600 hover:text-blue-800 mr-3">
                        <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button onclick="deleteCategory(${category.id})" class="text-red-600 hover:text-red-800">
                        <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// Open modal
function openModal() {
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('modalTitle').textContent = 'Agregar Categoría';
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryId').value = '';
    editingId = null;
}

// Close modal
function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

// Edit category
function editCategory(id) {
    const category = categories.find(c => c.id === id);
    if (category) {
        editingId = id;
        document.getElementById('modalTitle').textContent = 'Editar Categoría';
        document.getElementById('categoryId').value = category.id;
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryDescription').value = category.description;
        document.getElementById('categoryColor').value = category.color;
        document.getElementById('categoryStatus').value = category.status;
        document.getElementById('modal').classList.remove('hidden');
    }
}

// Delete category
function deleteCategory(id) {
    if (confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
        categories = categories.filter(c => c.id !== id);
        renderTable();
    }
}

// Form submission
document.getElementById('categoryForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('categoryName').value;
    const description = document.getElementById('categoryDescription').value;
    const color = document.getElementById('categoryColor').value;
    const status = document.getElementById('categoryStatus').value;

    if (editingId) {
        // Update existing category
        const index = categories.findIndex(c => c.id === editingId);
        if (index !== -1) {
            categories[index] = { id: editingId, name, description, color, status };
        }
    } else {
        // Add new category
        const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
        categories.push({ id: newId, name, description, color, status });
    }

    closeModal();
    renderTable();
});

// Search functionality
document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm) ||
        category.description.toLowerCase().includes(searchTerm) ||
        category.color.toLowerCase().includes(searchTerm)
    );

    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    filteredCategories.forEach(category => {
        const row = `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 text-sm text-gray-900">${category.id}</td>
                <td class="px-6 py-4 text-sm text-gray-900 font-medium">${category.name}</td>
                <td class="px-6 py-4 text-sm text-gray-600">${category.description}</td>
                <td class="px-6 py-4 text-sm">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${getColorClasses(category.color)}">${category.color}</span>
                </td>
                <td class="px-6 py-4 text-sm">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${
                        category.status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }">${category.status}</span>
                </td>
                <td class="px-6 py-4 text-sm text-center">
                    <button onclick="editCategory(${category.id})" class="text-blue-600 hover:text-blue-800 mr-3">
                        <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button onclick="deleteCategory(${category.id})" class="text-red-600 hover:text-red-800">
                        <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
});

// Initial render
renderTable();
