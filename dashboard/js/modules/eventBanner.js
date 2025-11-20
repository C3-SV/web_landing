import { CLOUDINARY_URL, CLOUDINARY_PRESET } from "../../../js/cloudinary_config.js";

// Subir imagen del banner a Cloudinary
async function uploadBannerImage(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_PRESET);

    const res = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData
    });

    const data = await res.json();

    if (!data.secure_url) {
        console.error("ERROR subiendo banner a Cloudinary:", data);
        throw new Error("Cloudinary banner upload failed");
    }

    return data.secure_url;
}

// Manejar cambio de imagen del banner con subida a Cloudinary
export async function handleBannerImageChange(inputEl) {
    const file = inputEl.files[0];
    if (!file) {
        console.log("No se seleccionó archivo");
        return null;
    }

    const wrapper = inputEl.closest("label");
    if (!wrapper) {
        console.error("Wrapper del banner no encontrado");
        return null;
    }

    const placeholder = wrapper.querySelector("#bannerPlaceholder");
    
    // Buscar preview existente
    let previewEl = wrapper.querySelector(".preview-image");
    
    if (!previewEl) {
        // Crear nuevo elemento img
        previewEl = document.createElement("img");
        previewEl.className = "preview-image absolute inset-0 w-full h-full object-cover rounded-lg z-10";
        previewEl.alt = "Banner del evento";
        wrapper.appendChild(previewEl);
        console.log("Preview creado");
    }

    // Ocultar placeholder inmediatamente
    if (placeholder) {
        placeholder.style.display = "none";
    }

    // Preview local inmediato
    const localUrl = URL.createObjectURL(file);
    previewEl.src = localUrl;
    console.log("Mostrando preview local");

    try {
        // Mostrar indicador de carga (opcional)
        console.log("Subiendo a Cloudinary...");
        
        // Subir a Cloudinary
        const uploadedUrl = await uploadBannerImage(file);
        console.log(" Subido a Cloudinary:", uploadedUrl);

        // Actualizar con URL de Cloudinary
        previewEl.src = uploadedUrl;
        
        // Liberar URL local
        URL.revokeObjectURL(localUrl);

        // Guardar URL en data attribute para recuperarla al guardar
        inputEl.dataset.cloudinaryUrl = uploadedUrl;

        return uploadedUrl;
    } catch (error) {
        console.error("Error subiendo banner:", error);
        alert("Error al subir la imagen del banner. Intenta de nuevo.");
        
        // Remover preview si falla
        if (previewEl) {
            previewEl.remove();
        }
        
        // Liberar URL local
        URL.revokeObjectURL(localUrl);
        
        // Mostrar placeholder nuevamente
        if (placeholder) {
            placeholder.style.display = "flex";
        }
        
        return null;
    }
}

// Obtener URL del banner desde el DOM
export function getBannerUrl() {
    const input = document.getElementById("eventImage");
    
    // Primero intentar obtener desde data attribute (recién subida)
    if (input?.dataset.cloudinaryUrl) {
        console.log("📎 Banner desde data attribute");
        return input.dataset.cloudinaryUrl;
    }
    
    // Si no, obtener desde el preview (ya existe en Firestore)
    const container = input?.closest("label");
    const preview = container?.querySelector(".preview-image");
    
    if (preview?.src && !preview.src.startsWith("blob:")) {
        console.log("Banner desde preview existente");
        return preview.src;
    }
    
    console.log("No hay banner");
    return null;
}

/*import { CLOUDINARY_URL, CLOUDINARY_PRESET } from "../../../js/cloudinary_config.js";

// Subir imagen del banner a Cloudinary
async function uploadBannerImage(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_PRESET);

    const res = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData
    });

    const data = await res.json();

    if (!data.secure_url) {
        console.error("ERROR subiendo banner a Cloudinary:", data);
        throw new Error("Cloudinary banner upload failed");
    }

    return data.secure_url;
}

// Manejar cambio de imagen del banner con subida a Cloudinary
export async function handleBannerImageChange(inputEl) {
    const file = inputEl.files[0];
    if (!file) return null;

    const wrapper = inputEl.closest("label");
    if (!wrapper) {
        console.error("Wrapper del banner no encontrado");
        return null;
    }

    // Buscar o crear preview
    let previewEl = wrapper.querySelector(".preview-image");
    
    if (!previewEl) {
        // Si no existe, crear el elemento img
        previewEl = document.createElement("img");
        previewEl.className = "preview-image absolute inset-0 w-full h-full object-cover rounded-lg z-10";
        
        // Ocultar el placeholder
        const placeholder = wrapper.querySelector("#bannerPlaceholder");
        if (placeholder) {
            placeholder.style.display = "none";
        }
        
        wrapper.appendChild(previewEl);
    }

    // Preview local inmediato
    previewEl.src = URL.createObjectURL(file);

    try {
        // Subir a Cloudinary
        const uploadedUrl = await uploadBannerImage(file);

        // Actualizar con URL de Cloudinary
        previewEl.src = uploadedUrl;

        // Guardar URL en data attribute para recuperarla al guardar
        inputEl.dataset.cloudinaryUrl = uploadedUrl;

        return uploadedUrl;
    } catch (error) {
        console.error("Error subiendo banner:", error);
        alert("Error al subir la imagen del banner. Intenta de nuevo.");
        
        // Remover preview si falla
        if (previewEl) {
            previewEl.remove();
        }
        
        // Mostrar placeholder nuevamente
        const placeholder = wrapper.querySelector("#bannerPlaceholder");
        if (placeholder) {
            placeholder.style.display = "flex";
        }
        
        return null;
    }
}

// Obtener URL del banner desde el DOM
export function getBannerUrl() {
    const input = document.getElementById("eventImage");
    
    // Primero intentar obtener desde data attribute (recién subida)
    if (input?.dataset.cloudinaryUrl) {
        return input.dataset.cloudinaryUrl;
    }
    
    // Si no, obtener desde el preview (ya existe en Firestore)
    const container = input?.closest("label");
    const preview = container?.querySelector(".preview-image");
    
    if (preview?.src && !preview.src.startsWith("blob:")) {
        return preview.src;
    }
    
    return null;
}*/