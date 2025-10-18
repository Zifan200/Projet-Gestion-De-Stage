import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "../services/authService.js";
import { useUserStore } from "./userStore.js"; //

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (credentials) => {
        try {
          set({ loading: true, error: null });

          const res = await authService.login(credentials);

          if (res.accessToken) {
            localStorage.setItem("token", res.accessToken);

            const userData = await authService.getMe(res.accessToken);

            set({
              user: userData,
              token: res.accessToken,
              isAuthenticated: true,
              loading: false,
            });

            const { loadSettings } = useUserStore.getState();
            await loadSettings();

            return userData;
          }
        } catch (err) {
          set({
            error: err.response?.status || "Login failed",
            loading: false,
            isAuthenticated: false,
          });
          throw err;
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);

export default useAuthStore;
