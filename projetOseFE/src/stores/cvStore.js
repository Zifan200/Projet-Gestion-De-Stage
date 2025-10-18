import { create } from "zustand";
import { cvService } from "../services/cvService.js";
import useAuthStore from "./authStore.js";

export const useCvStore = create((set, get) => ({
  cvs: [],
  loading: false,
  error: null,
  previewUrl: null,
  previewType: null,

  loadCvs: async () => {
    try {
      set({ loading: true, error: null });
      const data = await cvService.list();
      set({ cvs: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  uploadCv: async (file) => {
    try {
      await cvService.upload(file);
      await get().loadCvs();
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteCv: async (cvId) => {
    try {
      await cvService.remove(cvId);
      await get().loadCvs();
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  downloadCv: async (cvId, fileName) => {
    try {
      const blob = await cvService.download(cvId);
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "cv.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  previewCv: async (cvId, fileType) => {
    try {
      const url = await cvService.preview(cvId);
      set({ previewUrl: url, previewType: fileType });
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  previewCvForEmployer: (fileData, fileName) => {
    if (!fileData) {
      const errorMsg = "Aucun fichier CV disponible pour ce candidat.";
      set({ error: errorMsg });
      return;
    }

    try {
      let uint8Array;

      if (fileData instanceof Uint8Array) {
        uint8Array = fileData;
      } else if (fileData instanceof ArrayBuffer) {
        uint8Array = new Uint8Array(fileData);
      } else if (typeof fileData === "string") {
        // Décoder le Base64 en bytes
        const binaryString = atob(fileData);
        const len = binaryString.length;
        uint8Array = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          uint8Array[i] = binaryString.charCodeAt(i);
        }
      } else {
        const errorMsg = "Type de fileData inconnu pour la prévisualisation.";
        set({ error: errorMsg });
        return;
      }

      const blob = new Blob([uint8Array], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      set({ previewUrl: url, previewType: "pdf" });
    } catch (err) {
      set({ error: "Impossible de prévisualiser le CV." });
    }
  },


  applyCvStore: async (offerId, cvId) => {
    try {
      const { user, token } = useAuthStore.getState();
      if (!user || !user.email) throw new Error("Student email is required");
      if (!token) throw new Error("Token is required");

      await cvService.applyCVService(token, offerId, cvId, user.email);
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },
}));
