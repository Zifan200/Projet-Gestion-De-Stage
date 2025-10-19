import { create } from "zustand";
import { userService } from "../services/userService.js";
import useAuthStore from "./authStore.js";

export const useUserStore = create((set, get) => ({
  settings: { language: "en" },
  loading: false,
  error: null,

  loadSettings: async () => {
    try {
      set({ loading: true, error: null });
      const { token } = useAuthStore.getState();
      if (!token) throw new Error("Missing token");

      const data = await userService.getSettings(token);
      console.log(data);

      const localLang = localStorage.getItem("lang") || "en";
      const language = data?.language || localLang;
      console.log(localLang);
      console.log(language);

      if (!data?.language) {
        await userService.updateSettings(token, { language });
      }

      set({ settings: { ...data, language }, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  updateLanguage: async (language) => {
    try {
      const { token } = useAuthStore.getState();
      if (!token) throw new Error("Missing token");

      await userService.updateSettings(token, { language });
      set((state) => ({
        settings: { ...state.settings, language },
      }));
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },
}));
