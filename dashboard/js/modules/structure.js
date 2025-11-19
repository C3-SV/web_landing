// modules/structure.js
// --------------------------------------------------
// MANEJO DE LA ESTRUCTURA (REINICIO COMPLETO)
// --------------------------------------------------

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

/* =====================================================
1. CARGAR ESTRUCTURA
=====================================================
*/
export async function loadStructure(eventId) {
    const structureRef = collection(db, "events", eventId, "structure");
    const q = query(structureRef, orderBy("order", "asc"));
    const res = await getDocs(q);

    const sections = [];

    // Usamos for...of para mantener el orden y esperar las subcolecciones
    for (const sectionDoc of res.docs) {
        const section = {
            id: sectionDoc.id,
            ...sectionDoc.data(),
            items: []
        };

        const itemsRef = collection(db, "events", eventId, "structure", sectionDoc.id, "items");
        const qItems = query(itemsRef, orderBy("order", "asc"));
        const itemsSnap = await getDocs(qItems);

        itemsSnap.forEach(item => {
            section.items.push({
                id: item.id,
                ...item.data()
            });
        });

        sections.push(section);
    }

    return sections;
}

/* =====================================================
2. GENERAR HTML (RENDER)
=====================================================
*/
export function renderStructureHTML(sections = []) {
    let html = "";

    sections.forEach(section => {

        html += `
        <div class="structure-section bg-gray-50 rounded-xl border border-gray-200 p-5 mb-4" data-section-id="${section.id}">
            
            <div class="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4 border-b border-gray-200 pb-4">
                <div class="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                    <div>
                        <label class="text-xs font-bold text-gray-500">Título de Sección</label>
                        <input type="text" class="section-title w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value="${section.title || ""}" placeholder="Ej: Fase 1" />
                    </div>
                    <div>
                        <label class="text-xs font-bold text-gray-500">Tipo</label>
                        <select class="section-type w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm">
                            <option value="default" ${section.type === "default" ? "selected" : ""}>Por defecto</option>
                            <option value="list" ${section.type === "list" ? "selected" : ""}>Fase</option>
                            <option value="cards" ${section.type === "cards" ? "selected" : ""}>Información</option>
                            <option value="special" ${section.type === "special" ? "selected" : ""}>Actividad</option>
                        </select>
                    </div>
                    <div>
                        <label class="text-xs font-bold text-gray-500">Icono</label>
                        ${renderIconSelect(section.icon)}
                    </div>
                </div>

                <button type="button" class="delete-section mt-4 sm:mt-0 bg-white text-red-600 border border-red-200 px-3 py-2 rounded-lg hover:bg-red-50 transition text-xs font-bold whitespace-nowrap"
                    data-section-id="${section.id}">
                    Eliminar Sección
                </button>
            </div>

            <div class="space-y-3 section-items min-h-[10px]">
                ${renderItemsHTML(section.items)}
            </div>

            <div class="mt-3 pt-2 border-t border-gray-200 border-dashed">
                <button type="button" class="add-item text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2"
                    data-section-id="${section.id}">
                    + Agregar Ítem
                </button>
            </div>
        </div>
        `;
    });

    return html;
}


export function renderItemsHTML(items = []) {
    let html = "";

    items.forEach(item => {
        html += `
        <div class="structure-item bg-white border border-gray-200 rounded-lg p-6 shadow-sm relative group transition hover:shadow-md" data-item-id="${item.id}">
            <div class="grid grid-cols-12 gap-6 items-start">
                
                <div class="col-span-3 sm:col-span-2">
                    <label class="block text-xs font-bold text-gray-500 mb-1">Icono</label>
                    ${renderIconSelect(item.icon)}
                </div>

                <div class="col-span-9 sm:col-span-5">
                    <label class="block text-xs font-bold text-gray-500 mb-1">Título del Ítem</label>
                    <input type="text" 
                        class="item-title w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004aad] focus:border-transparent transition-shadow text-sm font-medium"
                        value="${item.title || ""}" placeholder="Título..." />
                </div>

                 <div class="col-span-3 sm:col-span-2">
                    <label class="block text-xs font-bold text-gray-500 mb-1">Orden</label>
                    <input type="number" 
                        class="item-order w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004aad] focus:border-transparent text-xs text-center"
                        value="${item.order || 1}" />
                </div>

                <div class="col-span-9 sm:col-span-3 flex justify-end items-start pt-6 sm:pt-0">
                    <button type="button" 
                        class="delete-item text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition" 
                        data-item-id="${item.id}" title="Quitar ítem">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>

                <div class="col-span-12">
                    <label class="block text-xs font-bold text-gray-500 mb-1">Descripción / Texto</label>
                    <textarea 
                        class="item-text w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004aad] focus:border-transparent transition-shadow text-sm resize-none"
                        rows="2" placeholder="Detalles adicionales del ítem...">${item.text || ""}</textarea>
                </div>
            </div>
        </div>
        `;
    });

    return html;
}


/* =====================================================
3. OBTENER DATOS DEL DOM (PARSING)
=====================================================
*/
export function getStructureFromDOM() {
    // Buscamos por la clase específica que pusimos en el HTML
    const sectionElements = document.querySelectorAll(".structure-section");
    const data = [];

    sectionElements.forEach((secEl, index) => {
        // Helper para sacar valores sin error
        const safeVal = (selector, parent = secEl) => {
            const el = parent.querySelector(selector);
            return el ? el.value.trim() : "";
        };

        const sTitle = safeVal(".section-title");
        
        // Si no tiene título, saltamos esta sección (evita guardar basura)
        if (!sTitle) return; 

        const section = {
            id: secEl.dataset.sectionId, // Mantenemos el ID para referencia (aunque se regenere al guardar)
            order: index + 1,
            title: sTitle,
            type: safeVal(".section-type") || "default",
            icon: safeVal(".icon-select", secEl) || "",
            items: []
        };

        // Buscar items DENTRO de esta sección
        const itemEls = secEl.querySelectorAll("[data-item-id]");

        itemEls.forEach((itemEl, itemIndex) => {
            const iTitle = safeVal(".item-title", itemEl);
            const iText  = safeVal(".item-text", itemEl);

            // Guardamos el item si tiene título O texto (no hace falta que tenga los dos)
            if (iTitle || iText) {
                section.items.push({
                    icon: safeVal(".icon-select", itemEl),
                    title: iTitle,
                    text: iText,
                    order: parseInt(safeVal(".item-order", itemEl)) || itemIndex + 1
                });
            }
        });

        data.push(section);
    });

    return data;
}

/* =====================================================
4. GUARDAR EN FIRESTORE (NUCLEAR OPTION)
=====================================================
*/
export async function saveStructure(eventId, structureData) {
    
    const structureRef = collection(db, "events", eventId, "structure");

    // 1. BORRAR TODO LO EXISTENTE (Para evitar duplicados o desorden)
    const existingSnapshot = await getDocs(structureRef);
    const deletePromises = existingSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Si no hay datos nuevos, terminamos aquí (ya se borró lo viejo)
    if (!structureData || structureData.length === 0) return;

    // 2. CREAR NUEVO
    for (const sec of structureData) {
        
        // Crear documento de la sección
        const newSecRef = await addDoc(structureRef, {
            title: sec.title,
            type: sec.type,
            icon: sec.icon,
            order: sec.order
        });

        // Crear subcolección de items (si tiene items)
        if (sec.items && sec.items.length > 0) { // Corregido typo 'lenth' -> 'length'
            const itemsRef = collection(db, "events", eventId, "structure", newSecRef.id, "items");
            
            // Crear promesas para guardar items en paralelo
            const itemPromises = sec.items.map(item => {
                return addDoc(itemsRef, {
                    title: item.title,
                    text: item.text,
                    icon: item.icon,
                    order: item.order
                });
            });

            await Promise.all(itemPromises);
        }
    }
}