// UI (pages, composants)
//    ↓ appelle des actions
// STORE (zustand: state global + logique métier)
//    ↓ appelle des fonctions
// SERVICE (authService: API calls)
//    ↓ parle au backend
// BACKEND (API REST/GraphQL)
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "../services/authService.js";

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

                        return userData; // important: pour la page qui veut rediriger
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
            name: "auth-storage", // persist
        }
    )
);

export default useAuthStore;