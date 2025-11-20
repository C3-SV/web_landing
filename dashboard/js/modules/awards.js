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

// Importar configuración de Cloudinary
import { CLOUDINARY_URL, CLOUDINARY_PRESET } from "../../../js/cloudinary_config.js";

// Cargar awards desde Firestore
export async function loadAwards(eventId) {
    const awardsRef = collection(db, "events", eventId, "awards");
    const q = query(awardsRef, orderBy("order", "asc"));
    const res = await getDocs(q);

    const awards = [];
    res.forEach(doc => {
        awards.push({
            id: doc.id,
            ...doc.data()
        });
    });

    return awards;
}

// Renderizar HTML de awards
export function renderAwardsHTML(items = []) {
    let html = "";

    items.forEach(item => {
        const inputId = `award-file-${item.id}`;

        html += `
        <div class="award-item bg-white border-2 border-gray-200 rounded-lg p-4 shadow-sm relative group hover:border-gray-300 transition-all"
             data-award-id="${item.id}">
            
            <!-- Botón eliminar - Mejorado visualmente -->
            <button 
                type="button"
                class="delete-award absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all z-20 ring-2 ring-white">
                <i class="bi bi-trash text-base"></i>
            </button>

            <!-- IMAGEN + FILE INPUT -->
            <div class="mb-3">
                <label for="${inputId}" class="relative w-full h-40 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 cursor-pointer block img-wrapper hover:border-[#004aad] transition-colors">
                    ${item.url ? `
                        <img 
                            src="${item.url}" 
                            class="preview-image absolute inset-0 w-full h-full object-cover rounded-lg z-10"
                            alt="Premio" />
                    ` : `
                        <div class="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p class="text-xs font-medium">Subir imagen</p>
                        </div>
                    `}

                    <div class="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs opacity-0 hover:opacity-100 transition z-20">
                        Cambiar imagen
                    </div>

                    <input 
                        id="${inputId}"
                        type="file"
                        accept="image/*"
                        class="award-file absolute inset-0 opacity-0 cursor-pointer z-30" />
                </label>

                <span class="award-file-name mt-1.5 text-[11px] text-gray-500 truncate block text-center">
                    ${item.url ? "Imagen cargada" : "Ningún archivo seleccionado"}
                </span>
            </div>

            <!-- CAPTION -->
            <div class="mb-3">
                <label class="block text-xs font-bold text-gray-600 mb-1.5">Descripción</label>
                <input 
                    type="text"
                    class="award-caption w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent text-sm transition-shadow"
                    value="${item.caption || ""}" 
                    placeholder="Ej: Primer lugar" />
            </div>

            <!-- ORDEN -->
            <div>
                <label class="block text-xs font-bold text-gray-600 mb-1.5">Orden</label>
                <input 
                    type="number"
                    min="1"
                    class="award-order w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-center focus:ring-2 focus:ring-[#004aad] transition-shadow"
                    value="${item.order || 1}" />
            </div>
        </div>
        `;
    });

    return html;
}

// Subir imagen a Cloudinary
async function uploadAwardImage(file) {
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

// Leer awards del DOM
export function getAwardsFromDOM() {
    const els = document.querySelectorAll(".award-item");
    const awards = [];

    els.forEach((el, index) => {
        const caption = el.querySelector(".award-caption")?.value.trim() || "";
        const order = parseInt(el.querySelector(".award-order")?.value.trim()) || index + 1;
        const url = el.querySelector(".preview-image")?.src || "";
        const awardId = el.dataset.awardId || "";

        // Solo guardar si tiene URL o caption
        if (!url && !caption) return;

        awards.push({
            id: awardId.startsWith("temp-") ? null : awardId, // null para nuevos
            caption,
            url,
            order
        });
    });

    return awards;
}

// Guardar awards en Firestore

export async function saveAwards(eventId, array) {
    const awardsRef = collection(db, "events", eventId, "awards");

    // 1. Obtener IDs actuales en Firestore
    const existing = await getDocs(awardsRef);
    const existingIds = existing.docs.map(d => d.id);

    // 2. Obtener IDs que quedaron en el DOM
    const currentIds = array.filter(a => a.id).map(a => a.id);

    // 3. Eliminar los que ya NO están en el DOM
    const idsToDelete = existingIds.filter(id => !currentIds.includes(id));
    const deletions = idsToDelete.map(id => 
        deleteDoc(doc(db, "events", eventId, "awards", id))
    );
    await Promise.all(deletions.map(p => p.catch(() => {})));

    // 4. Actualizar o crear cada item
    const ops = array.map(item => {
        if (item.id) {
            // Actualizar existente
            const docRef = doc(db, "events", eventId, "awards", item.id);
            return updateDoc(docRef, {
                caption: item.caption || "",
                url: item.url || "",
                order: item.order || 1
            }).catch(() => {
                // Si falla la actualización (ej: doc no existe), crear nuevo
                return addDoc(awardsRef, {
                    caption: item.caption || "",
                    url: item.url || "",
                    order: item.order || 1
                });
            });
        } else {
            // Crear nuevo
            return addDoc(awardsRef, {
                caption: item.caption || "",
                url: item.url || "",
                order: item.order || 1
            });
        }
    });

    await Promise.all(ops);
}

/*
export async function saveAwards(eventId, array) {
    const awardsRef = collection(db, "events", eventId, "awards");

    // 1. Obtener IDs actuales en Firestore
    const existing = await getDocs(awardsRef);
    const existingIds = existing.docs.map(d => d.id);

    // 2. Obtener IDs que quedaron en el DOM
    const currentIds = array.filter(a => a.id).map(a => a.id);

    // 3. Eliminar los que ya NO están en el DOM
    const idsToDelete = existingIds.filter(id => !currentIds.includes(id));
    const deletions = idsToDelete.map(id => 
        deleteDoc(doc(db, "events", eventId, "awards", id))
    );
    await Promise.all(deletions.map(p => p.catch(() => {})));

    // 4. Actualizar/crear los que SÍ están en el DOM
    // Por simplicidad, borramos todos y recreamos
    const remaining = await getDocs(awardsRef);
    const clearAll = remaining.docs.map(d => deleteDoc(d.ref));
    await Promise.all(clearAll.map(p => p.catch(() => {})));

    // 5. Crear todos desde cero
    const ops = array.map(item =>
        addDoc(awardsRef, {
            caption: item.caption || "",
            url: item.url || "",
            order: item.order || 1
        })
    );

    await Promise.all(ops);
}
*/
// Manejar cambio de imagen con subida a Cloudinary
export async function handleAwardImageChange(eventId, inputEl) {
    const file = inputEl.files[0];
    if (!file) return;

    const wrapper = inputEl.closest(".award-item");
    let previewEl = wrapper.querySelector(".preview-image");

    // Si no existe preview (era placeholder), crearlo
    if (!previewEl) {
        const label = wrapper.querySelector(".img-wrapper");
        label.innerHTML = `
            <img src="" class="preview-image absolute inset-0 w-full h-full object-cover rounded-lg z-10" alt="Premio" />
            <div class="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs opacity-0 hover:opacity-100 transition z-20">
                📷 Cambiar imagen
            </div>
        `;
        previewEl = wrapper.querySelector(".preview-image");
    }

    // Preview local inmediato
    previewEl.src = URL.createObjectURL(file);
    
    try {
        // Subir imagen a Cloudinary
        const uploadUrl = await uploadAwardImage(file);

        // Actualizar preview con URL de Cloudinary
        previewEl.src = uploadUrl;

        // Actualizar label
        wrapper.querySelector(".award-file-name").textContent = "✓ " + file.name;
    } catch (err) {
        console.error("Error subiendo imagen:", err);
        alert("Error al subir la imagen. Intenta de nuevo.");
    }
}

// Eliminar award específico de Firestore
export async function deleteAward(eventId, awardId) {
    if (awardId.startsWith("temp-")) {
        // Es un award nuevo que aún no está en Firestore
        return;
    }

    try {
        const awardRef = doc(db, "events", eventId, "awards", awardId);
        await deleteDoc(awardRef);
    } catch (err) {
        console.error("Error eliminando award:", err);
        throw err;
    }
}