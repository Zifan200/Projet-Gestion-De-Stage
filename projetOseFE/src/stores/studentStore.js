import { create } from "zustand";
import { persist } from "zustand/middleware";
import { studentService } from "../services/studentService.js";

export const useStudentStore = create(
    persist(
        (set, get) => ({
            applications: [],
            error: null,
            successMessage: null, // ← ajouté ici
            loading: false,

            loadAllApplications: async (token) => {
                try {
                    set({ loading: true, error: null });
                    const data = await studentService.getAllApplications(token);
                    set({ applications: data, loading: false });
                } catch (err) {
                    set({ error: err, loading: false });
                }
            },

            loadApplicationsByStatus: async (token, appStatus) => {
                try {
                    set({ loading: true, error: null });
                    const data = await studentService.getApplicationsByStatus(token, appStatus);
                    set({ applications: data, loading: false });
                } catch (err) {
                    set({ error: err, loading: false });
                }
            },

            acceptOffer: async (applicationId, studentEmail, token) => {
                try {
                    set({ loading: true, error: null, successMessage: null });
                    const res = await studentService.acceptOffer(applicationId, studentEmail, token);

                    const updated = get().applications.map((app) =>
                        app.id === applicationId ? { ...app, etudiantStatus: "ACCEPTED" } : app
                    );

                    set({
                        applications: updated,
                        loading: false,
                        successMessage: "Offre acceptée avec succès",
                    });

                    return res;
                } catch (err) {
                    set({
                        error: err.response?.data?.message || "Erreur lors de l'acceptation",
                        loading: false,
                    });
                }
            },

            rejectOffer: async (applicationId, studentEmail, raison, token) => {
                try {
                    set({ loading: true, error: null, successMessage: null });
                    const res = await studentService.rejectOffer(applicationId, studentEmail, raison, token);

                    const updated = get().applications.map((app) =>
                        app.id === applicationId ? { ...app, etudiantStatus: "REJECTED" } : app
                    );

                    set({
                        applications: updated,
                        loading: false,
                        successMessage: "Offre refusée avec succès",
                    });

                    return res;
                } catch (err) {
                    set({
                        error: err.response?.data?.message || "Erreur lors du refus",
                        loading: false,
                    });
                }
            },

            clearMessages: () => set({ successMessage: null, error: null }),
        }),
        { name: "student-storage" }
    )
);
