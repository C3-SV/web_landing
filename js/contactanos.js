/*Este es el archivo que 
Escucha el submit del formulario de Contáctanos.
Captura los datos del usuario (nombre, correo, mensaje).
Los guarda en Firestore, específicamente en la colección "mensajes".
*/

import { collection, addDoc, serverTimestamp } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nombre = document.getElementById("nombre").value;
        const correo = document.getElementById("correo").value;
        const mensaje = document.getElementById("mensaje").value;

        try {
            await addDoc(collection(window.db, "mensajes"), {
                nombre,
                correo,
                mensaje,
                leido: false,
                fecha: serverTimestamp()
            });

            alert("Mensaje enviado correctamente");
            form.reset();
        } catch (error) {
            console.error("Error al guardar mensaje:", error);
            alert("Hubo un error, intenta de nuevo");
        }
    });
});
