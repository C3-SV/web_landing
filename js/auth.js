import { app, db, auth } from "./firebase_config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updatePassword  } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
//import { getAnalytics } from "firebase/analytics";
import { doc, addDoc, setDoc, getDoc, getDocs, collection, query, where, updateDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import {CLOUDINARY_PRESET, CLOUDINARY_URL} from "./cloudinary_config.js"

// Función para registrar usuarios
function isEmail(text) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
}

// SA2
export async function showUpdateSuccess(message = "Cambios guardados correctamente") {
    await Swal.fire({
        title: "Actualizado",
        html: message,
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
        buttonsStyling: false,
        customClass: {
            popup: "rounded-xl",
        },
        didOpen: () => {
            Swal.showLoading();
        }
    });
}

export function showError(message = "Ocurrió un error inesperado") {
    Swal.fire({
        title: "Error",
        html: message,
        icon: "error",
        confirmButtonText: "OK",
        buttonsStyling: false,
        customClass: {
            confirmButton: "bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none",
            popup: "rounded-xl"
        }
    });
}

export async function registerUser(email, password, username) {
    try {
        // 1. Verificar si ya existe un username igual
        const q = query(collection(db, "users"), where("username", "==", username));
        const snap = await getDocs(q);

        if (!snap.empty) {
            return { ok: false, reason: "username_exists" };
        }

        // 2. Crear usuario con Firebase Auth
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCred.user;

        // 3. Guardar datos en Firestore
        await setDoc(doc(db, "users", user.uid), {
            badges: [],             
            birthdate: "",
            createdAt: new Date(),
            email: email,
            firstName: "",
            lastLoginAt: new Date(),
            lastName: "",
            phone: "",
            profilePhoto: "",
            role: "user",            
            username: username
        });

        console.log("Usuario registrado exitosamente:", user.uid);
        return { ok: true };

    } catch (error) {
        console.error("Error:", error.message);
        return { ok: false, reason: "auth_error" };
    }
}

export async function loginUser(email, password) {
    try {
        let posibleEmail = email;
        if (!isEmail(posibleEmail)) {
            const q = query(
                collection(db, "users"),
                where("username", "==", posibleEmail)
            );

            const snap = await getDocs(q);

            if (snap.empty) {
                return { ok: false, reason: "user_not_found" };
            }

            // Tomar el email real del usuario
            posibleEmail = snap.docs[0].data().email;
        }
        const userCredential = await signInWithEmailAndPassword(auth, posibleEmail, password);
        const user = userCredential.user;

        // Obtener datos del usuario desde la base de datos
        const dataUser = await getDoc(doc(db, 'users', user.uid));

        if (dataUser.exists()) {
            console.log("Inicio de sesión exitoso:", dataUser.data().role);
            return { ok: true };
        } else {
            // Si el usuario no existe en la base de datos, lanzar un error
            throw new Error("El usuario no existe en la base de datos.");
        }
    } catch (error) {
        // Manejar los errores de inicio de sesión, ya sea por credenciales incorrectas o cualquier otro error
        console.error("Error en el inicio de sesión:", error.message);
        return { ok: false };; // Retornar null en caso de error (esto evitará redirección)
    }
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        if (document.body.hasAttribute("data-requires-auth")) {
            window.location.href = "login.html";
        }
        return;
    }

    console.log("Sesión iniciada:", user.uid);

    const userData = await loadUserData(user.uid);

    injectUserData(userData);
});

async function loadUserData(uid) {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        console.warn("No existe el documento del usuario en Firestore");
        return {};
    }

    return snap.data();
}


const USER_PLACEHOLDERS = {
    firstName: "-",
    lastName: "-",
    birthdate: "-",
    phone: "-",
    username: "-",
    email: "-",
};

// Función que aplica placeholders
function applyPlaceholder(value, field) {
    if (value && value.trim() !== "") return value;
    return USER_PLACEHOLDERS[field] || "-";
}


function injectUserData(data) {
    document.querySelectorAll("[data-user]").forEach((el) => {
        const field = el.getAttribute("data-user");
        const value = data[field] ?? "";

        if (field === "profilePhoto") {
            if (value && value.trim() !== "") {
                el.src = value;
            } else if (el.dataset.default) {
                el.src = el.dataset.default;
            } else {
                el.src = "";
            }
            return;
        }

        if (el.classList.contains("field-view")) {
            el.textContent = applyPlaceholder(value, field);
        } else if (el.classList.contains("field-edit")) {
            el.value = value;
        } else {
            el.textContent = applyPlaceholder(value, field);
        }
    });

    const fullNameEl = document.querySelector("[data-user-fullname]");

    if (fullNameEl) {
        const first = data.firstName?.trim() || "";
        const last = data.lastName?.trim() || "";
        const username = data.username || "Usuario";

        const firstIsEmpty = first === "";
        const lastIsEmpty = last === "";

        if (firstIsEmpty && lastIsEmpty) {
            fullNameEl.textContent = username;
        } else {
            fullNameEl.textContent = `${first} ${last}`.trim();
        }
    }
}

document.addEventListener("click", async (e) => {
    // Botón Editar
    if (e.target.classList.contains("btn-edit")) {
        const container = e.target.closest("[data-field]");
        const field = container.dataset.field;
        const view = container.querySelector(".field-view");
        const input = container.querySelector(".field-edit");

        // Si está editando → Guardar
        if (container.classList.contains("editing")) {
            await saveField(container);
            return;
        }

        // Si no está editando → Activar edición
        container.classList.add("editing");

         if (field === "password") {
            input.value = "";
        } else {
            const currentValue = view.textContent.trim();
            input.value = (currentValue && currentValue !== "-") ? currentValue : "";
        }

        view.classList.add("hidden");
        input.classList.remove("hidden");
        input.focus();
        e.target.textContent = "Guardar";
    }
});

async function saveField(container) {
    const field = container.getAttribute("data-field");
    const input = container.querySelector(".field-edit");
    const view = container.querySelector(".field-view");
    const btn = container.querySelector(".btn-edit");

    const fieldMap = {
        nombre: "firstName",
        apellido: "lastName",
        correo: "email",
        usuario: "username",
        telefono: "phone",
        dob: "birthdate"
    };

    const firebaseField = fieldMap[field];
    const newValue = input.value.trim();

    try {
        const user = auth.currentUser;
        if (!user) return;

         if (field === "password") {
            if (newValue.length < 8) {
                await showError("La contraseña debe tener al menos 8 caracteres.");
                return;
            }

            // Firebase exige reautenticación si la sesión es vieja
            try {
                await updatePassword(user, newValue);
            } catch (err) {
                if (err.code === "auth/requires-recent-login") {
                    await showError("Por seguridad, vuelve a iniciar sesión para cambiar la contraseña.");
                } else {
                    console.error("Error cambiando contraseña:", err);
                     await showError("Error cambiando contraseña")
                }
                return;
            }

            // Actualizar UI: nunca mostrar contraseña real
            view.textContent = "********";
            input.classList.add("hidden");
            view.classList.remove("hidden");
            container.classList.remove("editing");
            btn.textContent = "Editar";

            await showUpdateSuccess();
            return; 
        }
        const firebaseField = fieldMap[field];
        if (!firebaseField) return;

        const ref = doc(db, "users", user.uid);

        await updateDoc(ref, {
            [firebaseField]: newValue
        });

        // Actualizar UI
        view.textContent = newValue || "-";
        input.classList.add("hidden");
        view.classList.remove("hidden");

        container.classList.remove("editing");
        btn.textContent = "Editar";

        const updatedData = await loadUserData(user.uid);
        injectUserData(updatedData);
        
        await showUpdateSuccess();

    } catch (error) {
        console.error("Error guardando:", error);
        await showError();
    }
}

export async function logoutUser() {
    await Swal.fire({
        title: 'Cerrar sesión',
        html: "¿Estás seguro de que deseas cerrar sesión?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Cerrar sesión',
        cancelButtonText: 'Cancelar',
        buttonsStyling: false,
        customClass: {
            confirmButton: "bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 mr-2 focus:outline-none",
            cancelButton: "bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none"
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            await Swal.fire({
                title: 'Cerrando sesión...',
                timer: 1000,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            await signOut(auth);
        }
    });
}

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", logoutUser);
}

const fileInput = document.getElementById("profile-picture-input");
const profileImg = document.getElementById("profile-picture");

if (fileInput) {
    fileInput.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const user = auth.currentUser;
            if (!user) return;
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", CLOUDINARY_PRESET);

            const uploadRes = await fetch(CLOUDINARY_URL, {
                method: "POST",
                body: formData
            });

            const uploadData = await uploadRes.json();

            if (!uploadData.secure_url) {
                throw new Error("No se obtuvo URL de Cloudinary");
            }

            const imageUrl = uploadData.secure_url;

            await updateDoc(doc(db, "users", user.uid), {
                profilePhoto: imageUrl
            });

            profileImg.src = imageUrl;

            await showUpdateSuccess();

        } catch (error) {
            console.error("Error subiendo foto:", error);
            await showError();
        }
    });
}
