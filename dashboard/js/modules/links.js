import { db } from "../../../js/firebase_config.js";
import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    orderBy,
    query,
    doc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Manejo de iconos
import { renderIconSelect } from "../utilities/icons.js";

/* =====================================================
1. CARGAR LINKS DESDE FIRESTORE
===================================================== */
export async function loadLinks(eventId) {
    const linksRef = collection(db, "events", eventId, "links");
    const q = query(linksRef, orderBy("order", "asc"));
    const res = await getDocs(q);

    const links = [];
    res.forEach(doc => {
        links.push({
            id: doc.id,
            ...doc.data()
        });
    });

    return links;
}

/* =====================================================
2. RENDER HTML
===================================================== */
export function renderLinksHTML(links = []) {
    let html = "";

    links.forEach(link => {
        html += `
        <div class="link-item bg-white border border-gray-200 rounded-lg p-6 shadow-sm relative group transition hover:shadow-md"
             data-link-id="${link.id}">
            
            <div class="grid grid-cols-12 gap-6 items-start">
                
                <!-- Icono -->
                <div class="col-span-3 sm:col-span-2">
                    <label class="block text-xs font-bold text-gray-500 mb-1">Icono</label>
                    ${renderIconSelect(link.icon || "")}
                </div>

                <!-- Título -->
                <div class="col-span-9 sm:col-span-4">
                    <label class="block text-xs font-bold text-gray-500 mb-1">Título</label>
                    <input 
                        type="text"
                        class="link-title w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004aad] focus:border-transparent transition-shadow text-sm font-medium"
                        value="${link.title || ""}"
                        placeholder="Ej: Registrarse aquí" />
                </div>

                <!-- URL -->
                <div class="col-span-8 sm:col-span-3">
                    <label class="block text-xs font-bold text-gray-500 mb-1">URL</label>
                    <input 
                        type="url"
                        class="link-url w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004aad] focus:border-transparent transition-shadow text-sm"
                        value="${link.url || ""}"
                        placeholder="https://ejemplo.com" />
                </div>

                <!-- Orden -->
                <div class="col-span-4 sm:col-span-1">
                    <label class="block text-xs font-bold text-gray-500 mb-1">Orden</label>
                    <input 
                        type="number"
                        min="1"
                        class="link-order w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004aad] focus:border-transparent text-xs text-center"
                        value="${link.order || 1}" />
                </div>

                <!-- Eliminar -->
                <div class="col-span-12 sm:col-span-2 flex justify-end items-start pt-0 sm:pt-6">
                    <button 
                        type="button"
                        class="delete-link text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition"
                        title="Eliminar link">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                            </path>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Preview del link (opcional, muestra la URL formateada) -->
            ${link.url ? `
                <div class="mt-3 pt-3 border-t border-gray-100">
                    <a href="${link.url}" target="_blank" rel="noopener noreferrer" 
                       class="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 transition">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                        </svg>
                        <span class="truncate">${link.url}</span>
                    </a>
                </div>
            ` : ''}
        </div>
        `;
    });

    return html;
}

/* =====================================================
3. LEER DEL DOM
===================================================== */
export function getLinksFromDOM() {
    const linkEls = document.querySelectorAll(".link-item");
    const links = [];

    linkEls.forEach((el, index) => {
        const safeVal = (selector) => {
            const field = el.querySelector(selector);
            return field ? field.value.trim() : "";
        };

        const icon  = safeVal(".icon-select");
        const title = safeVal(".link-title");
        const url   = safeVal(".link-url");
        const order = parseInt(safeVal(".link-order"), 10) || index + 1;
        const linkId = el.dataset.linkId || "";

        // Si título y URL están vacíos, no guardamos este link
        if (!title && !url) return;

        links.push({
            id: linkId.startsWith("temp-") ? null : linkId,
            icon,
            title,
            url,
            order
        });
    });

    return links;
}

/* =====================================================
4. GUARDAR EN FIRESTORE
===================================================== */
export async function saveLinks(eventId, linksArray) {
    const linksRef = collection(db, "events", eventId, "links");

    // 1. Obtener IDs actuales en Firestore
    const existing = await getDocs(linksRef);
    const existingIds = existing.docs.map(d => d.id);

    // 2. Obtener IDs que quedaron en el DOM
    const currentIds = linksArray.filter(l => l.id).map(l => l.id);

    // 3. Eliminar los que ya NO están en el DOM
    const idsToDelete = existingIds.filter(id => !currentIds.includes(id));
    const deletions = idsToDelete.map(id => 
        deleteDoc(doc(db, "events", eventId, "links", id))
    );
    await Promise.all(deletions.map(p => p.catch(() => {})));

    // 4. Borrar todos y recrear (estrategia simple)
    const remaining = await getDocs(linksRef);
    const clearAll = remaining.docs.map(d => deleteDoc(d.ref));
    await Promise.all(clearAll.map(p => p.catch(() => {})));

    // 5. Si no hay nuevos links, terminamos
    if (!linksArray || linksArray.length === 0) return;

    // 6. Crear todos desde cero
    const createPromises = linksArray.map((l) =>
        addDoc(linksRef, {
            icon: l.icon || "",
            title: l.title || "",
            url: l.url || "",
            order: l.order ?? 1
        })
    );

    await Promise.all(createPromises);
}

/* =====================================================
5. ELIMINAR LINK ESPECÍFICO
===================================================== */
export async function deleteLink(eventId, linkId) {
    if (linkId.startsWith("temp-")) {
        // Es un link nuevo que aún no está en Firestore
        return;
    }

    try {
        const linkRef = doc(db, "events", eventId, "links", linkId);
        await deleteDoc(linkRef);
    } catch (err) {
        console.error("Error eliminando link:", err);
        throw err;
    }
}