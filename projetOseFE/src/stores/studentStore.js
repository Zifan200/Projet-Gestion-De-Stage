import { create } from "zustand";
import { persist } from "zustand/middleware";
import { studentService } from "../services/studentService.js";

export const useStudentStore = create(
    persist(
        (set, get) => ({
            applications: [],
            error: null,
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
        }),
        {name: "student-storage"}
    )
);