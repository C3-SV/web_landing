import { app, db, auth } from "./firebase_config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { doc, getDoc} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";


onAuthStateChanged(auth, async (user) => {
    const loginBtn = document.getElementById("nav-login");
    const profileBtn = document.getElementById("nav-profile");
    const profileImg = document.getElementById("nav-profile-img");

    const loginMobile = document.getElementById("nav-login-mobile");
    const profileMobile = document.getElementById("nav-profile-mobile");
    const profileImgMobile = document.getElementById("nav-profile-img-mobile");

    if (!user) {
        // Modo NO autenticado
        loginBtn?.classList.remove("hidden");
        profileBtn?.classList.add("hidden");

        loginMobile?.classList.remove("hidden");
        profileMobile?.classList.add("hidden");
        return;
    }

    // Modo autenticado
    try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        const data = snap.data() || {};

        const photo = data.profilePhoto?.trim() || "./assets/images/logo-c3.jpeg";

        // Desktop
        loginBtn?.classList.add("hidden");
        profileBtn?.classList.remove("hidden");
        profileImg.src = photo;

        // Mobile
        loginMobile?.classList.add("hidden");
        profileMobile?.classList.remove("hidden");
        profileImgMobile.src = photo;

    } catch (error) {
        console.error("Error obteniendo datos del usuario:", error);
    }
});