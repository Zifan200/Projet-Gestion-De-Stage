import {create} from "zustand";
import {devtools} from "zustand/middleware";
import {employerService} from "../services/employerService.js";
import { toast } from "sonner";

import { create } from "zustand";
import { employerService } from "../services/employerService.js";

export const useEmployerStore = create((set, get) => ({
    employers: [],
    applications: [],
    convocations: [],
    loading: false,
    error: null,

    createEmployer: async (employer) => {
        set({loading: true, error: null});
        try {
            const newEmployer = await employerService.register(employer);
            set((s) => ({
                employers: [...s.employers, newEmployer],
                loading: false,
            }));
            return newEmployer;
        } catch (e) {
            set({error: e.message, loading: false});
        }
    },

    // Récupérer toutes les candidatures pour l'employeur connecté
    fetchApplications: async () => {
        try {
            set({loading: true, error: null});
            const data = await employerService.getAllApplications();
            set({applications: data, loading: false});
        } catch (e) {
            set({error: e.message, loading: false});
        }
    },

    approveApplication: async (token, id) => {
        try {
            const updatedApp = await employerService.approveApplication(token, id);

            set((state) => ({
                applications: state.applications.map((app) =>
                    app.id === id ? { ...app, postInterviewStatus: updatedApp.postInterviewStatus } : app
                ),
            }));

            toast.success("Candidature approuvée !");
        } catch (err) {
            console.error(err);
            set({ error: err.message || err, loading: false });
            toast.error("Impossible d'approuver la candidature");
        }
    },

    rejectApplicationPostInterview: async (token, id, reason) => {
        try {
            const updatedApp = await employerService.rejectApplication(token, id, reason);

            set((state) => ({
                applications: state.applications.map((app) =>
                    app.id === id ? { ...app, status: updatedApp.status, reason: updatedApp.reason } : app
                ),
            }));

            toast.error("Candidature rejetée !");
        } catch (err) {
            console.error(err);
            set({ error: err.message || err, loading: false });
            toast.error("Impossible de rejeter la candidature");
        }
    },


    fetchListConvocation: async (token) =>{
        try {
            set({loading: true, error: null});
            const data = await employerService.getListConvocation(token);
            set({convocations: data, loading: false});
        } catch (e) {
            set({error: e.message, loading: false});
        }
    },

    createConvocation: async (formData) => {
        set({loading: true, error: null});

        try {
            // 1️⃣ Create the convocation via API
            const newConvocation = await employerService.createConvocation(formData);

            // 2️⃣ Update the local store immediately
            set((state) => ({
                convocations: [...state.convocations, newConvocation],
                loading: false,
            }));

            // 3️⃣ (Optional but recommended) Re-fetch the list to ensure backend is synced
            const refreshed = await employerService.getListConvocation();
            set({ convocations: refreshed });

            return newConvocation;
        }  catch (e) {
            set({ error: e.message, loading: false });
            throw e;
        }
    },
    updateConvocationStatus: async (convocationId, studentEmail, convocationStatus, token) => {
        set({loading: true, error: null});

        try {
            const updatedConvocation = await employerService.updateConvocationStatus(
                convocationId,
                studentEmail,
                convocationStatus,
                token
            );

            set((state) => ({
                applications: state.applications.map((app) =>
                    app.id === convocationId ? {...app, status: convocationStatus} : app
                ),
                loading: false,
            }));

            return updatedConvocation;
        } catch (err) {
            set({error: err.message, loading: false});
            throw err;
        }
    },
}));
