// Sample data
let events = [
    { id: 1, title: 'Hackathon C3 2025', date: '2025-03-15', location: 'Universidad Don Bosco', type: 'Hackathon', status: 'Próximo' },
    { id: 2, title: 'ICPC Regional 2024', date: '2024-11-20', location: 'Virtual', type: 'Competencia', status: 'Finalizado' },
    { id: 3, title: 'Workshop de Algoritmos', date: '2025-02-10', location: 'UCA', type: 'Workshop', status: 'Próximo' },
    { id: 4, title: 'Copa Centroamericana', date: '2025-04-22', location: 'Guatemala', type: 'Competencia', status: 'Próximo' },
    { id: 5, title: 'Introducción a Python', date: '2025-01-15', location: 'ESEN', type: 'Workshop', status: 'En Curso' }
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

// Render table
function renderTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    events.forEach(event => {
        const row = `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 text-sm text-gray-900">${event.id}</td>
                <td class="px-6 py-4 text-sm text-gray-900 font-medium">${event.title}</td>
                <td class="px-6 py-4 text-sm text-gray-600">${event.date}</td>
                <td class="px-6 py-4 text-sm text-gray-600">${event.location}</td>
                <td class="px-6 py-4 text-sm">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${
                        event.type === 'Hackathon' ? 'bg-purple-100 text-purple-800' :
                        event.type === 'Competencia' ? 'bg-blue-100 text-blue-800' :
                        event.type === 'Workshop' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                    }">${event.type}</span>
                </td>
                <td class="px-6 py-4 text-sm">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${
                        event.status === 'Próximo' ? 'bg-blue-100 text-blue-800' :
                        event.status === 'En Curso' ? 'bg-green-100 text-green-800' :
                        event.status === 'Finalizado' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                    }">${event.status}</span>
                </td>
                <td class="px-6 py-4 text-sm text-center">
                    <button onclick="editEvent(${event.id})" class="text-blue-600 hover:text-blue-800 mr-3">
                        <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button onclick="deleteEvent(${event.id})" class="text-red-600 hover:text-red-800">
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
    document.getElementById('modalTitle').textContent = 'Agregar Evento';
    document.getElementById('eventForm').reset();
    document.getElementById('eventId').value = '';
    editingId = null;
}

// Close modal
function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

// Edit event
function editEvent(id) {
    const event = events.find(e => e.id === id);
    if (event) {
        editingId = id;
        document.getElementById('modalTitle').textContent = 'Editar Evento';
        document.getElementById('eventId').value = event.id;
        document.getElementById('eventTitle').value = event.title;
        document.getElementById('eventDate').value = event.date;
        document.getElementById('eventLocation').value = event.location;
        document.getElementById('eventType').value = event.type;
        document.getElementById('eventStatus').value = event.status;
        document.getElementById('modal').classList.remove('hidden');
    }
}

// Delete event
function deleteEvent(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este evento?')) {
        events = events.filter(e => e.id !== id);
        renderTable();
    }
}

// Form submission
document.getElementById('eventForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('eventTitle').value;
    const date = document.getElementById('eventDate').value;
    const location = document.getElementById('eventLocation').value;
    const type = document.getElementById('eventType').value;
    const status = document.getElementById('eventStatus').value;

    if (editingId) {
        // Update existing event
        const index = events.findIndex(e => e.id === editingId);
        if (index !== -1) {
            events[index] = { id: editingId, title, date, location, type, status };
        }
    } else {
        // Add new event
        const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
        events.push({ id: newId, title, date, location, type, status });
    }

    closeModal();
    renderTable();
});

// Search functionality
document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(searchTerm) ||
        event.location.toLowerCase().includes(searchTerm) ||
        event.type.toLowerCase().includes(searchTerm)
    );

    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    filteredEvents.forEach(event => {
        const row = `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 text-sm text-gray-900">${event.id}</td>
                <td class="px-6 py-4 text-sm text-gray-900 font-medium">${event.title}</td>
                <td class="px-6 py-4 text-sm text-gray-600">${event.date}</td>
                <td class="px-6 py-4 text-sm text-gray-600">${event.location}</td>
                <td class="px-6 py-4 text-sm">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${
                        event.type === 'Hackathon' ? 'bg-purple-100 text-purple-800' :
                        event.type === 'Competencia' ? 'bg-blue-100 text-blue-800' :
                        event.type === 'Workshop' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                    }">${event.type}</span>
                </td>
                <td class="px-6 py-4 text-sm">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${
                        event.status === 'Próximo' ? 'bg-blue-100 text-blue-800' :
                        event.status === 'En Curso' ? 'bg-green-100 text-green-800' :
                        event.status === 'Finalizado' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                    }">${event.status}</span>
                </td>
                <td class="px-6 py-4 text-sm text-center">
                    <button onclick="editEvent(${event.id})" class="text-blue-600 hover:text-blue-800 mr-3">
                        <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button onclick="deleteEvent(${event.id})" class="text-red-600 hover:text-red-800">
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
