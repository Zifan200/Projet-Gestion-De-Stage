import {create} from "zustand";
import { toast } from "sonner";
import { internshipAgreementService } from "../services/internshipAgreementService.js";
import {offerService} from "../services/offerService.js";
import {cvService} from "../services/cvService.js";

export const useInternshipAgreementStore = create((set, get) => ({
    applications: [],
    loading: false,
    error: null,

    fetchAllAvailableApplications: async (token) => {
        try {
            set({loading: true, error: null});
            const data = await internshipAgreementService.getAllAvailable(token);
            set({applications: data, loading: false});
        } catch (err) {
            set({error: err, loading: false});
        }
    },

    createInternshipAgreement: async (token, application, gsId, role) => {
        try {
            await internshipAgreementService.createAgreement(token, application, gsId, role);
            await get().fetchAllAvailableApplications();
        } catch (err) {
            set({ error: err });
            throw err;
        }
    }
}));
