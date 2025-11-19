import { app, db, auth } from "./firebase_config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
//import { getAnalytics } from "firebase/analytics";
import { doc, addDoc, setDoc, getDoc, getDocs, collection, query, where } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Función para registrar usuarios
function isEmail(text) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
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
            username,
            email,
            role: "user"
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
