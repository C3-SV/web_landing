// Sample data
    let events = [
        { id: 101, title: 'Hackathon C3 2025', date: '2025-03-15', modality: 'Presencial', status: 'Próximo' },
        { id: 102, title: 'Taller de Python', date: '2025-02-10', modality: 'Remoto', status: 'En Curso' },
        { id: 103, title: 'ICPC Regional 2024', date: '2024-11-20', modality: 'Híbrido', status: 'Finalizado' },
        { id: 104, title: 'Copa Centroamericana', date: '2025-04-22', modality: 'Presencial', status: 'Próximo' },
        { id: 105, title: 'Intro a IA', date: '2025-01-15', modality: 'Remoto', status: 'Cancelado' }
    ];

    let editingId = null;

    // Función Render Table
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
                        ${event.date}
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
                            <button onclick="editEvent(${event.id})" class="text-blue-600 hover:text-blue-800 transition-colors p-1">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                            </button>
                            <button onclick="deleteEvent(${event.id})" class="text-red-600 hover:text-red-800 transition-colors p-1">
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

    // Funciones del Modal (Sin cambios en lógica)
    function openModal() {
        document.getElementById('modal').classList.remove('hidden');
        // Reset form logic here...
        document.getElementById('modalForm').reset();
        document.getElementById('eventId').value = '';
        editingId = null;
    }

    function closeModal() {
        document.getElementById('modal').classList.add('hidden');
    }

    // Placeholder functions for logic
    function editEvent(id) {
        const event = events.find(e => e.id === id);
        if(event) {
            // Llenar campos (aquí deberías mapear tus inputs del modal)
            console.log("Editando", event);
            openModal();
            // Ejemplo: document.getElementById('title').value = event.title;
        }
    }

    function deleteEvent(id) {
        if(confirm('¿Borrar evento?')) {
            events = events.filter(e => e.id !== id);
            renderTable();
        }
    }

    // Inicializar
    document.addEventListener('DOMContentLoaded', renderTable);

    document.addEventListener("DOMContentLoaded", () => {
    const tabButtons = document.querySelectorAll(".tabBtn");
    const tabContents = document.querySelectorAll(".tabContent");

    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.dataset.tab;

            // Quitar clase de "activo"
            tabButtons.forEach(b => b.classList.remove("activeTab"));
            tabContents.forEach(c => c.classList.add("hidden"));

            // Activar botones y tab seleccionada
            btn.classList.add("activeTab");
            document.getElementById(targetTab).classList.remove("hidden");
        });
    });
});

