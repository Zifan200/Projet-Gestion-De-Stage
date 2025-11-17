import {create} from "zustand";
import { internshipAgreementService } from "../services/internshipAgreementService.js";
import { api } from "../lib/api.js";

export const useInternshipAgreementStore = create((set, get) => ({
    applications: [],
    loading: false,
    error: null,
    previewUrl: null,

    createInternshipAgreement: async (token, application, gsId, role) => {
        try {
            const result = await internshipAgreementService.createAgreement(token, application, gsId, role);

            set((state) => ({
                applications: state.applications.map((app) =>
                    app.id === application.id
                        ? { ...app, claimed: true, claimed_by: gsId, ententeStagePdfId: result.id }
                        : app
                ),
            }));

            return result; // pour que le composant puisse utiliser l'objet créé si besoin
        } catch (err) {
            set({ error: err });
            throw err;
        }
    },


    // 🔹 Preview d'une entente existante
    previewAgreement: async (token, agreementId) => {
        console.log("previewAgreement called with ID:", agreementId);
        set({ loading: true, error: null });

        try {
            const res = await api.get(`/entente/${agreementId}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: "arraybuffer" // <-- important
            });

            // Créer un Blob PDF à partir de l'arraybuffer
            const blob = new Blob([res.data], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);

            console.log("Preview URL generated:", url);
            set({
                previewUrl: url,
                loading: false
            });
        } catch (err) {
            console.error("Erreur lors du preview de l'entente:", err);
            set({ error: err.message || "Erreur lors du preview de l'entente", loading: false });
        }
    },


    // 🔹 Télécharger une entente
    downloadAgreement: async (token, agreementId) => {
        try {
            await internshipAgreementService.downloadAgreement(token, agreementId);
        } catch (err) {
            set({ error: err.message || "Erreur lors du téléchargement de l'entente" });
        }
    },
    resetAgreement: () => {
        set({ previewUrl: null, loading: false, error: null });
    }
}));