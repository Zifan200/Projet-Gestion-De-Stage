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

    async previewAgreement(token, agreementId) {
        console.log("Service: previewAgreement called with ID:", agreementId); // 🔹 log 3
        try {
            const res = await api.get(`/entente/${agreementId}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: "arraybuffer"
            });

            const blob = new Blob([res.data], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);

            console.log("Service: PDF Blob URL:", url);
            return url;
        } catch (error) {
            console.error("Service: Erreur lors du preview de l'entente :", error);
            throw error;
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
    }
};
