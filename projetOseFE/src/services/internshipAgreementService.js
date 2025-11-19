import { api } from "../lib/api.js";

export const internshipAgreementService = {
    async createAgreement(token, application, gsId, role) {
        try {
            const payload = {
                application,
                gestionnaireId: gsId,
                role
            };

            console.log("Creating agreement with payload:", payload);

            const res = await api.post("/entente/create", payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Retourner directement res.data pour debug
            const data = res.data;
            console.log("Response data:", data);

            // Convertir pdfData base64 en Blob seulement si pdfData existe
            let pdfUrl = null;
            if (data.pdfData) {
                const binary = atob(data.pdfData);
                const array = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                    array[i] = binary.charCodeAt(i);
                }
                const blob = new Blob([array], { type: "application/pdf" });
                pdfUrl = URL.createObjectURL(blob);
            }

            return {
                id: data.id,
                pdfUrl
            };
        } catch (error) {
            console.error("Erreur lors de la création de l'entente :", error);
            throw error;
        }
    },

    previewAgreement: async (token, agreementId) => {
        set({ loading: true });
        try {
            const res = await api.get(`/entente/${agreementId}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: "arraybuffer"
            });

            const blob = new Blob([res.data], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);

            set({ previewUrl: url, loading: false });
        } catch (err) {
            console.error(err);
            set({ error: err.message || "Erreur lors du preview", loading: false });
        }
    },

    async downloadAgreement(token, agreementId) {
        try {
            const res = await api.get(`/entente/${agreementId}/download`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: "blob"
            });

            const url = window.URL.createObjectURL(res.data);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "entente_stage.pdf");
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Erreur lors du téléchargement de l'entente :", error);
            throw error;
        }
    },
    async signAgreement(token, agreementId, role, signerId, signature, application) {
        try {
            const payload = {
                id: agreementId,
                gestionnaireId: 0,
                employerId: 0,
                etudiantId: 0,
                signatureGestionnaire: "",
                signatureEmployer: "",
                signatureEtudiant: "",
                application,
                role,
            };

            if (role === "GESTIONNAIRE") payload.gestionnaireId = signerId;
            else if (role === "EMPLOYER") payload.employerId = signerId;
            else if (role === "STUDENT") payload.etudiantId = signerId;

            if (role === "GESTIONNAIRE") payload.signatureGestionnaire = signature;
            else if (role === "EMPLOYER") payload.signatureEmployer = signature;
            else if (role === "STUDENT") payload.signatureEtudiant = signature;

            // ← Ici, avant l'appel PUT
            console.log("Appel PUT vers : /entente/update avec payload :", payload);

            const res = await api.put(`/entente/update`, payload, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: "arraybuffer"
            });

            const blob = new Blob([res.data], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            return { pdfUrl: url };
        } catch (err) {
            console.error("Erreur lors de la signature de l'entente :", err);
            throw err;
        }
    }
};
