import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { employerService } from "../services/employerService.js";

export const useEmployerStore = create()(
    devtools(
        (set, get) => ({
            employers: [],
            applications: [], // <-- toutes les candidatures de l'employeur
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
                    set({ applications: applications, loading: false });
                } catch (e) {
                    set({ error: e.message, loading: false });
                }
            },

            approveInternshipApplication: async(token, id) => {
                const res = employerService.approveIntenshipApplication(token, id);
                try {
                    set((state) => ({
                        applications: state.applications.map((app) =>
                            app.id === id ? { ...app, status: "ACCEPTED" } : app
                        ),
                    }));
                } catch (err) {
                    set({ error: err, loading: false });
                }
            },
        }),
        { name: "employer-store" },
    ),
);
