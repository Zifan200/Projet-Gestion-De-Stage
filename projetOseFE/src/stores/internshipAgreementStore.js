import {create} from "zustand";
import { internshipAgreementService } from "../services/internshipAgreementService.js";

export const useInternshipAgreementStore = create((set, get) => ({
    applications: [],
    loading: false,
    error: null,
    previewUrl: null,

    viewAgreement: async (token, agreementId) => {
        try {
            const url = await internshipAgreementService.viewAgreement(token, agreementId);
            set({ previewUrl: url });
        } catch (err) {
            set({ error: err });
            throw err;
        }
    },
}));