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

            return result;
        } catch (err) {
            set({ error: err });
            throw err;
        }
    },


    previewAgreement: async (token, agreementId) => {
        console.log("🔹 previewAgreement called");
        console.log("Token:", token);
        console.log("Agreement ID:", agreementId);

        set({ loading: true });
        try {
            const res = await api.get(`/entente/${agreementId}/preview`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: "arraybuffer"
            });

            console.log("Backend response status:", res.status);
            console.log("Backend data length:", res.data?.byteLength);

            const blob = new Blob([res.data], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            console.log("Blob URL created:", url);

            set({ previewUrl: url, loading: false });
        } catch (err) {
            console.error("Erreur lors du preview de l'entente :", err);
            set({ error: err.message || "Erreur lors du preview", loading: false });
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
    signAgreement: async (token, agreementId, signature, gsId, application) => {
        try {
            const payload = {
                id: agreementId,
                application: application,
                gestionnaireId: gsId,
                role: "GESTIONNAIRE",
                signatureGestionnaire: signature
            };

            const res = await api.put(`/entente/update`, payload, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: "arraybuffer" // on reçoit le PDF signé
            });

            // Convertir pdfData en URL pour le preview
            const blob = new Blob([res.data], { type: "application/pdf" });
            const pdfUrl = URL.createObjectURL(blob);

            set({ previewUrl: pdfUrl });
            return pdfUrl;
        } catch (err) {
            console.error("Erreur lors de la signature de l'entente :", err);
            throw err;
        }
    },


    resetAgreement: () => {
        const { previewUrl } = get();
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        set({ previewUrl: null, loading: false, error: null });
    }
}));