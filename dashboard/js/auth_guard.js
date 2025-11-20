import { auth, db } from "../../js/firebase_config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { logoutUser } from "../../js/auth.js";

document.body.style.display = "none";

onAuthStateChanged(auth, async (user) => {
    const currentPath = window.location.pathname;
    const isDashboard = currentPath.includes("/dashboard/");

    if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const userData = docSnap.data();

            if (userData.role === "user" && isDashboard) {
                window.location.href = "../index.html";
                return;
            }

            document.body.style.display = "block";

        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error de cuenta',
                html: `Ocurrió un problema al cargar los datos de tu cuenta. Por tu seguridad, se cerrará tu sesión.`,
                confirmButtonText: "Cerrar Sesión",
                allowOutsideClick: false,
                allowEscapeKey: false,
                buttonsStyling: false,
                customClass: {
                    confirmButton: "bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none"
                }
            }).then(async () => {
                await signOut(auth);
                window.location.href = "index.html";
            });
        }

    } else {
        if (isDashboard) {
            window.location.href = "index.html";
        } else {
            document.body.style.display = "block";
        }
    }
});

const btnLogout = document.getElementById("btnLogout");
if (btnLogout) {
    btnLogout.addEventListener("click", async () => {
        await logoutUser();
    });
}