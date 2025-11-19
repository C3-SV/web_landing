import { 
  collection, query, onSnapshot, doc, updateDoc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// db viene del window.db que se cargo en mensajes.html
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
      <td class="px-6 py-4 text-sm text-gray-700">${data.asunto || "Sin asunto"}</td>
      <td class="px-6 py-4 text-sm text-gray-700">${fechaFormateada}</td>
      <td class="px-6 py-4 text-sm text-gray-700">
        ${data.leido ? "Leído" : "Pendiente"}
      </td>
      <td class="px-6 py-4 text-center text-sm flex gap-2 justify-center">

        <button 
            class="ver flex items-center gap-1 px-4 py-2 rounded-full bg-blue-500 text-white font-medium shadow hover:bg-blue-600 transition"
            data-id="${docSnap.id}">
            Ver
        </button>

        <button 
            class="marcar flex items-center gap-1 px-4 py-2 rounded-full bg-emerald-500 text-white font-medium shadow hover:bg-emerald-600 transition"
            data-id="${docSnap.id}">
            Marcar
        </button>

        <button 
            class="eliminar flex items-center gap-1 px-4 py-2 rounded-full bg-rose-500 text-white font-medium shadow hover:bg-rose-600 transition"
            data-id="${docSnap.id}">
            Borrar
        </button>

      </td>`;

    tableBody.appendChild(row);
  });
});

// Delegación de eventos para botones
document.addEventListener("click", async (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains("marcar")) {
    await updateDoc(doc(db, "mensajes", id), { leido: true });
  }

  if (e.target.classList.contains("eliminar")) {
    await deleteDoc(doc(db, "mensajes", id));
  }

  if (e.target.classList.contains("ver")) {
    abrirModal(id);
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

        // Formatear fecha
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
          <p><strong>Asunto:</strong> ${d.asunto || "Sin asunto"}</p>
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
