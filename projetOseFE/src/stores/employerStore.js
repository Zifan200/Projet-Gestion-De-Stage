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

            createEmployer: async (employerData) => {
                set({ loading: true, error: null });
                try {
                    const employer = await employerService.register(employerData);
                    set((s) => ({
                        employers: [...s.employers, employer],
                        loading: false,
                    }));
                    return employer;
                } catch (e) {
                    set({ error: e.message, loading: false });
                }
            },

            // Récupérer toutes les candidatures de l'employeur connecté
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
        { name: "employer-store" }
    )
);
