import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { employerService } from "../services/employerService.js";
import {studentService} from "../services/studentService.js";

export const useEmployerStore = create()(
    devtools(
        (set, get) => ({
            employers: [],
            applications: [],
            convocations: [],
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

            approveApplication: async(token, id) => {
                const res = employerService.approveApplication(token, id);
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

            rejectApplication: async(token, id, reason) => {
                const res = employerService.rejectApplication(token, id, reason);
                try {
                    set((state) => ({
                        applications: state.applications.map((app) =>
                            app.id === id ? { ...app, status: "REJECTED", reason } : app
                        ),
                    }));
                } catch (err) {
                    set({ error: err, loading: false });
                }
            },

            loadConvocations: async (token) => {
                try {
                    set({ loading: true, error: null });
                    const res = await employerService.getConvocationsForEmployer(token);

                    const convocationsWithRawStatus = res.map(c => ({
                        ...c, rawStatus: c.status.toLowerCase()
                    }));

                    set({ convocations: convocationsWithRawStatus, loading: false });
                } catch (err) {
                    set({ error: err, loading: false });
                }
            },

            createConvocation: async (formData) => {
                set({ loading: true, error: null });

                try {
                    await employerService.createConvocation(formData);
                    set({ loading: false });
                }
                catch (e) {
                    set({ error: e.message, loading: false });
                }
            },
            updateConvocationStatus: async (convocationId, studentEmail, convocationStatus, token) => {
                set({ loading: true, error: null });

                try {
                    const updatedConvocation = await employerService.updateConvocationStatus(
                        convocationId,
                        studentEmail,
                        convocationStatus,
                        token
                    );

                    set((state) => ({
                        applications: state.applications.map((app) =>
                            app.id === convocationId ? { ...app, status: convocationStatus } : app
                        ),
                        loading: false,
                    }));

                    return updatedConvocation;
                }
                catch (err) {
                    set({ error: err.message, loading: false });
                    throw err;
                }
            },
        }),
        { name: "employer-store" },
    ),
);
