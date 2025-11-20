import { db } from "../../../js/firebase_config.js";
import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    orderBy,
    query
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Manejo de iconos
import { renderIconSelect } from "../utilities/icons.js";

// 1. cargar las estadisticas 

export async function loadStats(eventId) {
    const statsRef = collection(db, "events", eventId, "stats");
    const q = query(statsRef, orderBy("order", "asc"));
    const res = await getDocs(q);

    const stats = [];
    res.forEach(doc => {
        stats.push({
            id: doc.id,
            ...doc.data()
        });
    });

    return stats;
}

/* =====================================================
2. RENDER HTML
===================================================== */
export function renderStatsHTML(stats = []) {
    let html = "";

    stats.forEach(stat => {
        html += `
        <div class="stat-item bg-white border border-gray-200 rounded-lg p-6 shadow-sm relative group transition hover:shadow-md"
             data-stat-id="${stat.id}">
            
            <div class="grid grid-cols-12 gap-6 items-start">
                
                <!-- Icono -->
                <div class="col-span-3 sm:col-span-2">
                    <label class="block text-xs font-bold text-gray-500 mb-1">Icono</label>
                    ${renderIconSelect(stat.icon || "")}
                </div>

                <!-- Texto -->
                <div class="col-span-9 sm:col-span-5">
                    <label class="block text-xs font-bold text-gray-500 mb-1">Texto</label>
                    <input 
                        type="text"
                        class="stat-text w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004aad] focus:border-transparent transition-shadow text-sm font-medium"
                        value="${stat.text || ""}"
                        placeholder="Ej: Equipos participantes" />
                </div>

                <!-- Valor -->
                <div class="col-span-4 sm:col-span-2">
                    <label class="block text-xs font-bold text-gray-500 mb-1">Valor</label>
                    <input 
                        type="text"
                        class="stat-value w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004aad] focus:border-transparent transition-shadow text-sm text-center"
                        value="${stat.value ?? ""}"
                        placeholder="Ej: 25" />
                </div>

                <!-- Orden -->
                <div class="col-span-4 sm:col-span-1">
                    <label class="block text-xs font-bold text-gray-500 mb-1">Orden</label>
                    <input 
                        type="number"
                        class="stat-order w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004aad] focus:border-transparent text-xs text-center"
                        value="${stat.order || 1}" />
                </div>

                <!-- Eliminar -->
                <div class="col-span-4 sm:col-span-2 flex justify-end items-start pt-6 sm:pt-0">
                    <button 
                        type="button"
                        class="delete-stat text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition"
                        title="Quitar estadística">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                            </path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        `;
    });

    return html;
}

/* =====================================================
3. LEER DEL DOM
===================================================== */
export function getStatsFromDOM() {
    const statEls = document.querySelectorAll(".stat-item");
    const stats = [];

    statEls.forEach((el, index) => {
        const safeVal = (selector) => {
            const field = el.querySelector(selector);
            return field ? field.value.trim() : "";
        };

        const icon  = safeVal(".icon-select");
        const text  = safeVal(".stat-text");
        const value = safeVal(".stat-value");
        const order = parseInt(safeVal(".stat-order"), 10) || index + 1;

        // Si todo está vacío, no guardamos este stat
        if (!icon && !text && !value) return;

        stats.push({
            icon,
            text,
            value,
            order
        });
    });

    return stats;
}

/* =====================================================
4. GUARDAR EN FIRESTORE
===================================================== */
export async function saveStats(eventId, statsArray) {
    const statsRef = collection(db, "events", eventId, "stats");

    // 1. Borrar stats previas
    const existing = await getDocs(statsRef);
    const deletions = existing.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletions.map(p => p.catch(() => {})));

    // 2. Si no hay nuevas, terminamos
    if (!statsArray || statsArray.length === 0) return;

    // 3. Crear nuevas
    const createPromises = statsArray.map((s) =>
        addDoc(statsRef, {
            icon: s.icon || "",
            text: s.text || "",
            value: s.value ?? "",
            order: s.order ?? 1
        })
    );

    await Promise.all(createPromises);
}
