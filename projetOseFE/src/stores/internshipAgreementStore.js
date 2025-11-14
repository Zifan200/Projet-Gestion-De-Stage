import {create} from "zustand";
import { toast } from "sonner";
import { internshipAgreementService } from "../services/internshipAgreementService.js";

export const useInternshipAgreementStore = create((set, get) => ({
    agreements: [],
    applications: [],
    loading: false,
    error: null,

    fetchAllAvailableApplications: async (token) => {
        try {
            set({loading: true, error: null});
            const data = await internshipAgreementService.getAllAvailable(token);
            set({applications: data, loading: false});
        } catch (e) {
            set({error: e.message, loading: false});
        }
    },
}));
