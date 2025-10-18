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
};
