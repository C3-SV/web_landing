//! NADA DE ESTO FUNCIONA 
// 
import { CLOUDINARY_URL, CLOUDINARY_PRESET } from "../../../js/cloudinary_config.js";

// subir a cloudinary 

export async function uploadBannerImage(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_PRESET);

    const res = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData
    });

    if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
    }
    const data = await res.json();

    if (!data.secure_url) {
        console.error("Error subiendo banner a Cloudinary:", data);
        throw new Error("Cloudinary banner upload failed");
    }

    return data.secure_url;
}

// manejar subida de archivo y preview 

export async function handleBannerImageChange(inputEl) {
    const file = inputEl.files[0];
    if (!file) return null;

    const wrapper = inputEl.closest("label");
    if (!wrapper) {
        throw new Error("Wrapper del banner no encontrado");
    }

    // Remover preview previa
    const old = wrapper.querySelector(".preview-image");
    if (old) old.remove();

   

    // Crear preview local mientras sube
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.className =
        "preview-image absolute top-0 left-0 w-full h-full object-cover pointer-events-none";
    wrapper.appendChild(img);

    try {
        // Subir a Cloudinary
        const url = await uploadBannerImage(file);

        // Actualizar a la URL final
        img.src = url;
        inputEl.dataset.cloudinaryUrl = url;
        
        // Liberar el objeto URL temporal
        URL.revokeObjectURL(img.src);
        
        return url;
    } catch (error) {
        // Si falla la subida, remover el preview
        img.remove();
        throw error;
    }
}
