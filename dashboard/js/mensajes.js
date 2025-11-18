// Sample data
let messages = [
    { id: 1, sender: 'Juan Pérez', email: 'juan@example.com', subject: 'Consulta sobre evento', content: 'Hola, me gustaría saber más información sobre el próximo hackathon...', date: '2025-01-15', status: 'No Leído' },
    { id: 2, sender: 'María García', email: 'maria@example.com', subject: 'Solicitud de patrocinio', content: 'Somos una empresa interesada en patrocinar eventos...', date: '2025-01-14', status: 'Leído' },
    { id: 3, sender: 'Carlos López', email: 'carlos@example.com', subject: 'Problema con registro', content: 'No puedo completar mi registro en la plataforma...', date: '2025-01-13', status: 'Respondido' },
    { id: 4, sender: 'Ana Martínez', email: 'ana@example.com', subject: 'Sugerencia de mejora', content: 'Me gustaría sugerir añadir más categorías de problemas...', date: '2025-01-12', status: 'Leído' },
    { id: 5, sender: 'Luis Rodríguez', email: 'luis@example.com', subject: 'Felicitaciones', content: 'Excelente plataforma, los felicito por el trabajo...', date: '2025-01-10', status: 'Archivado' }
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

    messages.forEach(message => {
        const row = `
            <tr class="hover:bg-gray-50 transition ${message.status === 'No Leído' ? 'bg-blue-50' : ''}">
                <td class="px-6 py-4 text-sm text-gray-900">${message.id}</td>
                <td class="px-6 py-4 text-sm text-gray-900 font-medium">${message.sender}</td>
                <td class="px-6 py-4 text-sm text-gray-600">${message.email}</td>
                <td class="px-6 py-4 text-sm text-gray-900">
                    <button onclick="viewMessage(${message.id})" class="text-blue-600 hover:text-blue-800 hover:underline text-left">
                        ${message.subject}
                    </button>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">${message.date}</td>
                <td class="px-6 py-4 text-sm">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${
                        message.status === 'No Leído' ? 'bg-blue-100 text-blue-800' :
                        message.status === 'Leído' ? 'bg-yellow-100 text-yellow-800' :
                        message.status === 'Respondido' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                    }">${message.status}</span>
                </td>
                <td class="px-6 py-4 text-sm text-center">
                    <button onclick="editMessage(${message.id})" class="text-blue-600 hover:text-blue-800 mr-3" title="Editar">
                        <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button onclick="deleteMessage(${message.id})" class="text-red-600 hover:text-red-800" title="Eliminar">
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

// View message
function viewMessage(id) {
    const message = messages.find(m => m.id === id);
    if (message) {
        const content = `
            <div class="border-b pb-4">
                <h4 class="text-xl font-semibold text-gray-900 mb-2">${message.subject}</h4>
                <div class="flex items-center text-sm text-gray-600 space-x-4">
                    <span><strong>De:</strong> ${message.sender}</span>
                    <span><strong>Email:</strong> ${message.email}</span>
                    <span><strong>Fecha:</strong> ${message.date}</span>
                </div>
            </div>
            <div class="py-4">
                <p class="text-gray-700 whitespace-pre-wrap">${message.content}</p>
            </div>
            <div class="pt-4 border-t">
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${
                    message.status === 'No Leído' ? 'bg-blue-100 text-blue-800' :
                    message.status === 'Leído' ? 'bg-yellow-100 text-yellow-800' :
                    message.status === 'Respondido' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                }">${message.status}</span>
            </div>
        `;
        document.getElementById('viewContent').innerHTML = content;
        document.getElementById('viewModal').classList.remove('hidden');
    }
}

// Close view modal
function closeViewModal() {
    document.getElementById('viewModal').classList.add('hidden');
}

// Open modal
function openModal() {
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('modalTitle').textContent = 'Nuevo Mensaje';
    document.getElementById('messageForm').reset();
    document.getElementById('messageId').value = '';
    // Set today's date as default
    document.getElementById('messageDate').valueAsDate = new Date();
    editingId = null;
}

// Close modal
function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

// Edit message
function editMessage(id) {
    const message = messages.find(m => m.id === id);
    if (message) {
        editingId = id;
        document.getElementById('modalTitle').textContent = 'Editar Mensaje';
        document.getElementById('messageId').value = message.id;
        document.getElementById('messageSender').value = message.sender;
        document.getElementById('messageEmail').value = message.email;
        document.getElementById('messageSubject').value = message.subject;
        document.getElementById('messageContent').value = message.content;
        document.getElementById('messageDate').value = message.date;
        document.getElementById('messageStatus').value = message.status;
        document.getElementById('modal').classList.remove('hidden');
    }
}

// Delete message
function deleteMessage(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este mensaje?')) {
        messages = messages.filter(m => m.id !== id);
        renderTable();
    }
}

// Form submission
document.getElementById('messageForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const sender = document.getElementById('messageSender').value;
    const email = document.getElementById('messageEmail').value;
    const subject = document.getElementById('messageSubject').value;
    const content = document.getElementById('messageContent').value;
    const date = document.getElementById('messageDate').value;
    const status = document.getElementById('messageStatus').value;

    if (editingId) {
        // Update existing message
        const index = messages.findIndex(m => m.id === editingId);
        if (index !== -1) {
            messages[index] = { id: editingId, sender, email, subject, content, date, status };
        }
    } else {
        // Add new message
        const newId = messages.length > 0 ? Math.max(...messages.map(m => m.id)) + 1 : 1;
        messages.push({ id: newId, sender, email, subject, content, date, status });
    }

    closeModal();
    renderTable();
});

// Search functionality
document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredMessages = messages.filter(message =>
        message.sender.toLowerCase().includes(searchTerm) ||
        message.email.toLowerCase().includes(searchTerm) ||
        message.subject.toLowerCase().includes(searchTerm) ||
        message.content.toLowerCase().includes(searchTerm)
    );

    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    filteredMessages.forEach(message => {
        const row = `
            <tr class="hover:bg-gray-50 transition ${message.status === 'No Leído' ? 'bg-blue-50' : ''}">
                <td class="px-6 py-4 text-sm text-gray-900">${message.id}</td>
                <td class="px-6 py-4 text-sm text-gray-900 font-medium">${message.sender}</td>
                <td class="px-6 py-4 text-sm text-gray-600">${message.email}</td>
                <td class="px-6 py-4 text-sm text-gray-900">
                    <button onclick="viewMessage(${message.id})" class="text-blue-600 hover:text-blue-800 hover:underline text-left">
                        ${message.subject}
                    </button>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">${message.date}</td>
                <td class="px-6 py-4 text-sm">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${
                        message.status === 'No Leído' ? 'bg-blue-100 text-blue-800' :
                        message.status === 'Leído' ? 'bg-yellow-100 text-yellow-800' :
                        message.status === 'Respondido' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                    }">${message.status}</span>
                </td>
                <td class="px-6 py-4 text-sm text-center">
                    <button onclick="editMessage(${message.id})" class="text-blue-600 hover:text-blue-800 mr-3" title="Editar">
                        <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button onclick="deleteMessage(${message.id})" class="text-red-600 hover:text-red-800" title="Eliminar">
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
