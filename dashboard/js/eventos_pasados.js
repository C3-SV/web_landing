// Firebase y datos 
import { db } from "../../js/firebase_config.js";
import {
    doc,
    collection,
    getDoc,
    updateDoc,
    getDocs,
    where,
    query,
    orderBy,
    addDoc,
    deleteDoc,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

import * as validations from "../../js/validations.js";

import * as structure from "./modules/structure.js";
import * as stats from "./modules/stats.js";
import * as gallery from "./modules/gallery.js";
import * as awards from "./modules/awards.js";
import * as links from "./modules/links.js";


// Manejo de iconos
import { ICON_OPTIONS, renderIconSelect } from "./utilities/icons.js";


const COLLECTION_NAME = "events";
let events = [];
let editingId = null;

//! 0. UTILIDADES 

function formatearFecha(timestamp) {
    try {
        const date = timestamp.toDate();
        return date.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        });
    } catch {
        return "—";
    }
}

//! 1. Cargar datos 

async function loadEvents() {
    try {
        const ref = collection(db, COLLECTION_NAME);
        const q = query(ref, where("status", "==", "finished"), orderBy("date", "asc"));
        const res = await getDocs(q);

        events = [];
        res.forEach((doc) => {
            const data = doc.data();
            events.push({
                id: doc.id,
                ...data,
            });
        });

        return { success: true, data: events };
    } catch (err) {
        console.error("Error cargando eventos", err);
        return { success: false, error: err.message };

    }
}


//! 2. Mostrar datos -- Tabla 

async function renderTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    const res = await loadEvents();

    // Cargando...
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4">Cargando...</td></tr>';

    // si falla 

    if (!res.success) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudieron cargar los eventos",
            confirmButtonText: "Ok",
            buttonsStyling: false,
            customClass: {
                confirmButton: "bg-gradient-to-r from-[#004aad] to-[#3f3dc8] text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg"
            }
        });
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-red-500">Error al cargar datos</td></tr>';
        return;
    }

    tableBody.innerHTML = "";

    // Si no hay
    if (res.data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No hay eventos registrados.</td></tr>';
        return;
    }

    // Si hay, mostrar
    res.data.forEach(event => {
        const row = `
                <tr class="hover:bg-gray-50 transition-colors border-b border-gray-100">
                    
                    <td class="px-6 py-4 text-sm text-gray-900">
                        ${event.id}
                    </td>

                    <td class="px-6 py-4 text-sm font-semibold text-gray-800">
                        ${event.title}
                    </td>

                    <td class="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        ${event.date ? formatearFecha(event.date) : 'Sin fecha'}
                    </td>

                    <td class="px-6 py-4">
                            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#004aad] to-[#4f1e5d] text-white">
                                ${event.modality}
                            </span>
                    </td>

                    <td class="px-6 py-4">
                            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#004aad] to-[#4f1e5d] text-white">
                                ${event.status}
                            </span>
                    </td>

                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex justify-center space-x-3">
                            <button onclick="editEvent('${event.id}')" class="text-blue-600 hover:text-blue-800 transition-colors p-1">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                            </button>
                            <button onclick="deleteEvent('${event.id}')" class="text-red-600 hover:text-red-800 transition-colors p-1">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        tableBody.innerHTML += row;
    });
}

//! 3. GESTION DEL MODAL  - abrir, cerrar, 
// Abrir y resetear 
function openModal() {
    const modal = document.getElementById('modal');
    const form = document.getElementById('modalForm');
    const title = document.getElementById('modalTitle');

    modal.classList.remove('hidden');
    title.innerText = 'Agregar evento pasado';
    form.reset();
    document.getElementById('eventId').value = '';

    clearImagePreviews();

    // Ir a primera tab 
    const firstTabBtn = document.querySelector('.tabBtn[data-target="tab-general"]');
    if (firstTabBtn) firstTabBtn.click();
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}




//! 4. Llenar el formulario con datos + Editar

//* TAB 1 -- General 
// Dentro de tab 1 -- reasons 
async function loadReasons(eventId) {
    const reasonsRef = collection(db, COLLECTION_NAME, eventId, "reasons");
    const q = query(reasonsRef, orderBy("order", "asc"));
    const res = await getDocs(q);

    const reasons = [];
    res.forEach(doc => {
        reasons.push({
            id: doc.id,
            ...doc.data()
        });
    });

    return reasons;
}
function fillGeneralTab(data) {
    document.getElementById("eventPrefix").value = data.heroPrefix || "";
    document.getElementById("eventTitle").value = data.title || "";
    document.getElementById("eventSubtitle").value = data.subtitle || "";
    document.getElementById("eventDescription").value = data.description || "";

    document.getElementById("eventModality").value = data.modality || "presencial";
    document.getElementById("eventLocation").value = data.location || "";
    document.getElementById("eventPrizes").value = data.awardsText || "";

    // Fecha
    if (data.date?.toDate) {
        const d = data.date.toDate();
        document.getElementById("eventDate").value = d.toISOString().split("T")[0];
    }

}

function fillGeneralImages(data) {
    const container = document.getElementById("eventImage").closest("label");
    clearImagePreviews();

    if (data.banner) {
        const img = document.createElement('img');
        img.src = data.banner;
        img.className = 'preview-image absolute inset-0 w-full h-full object-cover rounded-lg z-10';
        container.appendChild(img);
    }
}

function fillReasons(reasons) {
    const mapping = [
        { wrapper: "reason1IconWrapper", icon: "reason1Icon", title: "reason1Title", desc: "reason1Description" },
        { wrapper: "reason2IconWrapper", icon: "reason2Icon", title: "reason2Title", desc: "reason2Description" },
        { wrapper: "reason3IconWrapper", icon: "reason3Icon", title: "reason3Title", desc: "reason3Description" }
    ];

    mapping.forEach((f, index) => {
        const r = reasons[index] || {};

        // 1. Insertar el select dinámico
        const container = document.getElementById(f.wrapper);
        container.innerHTML = renderIconSelect(r.icon || "");

        // 2. Rellenar los campos normales
        document.getElementById(f.title).value = r.title || "";
        document.getElementById(f.desc).value = r.text || "";
    });
}


async function editEvent(id) {
    editingId = id;

    console.log("EDITANDO EVENTO:", id);

    const ref = doc(db, "events", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        console.error("Evento no encontrado");
        return;
    }

    const data = snap.data();
    openModal();

    //*  Cargar informacion
    //! TAB GENERAL

    fillGeneralTab(data);
    fillGeneralImages(data);
    const reasons = await loadReasons(id);
    fillReasons(reasons);

    //! TAB de STRUCTURE
    const sections = await structure.loadStructure(id);
    const html = structure.renderStructureHTML(sections);
    document.getElementById("structureList").innerHTML = html;

    //! TAB de STATS
    const statsData = await stats.loadStats(id);
    const statsHTML = stats.renderStatsHTML(statsData);
    document.getElementById("statsList").innerHTML = statsHTML;

    //! TAB de Galeria 
    const galleryData = await gallery.loadGallery(id);
    const galleryHTML = gallery.renderGalleryHTML(galleryData);
    document.getElementById("galleryList").innerHTML = galleryHTML;
    setupGalleryListeners(id);

    //! TAB de Awards
    const awardsData = await awards.loadAwards(id);
    const awardsHTML = awards.renderAwardsHTML(awardsData);
    document.getElementById("awardsList").innerHTML = awardsHTML;
    setupAwardsListeners(id);

    //! TAB de Links
    const linksData = await links.loadLinks(id);
    const linksHTML = links.renderLinksHTML(linksData);
    document.getElementById("linksList").innerHTML = linksHTML;
    setupLinksListeners(id);

}

//! 5. Crud -- guardar cambios y eliminar 

// tomar reasons para guardar y guardar Reasons 
function getReasonsFromForm() {
    const rows = [
        { wrapper: "reason1IconWrapper", title: "reason1Title", desc: "reason1Description", order: 1 },
        { wrapper: "reason2IconWrapper", title: "reason2Title", desc: "reason2Description", order: 2 },
        { wrapper: "reason3IconWrapper", title: "reason3Title", desc: "reason3Description", order: 3 }
    ];

    return rows.map(r => {
        const container = document.getElementById(r.wrapper);
        const iconSelect = container.querySelector(".icon-select");

        return {
            icon: iconSelect?.value || "",
            title: document.getElementById(r.title).value.trim(),
            text: document.getElementById(r.desc).value.trim(),
            order: r.order
        };
    }).filter(r => r.title !== "" || r.text !== "" || r.icon !== "");

}

async function guardarRazones(eventId, reasons) {
    const reasonsRef = collection(db, COLLECTION_NAME, eventId, "reasons");

    // 1. Borrar todas las razones previas
    const existing = await getDocs(reasonsRef);
    const deletions = existing.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletions.map(d => d.catch(() => { })));

    // 2. Crear nuevas
    const creates = reasons.map(r => addDoc(reasonsRef, r));
    await Promise.all(creates);
}

//! On submit para guardar 
document.getElementById("modalForm").addEventListener("submit", async (element) => {
    element.preventDefault();

    if (!editingId) return;

    const ref = doc(db, "events", editingId);

    const updated = {
        heroPrefix: document.getElementById("eventPrefix").value,
        title: document.getElementById("eventTitle").value,
        subtitle: document.getElementById("eventSubtitle").value,
        description: document.getElementById("eventDescription").value,

        date: new Date(document.getElementById("eventDate").value),
        modality: document.getElementById("eventModality").value,
        location: document.getElementById("eventLocation").value,
        awardsText: document.getElementById("eventPrizes").value
    }
    await updateDoc(ref, updated);

    //* Guardar razones 
    const reasons = getReasonsFromForm();
    try {
        await guardarRazones(editingId, reasons);
    } catch (err) {
        console.error("Error guardando razones", err);
    }

    //* Guardar structure 
    const structData = structure.getStructureFromDOM();
    try {
        await structure.saveStructure(editingId, structData);
    }
    catch (err) {
        console.error("Error guardando estructura", err)
    }

    //* Guardar Stats 
    try {
        const statsData = stats.getStatsFromDOM();
        await stats.saveStats(editingId, statsData);
    } catch (err) {
        console.error("Error guardando estadísticas", err);
    }

    //* Guardar Gallery 
    try {
        const galArray = gallery.getGalleryFromDOM();
        await gallery.saveGallery(editingId, galArray);
    } catch (err) {
        console.error("Error guardando galeria:", err);
    }

    //* Guardar Awards
    try {
        const awardsArray = awards.getAwardsFromDOM();
        await awards.saveAwards(editingId, awardsArray);
    } catch (err) {
        console.error("Error guardando premios:", err);
    }

    //* Guardar Links
    try {
        const linksArray = links.getLinksFromDOM();
        await links.saveLinks(editingId, linksArray);
    } catch (err) {
        console.error("Error guardando links:", err);
    }
    closeModal();
    renderTable();
});


// Eliminar evento 
function deleteEvent(id) {
    if (confirm('¿Borrar evento?')) {
        events = events.filter(e => e.id !== id);
        renderTable();
    }
}

//! 6. Gestion de imagenes 

function clearImagePreviews() {
    // Selecciona todas las imágenes creadas dinámicamente con la clase .preview-image
    const previewElements = document.querySelectorAll('.preview-image');

    // Las elimina del DOM
    previewElements.forEach(el => el.remove());
}


const setupImagePreview = (inputId) => {
    const input = document.getElementById(inputId);
    const container = input.closest('label');

    if (!input || !container) return;

    container.classList.add('relative', 'overflow-hidden');

    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) {
            // Si no hay archivo, remover la previsualización existente
            const oldPreview = container.querySelector('.preview-image');
            if (oldPreview) oldPreview.remove();
            return;
        }

        const oldPreview = container.querySelector('.preview-image');
        if (oldPreview) oldPreview.remove();

        const imageUrl = URL.createObjectURL(file);

        const img = document.createElement('img');
        img.src = imageUrl;
        img.className = 'preview-image absolute inset-0 w-full h-full object-cover rounded-lg z-10';

        container.appendChild(img);
    });
};


//! DOM + init + tabs

// Logica de Tabs 
function setupTabs() {
    const tabButtons = document.querySelectorAll(".tabBtn");
    const tabContents = document.querySelectorAll(".tabContent");

    tabButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();

            // Resetear clase de botones
            tabButtons.forEach(btn => {
                btn.className = "tabBtn text-gray-500 hover:text-gray-700 pb-2 border-b-2 border-transparent transition-colors cursor-pointer";
            });

            // Ocultar todos 
            tabContents.forEach(c => c.classList.add("hidden"));

            // Activar boton actual 
            btn.className = "tabBtn text-[#004aad] border-b-2 border-[#004aad] pb-2 font-bold transition-colors cursor-pointer";
            const targetTab = btn.dataset.tab;

            // Mostrar contenido
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.remove('hidden');
            }
        });
    });
}

// Logica de estructura 

function setupStructureListeners() {
    const container = document.getElementById("structureList");
    const addSectionBtn = document.getElementById("addSectionBtn");

    if (!container || !addSectionBtn) return;

    // 1. Limpiar listeners viejos
    const newContainer = container.cloneNode(true);
    container.parentNode.replaceChild(newContainer, container);

    const activeContainer = document.getElementById("structureList");

    // 2. Delegar eventos
    activeContainer.addEventListener("click", (e) => {
        e.stopPropagation();
        const target = e.target; // Definimos target correctamente

        // A) Eliminar ÍTEM
        const deleteItemBtn = target.closest(".delete-item");
        if (deleteItemBtn) {
            e.preventDefault();
            // Encontrar el item 
            const itemRow = deleteItemBtn.closest(".structure-item");

            if (itemRow) {
                if (confirm("¿Eliminar este ítem?")) {
                    itemRow.remove();
                }
            } else {
                console.error("Error: No se encontró el contenedor .structure-item");
            }
            return;
        }

        // B) Agregar ÍTEM
        const addItemBtn = target.closest(".add-item");
        if (addItemBtn) {
            e.preventDefault();
            // 1. Encontrar la SECCIÓN padre
            const sectionParent = addItemBtn.closest(".structure-section");

            if (sectionParent) {
                // 2. Buscar el contenedor de items dentro de esa sección
                const sectionBox = sectionParent.querySelector(".section-items");
                if (sectionBox) {
                    const tempId = "temp-item-" + Date.now() + Math.floor(Math.random() * 1000);

                    const newItemHTML = structure.renderItemsHTML([{
                        id: tempId,
                        icon: "",
                        title: "",
                        text: "",
                        order: sectionBox.children.length + 1
                    }]);

                    sectionBox.insertAdjacentHTML("beforeend", newItemHTML);
                }
            }
            return;
        }

        // C) Eliminar SECCIÓN
        const deleteSectionBtn = target.closest(".delete-section");
        if (deleteSectionBtn) {
            e.preventDefault();
            const section = deleteSectionBtn.closest(".structure-section");
            if (section) {
                if (confirm("¿Borrar toda la sección?")) {
                    section.remove();
                }
            }
            return;
        }
    });

    // 3. Botón de "Nueva Sección" 
    const newAddBtn = addSectionBtn.cloneNode(true);
    addSectionBtn.parentNode.replaceChild(newAddBtn, addSectionBtn);

    newAddBtn.addEventListener("click", () => {
        const tempId = "temp-sec-" + Date.now();
        const newSection = {
            id: tempId,
            order: 999,
            title: "",
            type: "default",
            icon: "",
            items: []
        };

        activeContainer.insertAdjacentHTML(
            "beforeend",
            structure.renderStructureHTML([newSection])
        );
    });
}

// para stats 

function setupStatsListeners() {
    const container = document.getElementById("statsList");
    const addStatBtn = document.getElementById("addStatBtn");

    if (!container || !addStatBtn) return;

    // iniciar listeners del contenedor
    const newContainer = container.cloneNode(true);
    container.parentNode.replaceChild(newContainer, container);

    const activeContainer = document.getElementById("statsList");

    // delegar eventos dentro de statsList
    activeContainer.addEventListener("click", (e) => {
        e.stopPropagation();
        const target = e.target;

        // Eliminar STAT
        const deleteBtn = target.closest(".delete-stat");
        if (deleteBtn) {
            e.preventDefault();
            const statItem = deleteBtn.closest(".stat-item");
            if (statItem) {
                if (confirm("¿Eliminar esta estadística?")) {
                    statItem.remove();
                }
            }
            return;
        }
    });

    // agregar dato
    const newAddBtn = addStatBtn.cloneNode(true);
    addStatBtn.parentNode.replaceChild(newAddBtn, addStatBtn);

    newAddBtn.addEventListener("click", () => {
        const tempId = "temp-stat-" + Date.now() + Math.floor(Math.random() * 1000);

        const newStat = {
            id: tempId,
            icon: "",
            text: "",
            value: "",
            order: activeContainer.children.length + 1
        };

        activeContainer.insertAdjacentHTML(
            "beforeend",
            stats.renderStatsHTML([newStat])
        );
    });
}

// logica de listeners para galeria 

function setupGalleryListeners(eventId) {
    const container = document.getElementById("galleryList");
    const addBtn = document.getElementById("addGalleryBtn");

    if (!container || !addBtn) return;

    // Reset container events
    const newContainer = container.cloneNode(true);
    container.parentNode.replaceChild(newContainer, container);

    const active = document.getElementById("galleryList");

    // Activar preview para todos
    active.querySelectorAll(".gallery-file").forEach(input => {
        setupImagePreview(input.id);
    });


    // Delegar dentro de la galería
    active.addEventListener("change", async (e) => {
        if (e.target.classList.contains("gallery-file")) {
            await gallery.handleGalleryImageChange(eventId, e.target);
        }
    });

    // boton de eliminar
    active.addEventListener("click", (e) => {
        const del = e.target.closest(".delete-gallery");
        if (del) {
            if (confirm("¿Eliminar imagen de la galería?")) {
                del.closest(".gallery-item").remove();
            }
        }
    });

    // Botón agregar
    const newBtn = addBtn.cloneNode(true);
    addBtn.parentNode.replaceChild(newBtn, addBtn);

    newBtn.addEventListener("click", () => {
        const tempId = "temp-" + Date.now();

        const newItem = {
            id: tempId,
            caption: "",
            url: "",
            order: active.children.length + 1
        };

        active.insertAdjacentHTML(
            "beforeend",
            gallery.renderGalleryHTML([newItem])
        );
    });
}

// Lógica de listeners para awards
function setupAwardsListeners(eventId) {
    const container = document.getElementById("awardsList");
    const addBtn = document.getElementById("addAwardBtn");

    if (!container || !addBtn) return;

    // Reset container events
    const newContainer = container.cloneNode(true);
    container.parentNode.replaceChild(newContainer, container);

    const active = document.getElementById("awardsList");

    // Activar preview para todos los inputs de awards
    active.querySelectorAll(".award-file").forEach(input => {
        setupImagePreview(input.id);
    });

    // Delegar dentro de la lista de awards
    active.addEventListener("change", async (e) => {
        if (e.target.classList.contains("award-file")) {
            await awards.handleAwardImageChange(eventId, e.target);
        }
    });

    // Botón de eliminar
    active.addEventListener("click", async (e) => {
        const del = e.target.closest(".delete-award");
        if (del) {
            e.preventDefault();
            e.stopPropagation();

            if (!confirm("¿Eliminar este premio? Esta acción no se puede deshacer.")) {
                return;
            }

            const awardItem = del.closest(".award-item");
            const awardId = awardItem.dataset.awardId;


            try {
                // Eliminar de Firestore
                await awards.deleteAward(eventId, awardId);

                // Eliminar del DOM
                awardItem.remove();

                // Mostrar confirmación
                const toast = document.createElement('div');
                toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
                toast.textContent = '✓ Premio eliminado correctamente';
                document.body.appendChild(toast);

                setTimeout(() => toast.remove(), 3000);
            } catch (err) {
                console.error("Error eliminando premio:", err);
                alert("Error al eliminar el premio. Intenta de nuevo.");
            }
        }
    });

    // Botón agregar
    const newBtn = addBtn.cloneNode(true);
    addBtn.parentNode.replaceChild(newBtn, addBtn);


    newBtn.addEventListener("click", () => {
        const tempId = "temp-" + Date.now();

        const newItem = {
            id: tempId,
            caption: "",
            url: "",
            order: active.children.length + 1
        };

        active.insertAdjacentHTML(
            "beforeend",
            awards.renderAwardsHTML([newItem])
        );

        // Activar preview en el nuevo item
        const newInput = document.getElementById(`award-file-${tempId}`);
        if (newInput) {
            setupImagePreview(newInput.id);
        }
    });
}

// Lógica de listeners para links
function setupLinksListeners(eventId) {
    const container = document.getElementById("linksList");
    const addBtn = document.getElementById("addLinkBtn");

    if (!container || !addBtn) return;

    // Reset container events
    const newContainer = container.cloneNode(true);
    container.parentNode.replaceChild(newContainer, container);

    const active = document.getElementById("linksList");

    // Botón de eliminar - CON ELIMINACIÓN REAL
    active.addEventListener("click", async (e) => {
        const del = e.target.closest(".delete-link");
        if (del) {
            e.preventDefault();
            e.stopPropagation();

            if (!confirm("¿Eliminar este link? Esta acción no se puede deshacer.")) {
                return;
            }

            const linkItem = del.closest(".link-item");
            const linkId = linkItem.dataset.linkId;

            try {
                // Eliminar de Firestore
                await links.deleteLink(eventId, linkId);

                // Eliminar del DOM
                linkItem.remove();

                // Mostrar confirmación
                const toast = document.createElement('div');
                toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
                toast.textContent = '✓ Link eliminado correctamente';
                document.body.appendChild(toast);

                setTimeout(() => toast.remove(), 3000);
            } catch (err) {
                console.error("Error eliminando link:", err);
                alert("Error al eliminar el link. Intenta de nuevo.");
            }
        }
    });

    // Botón agregar
    const newBtn = addBtn.cloneNode(true);
    addBtn.parentNode.replaceChild(newBtn, addBtn);

    newBtn.addEventListener("click", () => {
        const tempId = "temp-" + Date.now();

        const newItem = {
            id: tempId,
            icon: "",
            title: "",
            url: "",
            order: active.children.length + 1
        };

        active.insertAdjacentHTML(
            "beforeend",
            links.renderLinksHTML([newItem])
        );
    });
}
//! INICIALIZAR REALMENTE 

document.addEventListener("DOMContentLoaded", () => {
    renderTable();
    setupTabs();
    setupStructureListeners();
    setupStatsListeners();
});

// Manejar cambiso en selects de icons 
document.addEventListener("change", (e) => {
    if (!e.target.matches(".icon-select")) return;

    const wrapper = e.target.closest(".flex");
    const preview = wrapper.querySelector(".icon-preview");

    preview.className = "icon-preview text-gray-700 text-xl w-6 text-center";

    if (e.target.value.trim() !== "") {
        preview.classList.add(...e.target.value.split(" "));
    }
});


window.openModal = openModal;
window.closeModal = closeModal;
window.editEvent = editEvent;
window.deleteEvent = deleteEvent;
