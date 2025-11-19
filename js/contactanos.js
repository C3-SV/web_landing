/*Este es el archivo que 
Escucha el submit del formulario de Contáctanos.
Captura los datos del usuario (nombre, correo, mensaje).
Los guarda en Firestore, específicamente en la colección "mensajes".
*/

import { collection, addDoc, serverTimestamp } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const messageInput = document.getElementById("message");

    const rolInputs = document.querySelectorAll("input[name='rol']");

    // Crear mensajes de error debajo de cada campo
    const errors = {
        name: createErrorBox(nameInput),
        email: createErrorBox(emailInput),
        message: createErrorBox(messageInput),
        rol: createErrorBox(rolInputs[0].closest("div"))
    };

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        clearErrors(errors);
        const valid = validateForm();

        if (!valid) return;

        const nombre = nameInput.value.trim();
        const correo = emailInput.value.trim();
        const mensaje = messageInput.value.trim();
        const rol = document.querySelector("input[name='rol']:checked").value;

        try {
            await addDoc(collection(window.db, "mensajes"), {
                nombre,
                correo,
                mensaje,
                rol,
                leido: false,
                fecha: serverTimestamp()
            });

            alert("¡Tu mensaje fue enviado con éxito!");
            form.reset();

        } catch (error) {
            console.error("Error al guardar mensaje:", error);
            alert("Hubo un error, intenta de nuevo");
        }
    });

    // -------------------
    // FUNCIONES DE VALIDACIÓN
    // -------------------

    function validateForm() {
        let valid = true;

        if (nameInput.value.trim().length < 2) {
            showError(errors.name, "Ingresa un nombre válido");
            valid = false;
        }

        if (!validateEmail(emailInput.value.trim())) {
            showError(errors.email, "Correo electrónico inválido");
            valid = false;
        }

        if (messageInput.value.trim().length < 10) {
            showError(errors.message, "El mensaje debe tener al menos 10 caracteres");
            valid = false;
        }

        if (![...rolInputs].some(r => r.checked)) {
            showError(errors.rol, "Selecciona una opción");
            valid = false;
        }

        return valid;
    }

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function createErrorBox(inputElement) {
        const box = document.createElement("p");
        box.className = "text-red-600 text-sm mt-1 hidden";
        inputElement.parentNode.appendChild(box);
        return box;
    }

    function showError(box, message) {
        box.textContent = message;
        box.classList.remove("hidden");
    }

    function clearErrors(errorsObj) {
        Object.values(errorsObj).forEach(box => {
            box.textContent = "";
            box.classList.add("hidden");
        });
    }
});

