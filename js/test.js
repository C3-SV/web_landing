console.log("Iniciando test");


import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js"
import { db } from "./firebase_config.js"

async function probarMensaje() {
    const eventosTest = collection(db, "events");
    const q = query(eventosTest, orderBy("title"));
    const snapshot = await getDocs(q); 
    snapshot.forEach(doc => {
      console.log("ID:", doc.id, "DATA:", doc.data());
    });
    console.log("Terminando test");
}

document.addEventListener("DOMContentLoaded", probarMensaje); 


