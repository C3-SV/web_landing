// modules/structure.js
// --------------------------------------------------
// Manejo de la subcolección "structure" y sus "items"
// --------------------------------------------------

import {
    db
} from "../../../js/firebase_config.js";

import {
    collection,
    doc,
    getDocs,
    addDoc,
    deleteDoc,
    updateDoc,
    orderBy,
    query
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/*  
----------------------------------------------------
1. Cargar estructura del evento
----------------------------------------------------
Estructura esperada:

events/{eventId}/structure/{sectionId}
{
    title: "",
    type: "",
    icon: "",
    order: 1
}

Y dentro:

events/{eventId}/structure/{sectionId}/items/{itemId}
{
    title: "",
    text: "",
    icon: "",
    order: 1
}
----------------------------------------------------
*/

export async function loadStructure(eventId) {
    const structureRef = collection(db, "events", eventId, "structure");
    const q = query(structureRef, orderBy("order", "asc"));
    const res = await getDocs(q);

    const sections = [];

    for (const sectionDoc of res.docs) {
        const section = {
            id: sectionDoc.id,
            ...sectionDoc.data(),
            items: []
        };

        // cargar items
        const itemsRef = collection(
            db,
            "events",
            eventId,
            "structure",
            sectionDoc.id,
            "items"
        );
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

/*  
----------------------------------------------------
2. Generar HTML para mostrar sections + items en modal
----------------------------------------------------
Eres tú, desde pastEvents.js, quien inserta esto en el DOM.
Este módulo no toca el DOM, solo retorna HTML listo.
----------------------------------------------------
*/

export function renderStructureHTML(sections = []) {
    let html = "";

    sections.forEach(section => {
        html += `
        <div class="bg-gray-50 rounded-lg border border-gray-200 p-4" data-section-id="${section.id}">
            
            <!-- HEADER DE LA SECCIÓN -->
            <div class="flex justify-between items-center mb-3">
                <div>
                    <p class="text-xs text-gray-500 font-bold mb-1">Título</p>
                    <input 
                        type="text" 
                        class="section-title w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                        value="${section.title || ""}"
                    />
                </div>

                <div>
                    <p class="text-xs text-gray-500 font-bold mb-1">Tipo</p>
                    <select 
                        class="section-type w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                    >
                        <option value="default" ${section.type === "default" ? "selected" : ""}>Default</option>
                        <option value="list" ${section.type === "list" ? "selected" : ""}>Lista</option>
                        <option value="cards" ${section.type === "cards" ? "selected" : ""}>Cards</option>
                        <option value="special" ${section.type === "special" ? "selected" : ""}>Especial</option>
                    </select>
                </div>

                <div>
                    <p class="text-xs text-gray-500 font-bold mb-1">Icono</p>
                    <input 
                        type="text" 
                        class="section-icon w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                        value="${section.icon || ""}"
                    />
                </div>

                <div>
                    <button 
                        class="delete-section bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition text-sm"
                        data-section-id="${section.id}"
                    >
                        Eliminar
                    </button>
                </div>
            </div>

            <!-- LISTA DE ITEMS -->
            <div class="space-y-3 section-items" data-section-id="${section.id}">
                ${renderItemsHTML(section.items)}
            </div>

            <button 
                class="add-item mt-3 bg-gradient-to-r from-[#408cd3] to-[#3f3dc8] text-white px-3 py-2 rounded-lg text-sm hover:shadow"
                data-section-id="${section.id}"
            >
                Agregar Ítem
            </button>
        </div>
        `;
    });

    return html;
}

/*  
----------------------------------------------------
3. Render de items dentro de cada sección
----------------------------------------------------
*/

export function renderItemsHTML(items = []) {
    let html = "";

    items.forEach(item => {
        html += `
        <div class="bg-white border border-gray-200 rounded-lg p-3" data-item-id="${item.id}">
            <div class="grid grid-cols-3 gap-3">

                <div>
                    <p class="text-xs text-gray-500 font-bold mb-1">Icono</p>
                    <input 
                        type="text" 
                        class="item-icon w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                        value="${item.icon || ""}"
                    />
                </div>

                <div>
                    <p class="text-xs text-gray-500 font-bold mb-1">Título</p>
                    <input 
                        type="text" 
                        class="item-title w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                        value="${item.title || ""}"
                    />
                </div>

                <div>
                    <p class="text-xs text-gray-500 font-bold mb-1">Orden</p>
                    <input 
                        type="number" 
                        class="item-order w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                        value="${item.order || 1}"
                    />
                </div>
            </div>

            <div class="mt-3">
                <p class="text-xs text-gray-500 font-bold mb-1">Texto</p>
                <textarea 
                    class="item-text w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm resize-none"
                    rows="3"
                >${item.text || ""}</textarea>
            </div>

            <button 
                class="delete-item mt-3 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 text-sm"
                data-item-id="${item.id}"
            >
                Quitar Ítem
            </button>
        </div>
        `;
    });

    return html;
}

/*  
----------------------------------------------------
4. Obtener estructura desde el DOM
----------------------------------------------------
El archivo principal usará esta función después de que
el usuario edite en pantalla.
----------------------------------------------------
*/

export function getStructureFromDOM() {
    const sectionElements = document.querySelectorAll("[data-section-id]");
    const data = [];

    sectionElements.forEach((secEl, index) => {
        const sectionId = secEl.dataset.sectionId;

        const title = secEl.querySelector(".section-title").value.trim();
        const type = secEl.querySelector(".section-type").value;
        const icon = secEl.querySelector(".section-icon").value.trim();

        const section = {
            id: sectionId,
            order: index + 1,
            title,
            type,
            icon,
            items: []
        };

        const itemEls = secEl.querySelectorAll("[data-item-id]");

        itemEls.forEach((itemEl, itemIndex) => {
            const itemId = itemEl.dataset.itemId;

            const icon = itemEl.querySelector(".item-icon").value.trim();
            const title = itemEl.querySelector(".item-title").value.trim();
            const text = itemEl.querySelector(".item-text").value.trim();
            const order = parseInt(itemEl.querySelector(".item-order").value) || itemIndex + 1;

            section.items.push({
                id: itemId,
                icon,
                title,
                text,
                order
            });
        });

        data.push(section);
    });

    return data;
}

/*  
----------------------------------------------------
5. Guardar estructura en Firestore
----------------------------------------------------
Borra y recrea todo (simple, robusto)
----------------------------------------------------
*/

export async function saveStructure(eventId, structure) {
    const structureRef = collection(db, "events", eventId, "structure");

    // borrar viejas secciones
    const existing = await getDocs(structureRef);
    await Promise.all(existing.docs.map(doc => deleteDoc(doc.ref)));

    // agregar nuevas secciones + items
    for (const sec of structure) {
        const newSecRef = await addDoc(structureRef, {
            title: sec.title,
            type: sec.type,
            icon: sec.icon,
            order: sec.order
        });

        // agregar items
        const itemsRef = collection(
            db,
            "events",
            eventId,
            "structure",
            newSecRef.id,
            "items"
        );

        for (const item of sec.items) {
            await addDoc(itemsRef, {
                title: item.title,
                text: item.text,
                icon: item.icon,
                order: item.order
            });
        }
    }
}

