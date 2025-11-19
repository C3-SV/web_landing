import { 
  collection, query, onSnapshot, doc, updateDoc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// db viene del window.db que se cargó en mensajes.html
const db = window.db;

// Tabla donde se insertan los mensajes:
const tableBody = document.getElementById("tableBody");

// Leer mensajes en tiempo real:
const q = query(collection(db, "mensajes"));

onSnapshot(q, (snapshot) => {
  tableBody.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    // Formatear fecha
    const fechaFormateada = data.fecha
      ? data.fecha.toDate().toLocaleString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      : "Sin fecha";

    const row = document.createElement("tr");
    row.classList.add("hover:bg-gray-50");

    row.innerHTML = `
      <td class="px-6 py-4 text-sm text-gray-700">${docSnap.id}</td>
      <td class="px-6 py-4 text-sm text-gray-700">${data.nombre}</td>
      <td class="px-6 py-4 text-sm text-gray-700">${data.correo}</td>
      <td class="px-6 py-4 text-sm text-gray-700">${data.mensaje}</td>
      <td class="px-6 py-4 text-sm text-gray-700">${fechaFormateada}</td>
      <td class="px-6 py-4 text-sm text-gray-700">
        ${data.leido ? "Leído" : "Pendiente"}
      </td>

      <td class="px-6 py-4 text-center text-sm flex gap-3 justify-center">

        <!-- VER -->
        <button class="text-blue-600 hover:text-blue-800 transition-colors p-1 ver" data-id="${docSnap.id}">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
        </button>

        <!-- MARCAR -->
        <button class="text-green-600 hover:text-green-800 transition-colors p-1 marcar" data-id="${docSnap.id}">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M5 13l4 4L19 7" />
            </svg>
        </button>

        <!-- BORRAR -->
        <button class="text-red-600 hover:text-red-800 transition-colors p-1 eliminar" data-id="${docSnap.id}">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        </button>

      </td>
    `;

    tableBody.appendChild(row);
  });
});

// Delegación de eventos para botones
document.addEventListener("click", async (e) => {
  const id = e.target.dataset.id;

  // Si el click fue sobre un SVG → subir al button
  const button = e.target.closest("button");
  if (!button) return;

  const realId = button.dataset.id;
  if (!realId) return;

  // MARCAR COMO LEÍDO
  if (button.classList.contains("marcar")) {
    await updateDoc(doc(db, "mensajes", realId), { leido: true });
  }

  // BORRAR
  if (button.classList.contains("eliminar")) {
    if (confirm("¿Eliminar mensaje?")) {
      await deleteDoc(doc(db, "mensajes", realId));
    }
  }

  // VER (abrir modal)
  if (button.classList.contains("ver")) {
    abrirModal(realId);
  }
});

// Modal de ver mensaje
function abrirModal(id) {
  const modal = document.getElementById("viewModal");
  const viewContent = document.getElementById("viewContent");

  import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js")
    .then(({ getDoc, doc }) => {
      getDoc(doc(db, "mensajes", id)).then((docSnap) => {
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
          <p><strong>Mensaje:</strong><br>${d.mensaje}</p>
          <p><strong>Fecha:</strong> ${fechaFormateada}</p>
        `;

        modal.classList.remove("hidden");
      });
    });
}

window.closeViewModal = () => {
  document.getElementById("viewModal").classList.add("hidden");
};
