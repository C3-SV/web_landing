// Importa la función desde tu archivo de configuración
import { loginUser } from "../../js/auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const user = document.getElementById("userInput").value;
        const password = document.getElementById("passInput").value;

        // Feedback visual (Opcional: deshabilitar botón mientras carga)
        const submitButton = loginForm.querySelector("button");
        const originalText = submitButton.innerText;
        submitButton.disabled = true;
        submitButton.innerText = "Cargando...";

        try {
            // Llamamos a tu función exportada
            const result = await loginUser(user, password);

            if (result.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Sesión iniciada',
                    text: `¡Bienvenido, ${user.trim()}!`,
                    confirmButtonText: "Ir al dashboard",
                    buttonsStyling: false,
                    customClass: { confirmButton: "bg-gradient-to-r from-[#004aad] to-[#3f3dc8] text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg focus:outline-none" }
                }).then(() => {
                    window.location.href = "/dashboard/eventos_futuros.html";
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: `Credenciales incorrectas`,
                    confirmButtonText: "Ok",
                    buttonsStyling: false,
                    customClass: { confirmButton: "bg-gradient-to-r from-[#004aad] to-[#3f3dc8] text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg" }
                });
            }
        } catch (error) {
            console.error("Error inesperado:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Ocurrió un error inesperado. Por favor, intenta nuevamente más tarde.`,
                confirmButtonText: "Ok",
                buttonsStyling: false,
                customClass: { confirmButton: "bg-gradient-to-r from-[#004aad] to-[#3f3dc8] text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg" }
            });
        } finally {
            submitButton.disabled = false;
            submitButton.innerText = originalText;
        }
    });
});