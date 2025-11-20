import {
  collection, query, onSnapshot, doc, updateDoc, deleteDoc, getDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { db } from "../../js/firebase_config.js";
import { getMessageStatusBadge } from "./badge_styles.js";

const tableBody = document.getElementById("tableBody");

// Paginación
let currentPage = 1;
const rowsPerPage = 5;
let messages = [];
let filteredMessages = [];
const paginationButtonsContainer = document.querySelector(".mt-6 .flex.space-x-2");
const btnAnterior = paginationButtonsContainer.querySelector("button:first-child");
const btnSiguiente = paginationButtonsContainer.querySelector("button:last-child");
const searchInput = document.getElementById("searchInput");

// Leer mensajes en tiempo real
const q = query(collection(db, "messages"));
onSnapshot(q, (snapshot) => {
  messages = snapshot.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      nombre: data.nombre,
      correo: data.correo,
      mensaje: data.mensaje,
      rol: data.rol,
      fecha: data.fecha,
      leido: data.leido || false
    };
  });

  currentPage = 1;
  applyFilterAndDisplay();
});

// Mostrar mensajes
function displayMessages() {
  tableBody.innerHTML = "";

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedMessages = filteredMessages.slice(start, end);

  paginatedMessages.forEach(msg => {
    const fechaFormateada = msg.fecha
      ? msg.fecha.toDate().toLocaleString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      : "Sin fecha";

    const statusBadge = getMessageStatusBadge(msg.leido);

    const row = document.createElement("tr");
    row.classList.add("hover:bg-gray-50");

    row.innerHTML = `
      <td class="px-6 py-4 text-sm text-gray-700">${msg.nombre}</td>
      <td class="px-6 py-4 text-sm text-gray-700">${msg.correo}</td>
      <td class="px-6 py-4 text-sm text-gray-700">${msg.mensaje.length > 20 ? msg.mensaje.substring(0, 20) + "..." : msg.mensaje}</td>
      <td class="px-6 py-4 text-sm text-gray-700">${fechaFormateada}</td>
      <td class="px-6 py-4">
        <span class="${statusBadge.classes}">
          ${statusBadge.text}
        </span>
      </td>
      <td class="px-6 py-4 text-center text-sm flex gap-3 justify-center">
        <button class="text-blue-600 hover:text-blue-800 transition-colors p-1 ver" data-id="${msg.id}">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
        <button class="text-green-600 hover:text-green-800 transition-colors p-1 marcar" data-id="${msg.id}">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M5 13l4 4L19 7" />
          </svg>
        </button>
        <button class="text-red-600 hover:text-red-800 transition-colors p-1 eliminar" data-id="${msg.id}">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Filtrado
function applyFilterAndDisplay() {
  const searchText = searchInput.value.toLowerCase();
  filteredMessages = messages.filter(msg =>
    msg.nombre.toLowerCase().includes(searchText) ||
    msg.correo.toLowerCase().includes(searchText) ||
    msg.mensaje.toLowerCase().includes(searchText) ||
    (msg.rol && msg.rol.toLowerCase().includes(searchText))
  );
  currentPage = 1;
  displayMessages();
  updatePaginationButtons();
}

// Modal
function abrirModal(id) {
  const modal = document.getElementById("viewModal");
  const viewContent = document.getElementById("viewContent");

  getDoc(doc(db, "messages", id)).then((docSnap) => {
    const d = docSnap.data();
    const fechaFormateada = d.fecha
      ? d.fecha.toDate().toLocaleString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      : "Sin fecha";

    viewContent.innerHTML = `
      <p><strong>Nombre:</strong> ${d.nombre}</p>
      <p><strong>Email:</strong> ${d.correo}</p>
      <p><strong>Rol:</strong> ${d.rol ? d.rol.charAt(0).toUpperCase() + d.rol.slice(1) : "-"}</p>
      <p><strong>Mensaje:</strong><br>${d.mensaje}</p>
      <p><strong>Fecha:</strong> ${fechaFormateada}</p>
    `;

    modal.classList.remove("hidden");
  });
}

window.closeViewModal = () => {
  document.getElementById("viewModal").classList.add("hidden");
};

// Delegación de botones
document.addEventListener("click", async (e) => {
  const button = e.target.closest("button");
  if (!button) return;

  const realId = button.dataset.id;
  if (realId) {
    if (button.classList.contains("marcar")) {
      await updateDoc(doc(db, "messages", realId), { leido: true });
    }
    if (button.classList.contains("eliminar")) {
      if (confirm("¿Eliminar mensaje?")) {
        await deleteDoc(doc(db, "messages", realId));
      }
    }
    if (button.classList.contains("ver")) {
      abrirModal(realId);
    }
  }

  // Paginación
  if (button.id === "prevPage") prevPage();
  if (button.id === "nextPage") nextPage();
  if (button.dataset.page) {
    currentPage = parseInt(button.dataset.page);
    displayMessages();
    updatePaginationButtons();
  }
});

// Paginación
function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    displayMessages();
    updatePaginationButtons();
  }
}
function nextPage() {
  const totalPages = Math.ceil(filteredMessages.length / rowsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    displayMessages();
    updatePaginationButtons();
  }
}

// Actualizar botones
// Actualizar botones
function updatePaginationButtons() {
  const totalPages = Math.ceil(filteredMessages.length / rowsPerPage);

  if (totalPages <= 1) {
    paginationButtonsContainer.classList.add("hidden");
    return; 
  } else {
    paginationButtonsContainer.classList.remove("hidden");
  }
  
  while (paginationButtonsContainer.children.length > 2) {
    paginationButtonsContainer.removeChild(paginationButtonsContainer.children[1]);
  }

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.dataset.page = i;
    btn.className = i === currentPage
      ? "px-4 py-2 bg-gradient-to-r from-[#004aad] to-[#3f3dc8] text-white rounded-lg"
      : "px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition";
    
    paginationButtonsContainer.insertBefore(btn, btnSiguiente);
  }

  btnAnterior.disabled = currentPage === 1;
  btnAnterior.classList.toggle("opacity-50", currentPage === 1);
  btnAnterior.classList.toggle("cursor-not-allowed", currentPage === 1);

  btnSiguiente.disabled = currentPage === totalPages || totalPages === 0;
  btnSiguiente.classList.toggle("opacity-50", currentPage === totalPages || totalPages === 0);
  btnSiguiente.classList.toggle("cursor-not-allowed", currentPage === totalPages || totalPages === 0);
}

// Buscar
searchInput.addEventListener("input", () => {
  applyFilterAndDisplay();
});
