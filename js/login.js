import { registerUser, loginUser } from "./auth.js";

document.getElementById("registerForm").addEventListener("submit", async (e) => {
    alert("Ejecutando submit");
    e.preventDefault();

    let correo = document.getElementById("registerEmail").value;
    let password = document.getElementById("registerPassword").value;
    let userName = document.getElementById("userName").value;

    const status = await registerUser(correo, password, userName);

    if (status.ok) {
        alert("Usuario creado exitosamente");

        // Limpiar los controles del formulario
        document.getElementById("registerEmail").value = '';
        document.getElementById("registerPassword").value = '';
        document.getElementById("userName").value = '';

    } else if (status.reason === "username_exists") {
        alert("El nombre de usuario ya está en uso.");
    } else {
        alert("Ya existe un usuario asociado a este correo");
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
            alert("Usuario y/o contraseña incorrectos.");
        }
    } catch (error) {
        alert("Hubo un problema al iniciar sesión.");
        console.error("Error al iniciar sesión:", error.message);
    }
});
