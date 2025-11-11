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
        const res = employerService.approveApplication(token, id);
        try {
            set((state) => ({
                applications: state.applications.map((app) =>
                    app.id === id ? {...app, status: "ACCEPTED"} : app
                ),
            }));
        } catch (err) {
            set({error: err, loading: false});
        }
    },

    rejectApplication: async (token, id, reason) => {
        const res = employerService.rejectApplication(token, id, reason);
        try {
            set((state) => ({
                applications: state.applications.map((app) =>
                    app.id === id ? {...app, status: "REJECTED", reason} : app
                ),
            }));
        } catch (err) {
            set({error: err, loading: false});
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
