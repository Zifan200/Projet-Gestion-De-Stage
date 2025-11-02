import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { employerService } from "../services/employerService.js";

export const useEmployerStore = create()(
    devtools(
        (set, get) => ({
            employers: [],
            applications: [],
            loading: false,
            error: null,

            createEmployer: async (employer) => {
                set({ loading: true, error: null });
                try {
                    const newEmployer = await employerService.register(employer);
                    set((s) => ({
                        employers: [...s.employers, newEmployer],
                        loading: false,
                    }));
                    return newEmployer;
                } catch (e) {
                    set({ error: e.message, loading: false });
                }
            },

            // Récupérer toutes les candidatures pour l'employeur connecté
            fetchApplications: async () => {
                set({ loading: true, error: null });
                try {
                    const applications = await employerService.getAllApplications();
                    set({ applications, loading: false });
                } catch (e) {
                    set({ error: e.message, loading: false });
                }
            },
        }),
        { name: "employer-store" },
    ),
);
