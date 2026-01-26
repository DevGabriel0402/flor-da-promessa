export async function uploadImagemCloudinary(arquivo, pasta = "flor-da-promessa") {
    if (!arquivo) throw new Error("Selecione uma imagem.");

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
        throw new Error("Cloudinary não configurado no .env.");
    }

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const formData = new FormData();
    formData.append("file", arquivo);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", pasta);

    const resp = await fetch(url, { method: "POST", body: formData });
    const data = await resp.json();

    if (!resp.ok) {
        throw new Error(data?.error?.message || "Falha ao enviar imagem.");
    }

    return {
        url: data.secure_url,
        publicId: data.public_id,
        largura: data.width,
        altura: data.height,
        formato: data.format,
        bytes: data.bytes,
    };
}
