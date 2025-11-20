import { db } from "../../../js/firebase_config.js";
import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    updateDoc,
    orderBy,
    query,
    doc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// tomar cloudinary 

import { CLOUDINARY_URL, CLOUDINARY_PRESET } from "../../../js/cloudinary_config.js";   

// cargar la galeria 
export async function loadGallery(eventId) {
    const galRef = collection(db, "events", eventId, "gallery");
    const q = query(galRef, orderBy("order", "asc"));
    const res = await getDocs(q);

    const gallery = [];
    res.forEach(doc => {
        gallery.push({
            id: doc.id,
            ...doc.data()
        });
    });

    return gallery;
}

// cargar el html 
export function renderGalleryHTML(items = []) {
    let html = "";

    items.forEach(item => {
        const inputId = `gallery-file-${item.id}`;

        html += `
        <div class="gallery-item bg-white border border-gray-200 rounded-lg p-6 shadow-sm relative group"
             data-gallery-id="${item.id}">
            
            <div class="grid grid-cols-12 gap-6 items-center">

                <!-- IMAGEN + FILE INPUT -->
                <div class="col-span-12 sm:col-span-3 flex flex-col items-start">

                    <label for="${inputId}" class="relative w-full h-32 rounded-lg overflow-hidden border cursor-pointer img-wrapper">
                        <img 
                            src="${item.url || ''}" 
                            class="preview-image absolute inset-0 w-full h-full object-cover rounded-lg z-10"
                            alt="Imagen" />

                        <div class="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-xs opacity-0 hover:opacity-100 transition">
                            Subir imagen
                        </div>

                        <input 
                            id="${inputId}"
                            type="file"
                            accept="image/*"
                            class="gallery-file absolute inset-0 opacity-0 cursor-pointer" />
                    </label>

                    <span class="gallery-file-name mt-1 text-[11px] text-gray-500 truncate max-w-full">
                        ${item.url ? "Imagen cargada" : "Ningún archivo seleccionado"}
                    </span>
                </div>

                <!-- CAPTION -->
                <div class="col-span-12 sm:col-span-6">
                    <label class="block text-xs font-bold text-gray-500 mb-1">Descripción</label>
                    <input 
                        type="text"
                        class="gallery-caption w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-[#004aad] text-sm"
                        value="${item.caption || ""}" 
                        placeholder="Ej: Premiación final" />
                </div>

                <!-- ORDEN -->
                <div class="col-span-6 sm:col-span-2">
                    <label class="block text-xs font-bold text-gray-500 mb-1">Orden</label>
                    <input 
                        type="number"
                        class="gallery-order w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-center"
                        value="${item.order || 1}" />
                </div>

                <!-- ELIMINAR -->
                <div class="col-span-6 sm:col-span-1 flex justify-end mt-4 sm:mt-0">
                    <button 
                        type="button"
                        class="delete-gallery text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition">
                        <i class="bi bi-trash text-xl"></i>
                    </button>
                </div>
            </div>
        </div>
        `;
    });

    return html;
}

// subir a cloudinary 

async function uploadGalleryImage(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_PRESET);

    const res = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData
    });

    const data = await res.json();

    if (!data.secure_url) {
        console.error("ERROR subiendo a Cloudinary:", data);
        throw new Error("Cloudinary upload failed");
    }

    return data.secure_url;
}


// leer  del DOM 

export function getGalleryFromDOM() {
    const els = document.querySelectorAll(".gallery-item");
    const gallery = [];

    els.forEach((el, index) => {
        const caption = el.querySelector(".gallery-caption")?.value.trim() || "";
        const order = parseInt(el.querySelector(".gallery-order")?.value.trim()) || index + 1;
        const url = el.querySelector(".preview-image")?.src || "";
        const galleryId = el.dataset.galleryId || ""; // ← NUEVO: Capturar el ID

        if (!url && !caption) return;

        gallery.push({
            id: galleryId.startsWith("temp-") ? null : galleryId, // ← NUEVO: Mantener ID
            caption,
            url,
            order
        });
    });

    return gallery;
}
/*
export function getGalleryFromDOM() {
    const els = document.querySelectorAll(".gallery-item");
    const gallery = [];

    els.forEach((el, index) => {
        const caption = el.querySelector(".gallery-caption")?.value.trim() || "";
        const order = parseInt(el.querySelector(".gallery-order")?.value.trim()) || index + 1;
        const url = el.querySelector(".preview-image")?.src || "";

        if (!url && !caption) return;

        gallery.push({
            caption,
            url,
            order
        });
    });

    return gallery;
}*/

// guardar cambios en galeria de firestore


export async function saveGallery(eventId, array) {
    const galRef = collection(db, "events", eventId, "gallery");

    // 1. Obtener IDs actuales
    const existing = await getDocs(galRef);
    const existingIds = existing.docs.map(d => d.id);

    // 2. IDs en el DOM
    const currentIds = array.filter(a => a.id).map(a => a.id);

    // 3. Eliminar los que ya NO están
    const idsToDelete = existingIds.filter(id => !currentIds.includes(id));
    const deletions = idsToDelete.map(id => 
        deleteDoc(doc(db, "events", eventId, "gallery", id))
    );
    await Promise.all(deletions.map(p => p.catch(() => {})));

    // 4. Actualizar o crear
    const ops = array.map(item => {
        if (item.id) {
            const docRef = doc(db, "events", eventId, "gallery", item.id);
            return updateDoc(docRef, {
                caption: item.caption || "",
                url: item.url || "",
                order: item.order || 1
            }).catch(() => {
                return addDoc(galRef, {
                    caption: item.caption || "",
                    url: item.url || "",
                    order: item.order || 1
                });
            });
        } else {
            return addDoc(galRef, {
                caption: item.caption || "",
                url: item.url || "",
                order: item.order || 1
            });
        }
    });

    await Promise.all(ops);
}

/*
export async function saveGallery(eventId, array) {
    const galRef = collection(db, "events", eventId, "gallery");

    // 1. Borrar previos
    const existing = await getDocs(galRef);
    const deletions = existing.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletions.map(p => p.catch(() => { })));

    // 2. Guardar nuevos
    const ops = array.map(item =>
        addDoc(galRef, {
            caption: item.caption || "",
            url: item.url || "",
            order: item.order || 1
        })
    );

    await Promise.all(ops);
}*/

// subir + preview con dom 

export async function handleGalleryImageChange(eventId, inputEl) {
    const file = inputEl.files[0];
    if (!file) return;

    const wrapper = inputEl.closest(".gallery-item");
    const previewEl = wrapper.querySelector(".preview-image");

    // preview local
    previewEl.src = URL.createObjectURL(file);
    
    // Subir imagen a cloudinary
    const uploadUrl = await uploadGalleryImage(file);

    // Actualizar preview inmediata
    previewEl.src = uploadUrl;

    // label
    wrapper.querySelector(".gallery-file-name").textContent = file.name;
}
