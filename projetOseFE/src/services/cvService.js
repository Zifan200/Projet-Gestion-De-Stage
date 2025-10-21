import { api } from "../lib/api.js";

export const cvService = {
  async upload(file) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/student/cv/me/cv", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async list() {
    const res = await api.get("/student/cv/me");
    return res.data;
  },

  async download(cvId) {
    const res = await api.get(`/student/cv/${cvId}/download`, {
      responseType: "blob",
    });
    return res.data;
  },

  async remove(cvId) {
    const res = await api.delete(`/student/cv/${cvId}`);
    return res.status === 204;
  },

  async preview(cvId) {
    const res = await api.get(`/student/cv/${cvId}/download`, {
      responseType: "blob",
    });
    return window.URL.createObjectURL(res.data);
  },

  async downloadCv(cvId) {
    const res = await api.get(`/student/cv/${cvId}/download`, {
      responseType: "blob",
    });
    return res.data; // blob binaire
  },

  async applyCVService(token, offerId, cvId, studentEmail) {
    const payload = {
      studentEmail,
      selectedCvID: Number(cvId),
      internshipOfferId: Number(offerId),
    };

    const res = await api.post("/student/apply-to-internship-offer", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return res.data;
  },
  
  previewForEmployer(fileData, fileName) {
    if (!fileData) {
      throw new Error("Aucun fichier CV disponible pour ce candidat.");
    }
    const uint8Array = fileData instanceof Uint8Array ? fileData : new Uint8Array(fileData);
    const blob = new Blob([uint8Array], { type: "application/pdf" });
    return window.URL.createObjectURL(blob);
  },
  
  downloadForEmployer(fileData, fileName = "cv.pdf") {
    if (!fileData) throw new Error("Aucun fichier CV disponible pour le téléchargement.");
    let uint8Array;

    if (fileData instanceof Uint8Array) 
      uint8Array = fileData;
      
    else if (fileData instanceof ArrayBuffer)
      uint8Array = new Uint8Array(fileData);
    
    else if (typeof fileData === "string") {
      const base64 = fileData.includes(",") ? fileData.split(",")[1] : fileData;
      const cleanedBase64 = base64.replace(/\s/g, '');
      const binaryString = atob(cleanedBase64);
      uint8Array = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++)
        uint8Array[i] = binaryString.charCodeAt(i)
    }
    else
      throw new Error("Type de fileData inconnu pour le téléchargement.");

    const blob = new Blob([uint8Array], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};
