import { create } from "zustand";
import { cvService } from "../services/cvService.js";

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

  applyCv: async (offerId, cvId) => {
    try {
      await cvService.apply(offerId, cvId);
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  closePreview: () => set({ previewUrl: null, previewType: null }),
}));

