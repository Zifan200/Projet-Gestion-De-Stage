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
      const localLang = localStorage.getItem("lang") || "en";

      if (!token) {
        set({
          settings: { language: localLang },
          loading: false,
        });
        return;
      }

      const remote = await userService.getSettings(token);
      const language = remote?.language || localLang;

      if (!remote?.language) {
        await userService.updateSettings(token, { language });
      }

      if (!localStorage.getItem("lang")) {
        localStorage.setItem("lang", language);
      }

      set({ settings: { ...remote, language }, loading: false });
    } catch (err) {
      console.error(err);
      set({ error: err.message, loading: false });
    }
  },

  updateLanguage: async (language) => {
    try {
      const { token } = useAuthStore.getState();

      localStorage.setItem("lang", language);

      if (token) {
        await userService.updateSettings(token, { language });
      }

      set((state) => ({
        settings: { ...state.settings, language },
      }));
    } catch (err) {
      console.error(err);
      set({ error: err.message });
    }
  },
}));
