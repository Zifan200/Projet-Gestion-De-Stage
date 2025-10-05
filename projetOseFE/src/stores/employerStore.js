import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { employerService } from "../services/employerService.js";

export const useEmployerStore = create()(
  devtools(
    (set, get) => ({
      employers: [],
      loading: false,
      error: null,

      createEmployer: async (employer) => {
        set({ loading: true, error: null });
        try {
          const employer = await employerService.create(employer);
          set((s) => ({
            employers: [...s.employers, employer],
            loading: false,
          }));
          return employer;
        } catch (e) {
          set({ error: e.message, loading: false });
        }
      },
    }),
    { name: "employer-store" },
  ),
);
