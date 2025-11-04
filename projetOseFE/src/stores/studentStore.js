import { create } from "zustand";
import { persist } from "zustand/middleware";
import { studentService } from "../services/studentService.js";

export const ApprovalStatus = {
    CONFIRMED_BY_STUDENT: "CONFIRMED_BY_STUDENT",
    REJECTED_BY_STUDENT: "REJECTED_BY_STUDENT",
};

export const statusMessages = {
    CONFIRMED_BY_STUDENT: "Offre acceptée avec succès",
    REJECTED_BY_STUDENT: "Offre refusée avec succès",
};

export const useStudentStore = create(
    persist(
        (set, get) => ({
            applications: [],
            error: null,
            successMessage: null,
            loading: false,

            loadAllApplications: async (token) => {
                try {
                    set({ loading: true, error: null });
                    const data = await studentService.getAllApplications(token);
                    set({ applications: data, loading: false });
                } catch (err) {
                    const message = err.response?.data?.message || err.message || "Erreur inconnue";
                    set({ error: message, loading: false });
                }
            },

            loadApplicationsByStatus: async (token, appStatus) => {
                try {
                    set({ loading: true, error: null });
                    const data = await studentService.getApplicationsByStatus(token, appStatus);
                    set({ applications: data, loading: false });
                } catch (err) {
                    const message = err.response?.data?.message || err.message || "Erreur inconnue";
                    set({ error: message, loading: false });
                }
            },

            acceptOffer: async (applicationId, studentEmail, token) => {
                try {
                    set({ loading: true, error: null, successMessage: null });
                    const res = await studentService.acceptOffer(applicationId, studentEmail, token);

                    const updated = get().applications.map((app) =>
                        app.id === applicationId
                            ? { ...app, etudiantStatus: ApprovalStatus.CONFIRMED_BY_STUDENT }
                            : app
                    );

                    set({
                        applications: updated,
                        loading: false,
                        successMessage: statusMessages.CONFIRMED_BY_STUDENT,
                    });

                    return res;
                } catch (err) {
                    const message = err.response?.data?.message || err.message || "Erreur lors de l'acceptation";
                    set({ error: message, loading: false });
                }
            },

            rejectOffer: async (applicationId, studentEmail, raison, token) => {
                try {
                    set({ loading: true, error: null, successMessage: null });
                    const res = await studentService.rejectOffer(applicationId, studentEmail, raison, token);

                    const updated = get().applications.map((app) =>
                        app.id === applicationId
                            ? { ...app, etudiantStatus: ApprovalStatus.REJECTED_BY_STUDENT }
                            : app
                    );

                    set({
                        applications: updated,
                        loading: false,
                        successMessage: statusMessages.REJECTED_BY_STUDENT,
                    });

                    return res;
                } catch (err) {
                    const message = err.response?.data?.message || err.message || "Erreur lors du refus";
                    set({ error: message, loading: false });
                }
            },

            clearMessages: () => set({ successMessage: null, error: null }),
        }),
        { name: "student-storage" }
    )
);
