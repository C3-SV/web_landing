document.addEventListener("DOMContentLoaded", () => {
    const tabLogin = document.getElementById("tab-login");
    const tabRegister = document.getElementById("tab-register");

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    function activateTab(isLogin) {
        if (isLogin) {
            loginForm.classList.remove("hidden");
            registerForm.classList.add("hidden");

            // Barra abajo
            tabLogin.classList.remove("border-transparent", "text-slate-500");
            tabLogin.classList.add("border-blue-600", "text-blue-600");

            tabRegister.classList.remove("border-blue-600", "text-blue-600");
            tabRegister.classList.add("border-transparent", "text-slate-500");

        } else {
            registerForm.classList.remove("hidden");
            loginForm.classList.add("hidden");

            // Barra abajo
            tabRegister.classList.remove("border-transparent", "text-slate-500");
            tabRegister.classList.add("border-blue-600", "text-blue-600");

            tabLogin.classList.remove("border-blue-600", "text-blue-600");
            tabLogin.classList.add("border-transparent", "text-slate-500");
        }
    }

    tabLogin.addEventListener("click", () => activateTab(true));
    tabRegister.addEventListener("click", () => activateTab(false));
});
