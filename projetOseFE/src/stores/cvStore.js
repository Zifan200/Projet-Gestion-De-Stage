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

  // ===================== Fonctions pour l’employeur =====================
  // previewCvForEmployer: async (cvId, studentEmail) => {
  //   try {
  //     const { token } = useAuthStore.getState(); // récupère le token
  //
  //     // appelle le service (qui gère la structure JSON attendue)
  //     const url = await cvService.previewForEmployer(cvId, studentEmail, token);
  //
  //     set({ previewUrl: url, previewType: "pdf" });
  //   } catch (err) {
  //     console.error("Erreur previewCvForEmployer:", err);
  //     set({ error: err.message });
  //     throw err;
  //   }
  // },
  //
  // downloadCvForEmployer: async (cvId, fileName, studentEmail) => {
  //   try {
  //     const { token } = useAuthStore.getState();
  //
  //     // idem : passe l'email et le token au service
  //     await cvService.downloadCvForEmployer(cvId, fileName, studentEmail, token);
  //   } catch (err) {
  //     console.error("Erreur downloadCvForEmployer:", err);
  //     set({ error: err.message });
  //     throw err;
  //   }
  // },
  //
  // closePreview: () => set({ previewUrl: null, previewType: null }),
}));
