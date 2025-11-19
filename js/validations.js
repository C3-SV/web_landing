import { CLOUDINARY_URL, CLOUDINARY_PRESET } from './cloudinary_config.js';

export function formatDate(timestamp) {
    if (!timestamp) return null;

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
}

export async function uploadImageToCloudinary(file) {
    if (!file || file.size === 0) return null;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_PRESET);

    try {
        const res = await fetch(CLOUDINARY_URL, {
            method: "POST",
            body: formData
        });

        if (!res.ok) throw new Error("Error al subir imagen a Cloudinary");

        const data = await res.json();
        return data.secure_url; // Retorna la url de la imagen
    } catch (error) {
        console.error("Cloudinary Error:", error);
        throw error;
    }
}