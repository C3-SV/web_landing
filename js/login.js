import { registerUser, loginUser, showUpdateSuccess, showError } from "./auth.js";
document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    let correo = document.getElementById("registerEmail").value;
    let password = document.getElementById("registerPassword").value;
    let userName = document.getElementById("userName").value;

    const pass1 = document.getElementById("registerPassword").value.trim();
    const pass2 = document.getElementById("registerPassword2").value.trim();

    if (pass1 !== pass2) {
        await showError("Las contraseñas no coinciden");
        return;
    }

    const status = await registerUser(correo, password, userName);

    if (status.ok) {
        await showUpdateSuccess("Usuario creado exitosamente");

        // Limpiar los controles del formulario
        document.getElementById("registerEmail").value = '';
        document.getElementById("registerPassword").value = '';
        document.getElementById("registerPassword2").value = '';
        document.getElementById("userName").value = '';

    } else if (status.reason === "username_exists") {
        await showError("El nombre de usuario ya está en uso.");
    } else {
        await showError("Ya existe un usuario asociado a este correo");
    }
});

// Manejo del formulario de inicio de sesión
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        // Intentar iniciar sesión
        const userData = await loginUser(email, password);

        if (userData.ok) {
            // Redirigir a la página de perfil si el inicio de sesión fue exitoso
            window.location.href = "profile.html";
        } else {
            await showError("Usuario y/o contraseña incorrectos.");
        }
    } catch (error) {
        await showError("Hubo un problema al iniciar sesión.");
        console.error("Error al iniciar sesión:", error.message);
    }
});
