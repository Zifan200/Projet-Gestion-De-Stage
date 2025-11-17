import { api } from "../lib/api.js";

export const internshipAgreementService = {
    async createAgreement(token, application, gsId, role){
        const res = await api.post(
            "/entente/create",
            { application: application, gestionnaireId: gsId, role: role },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            }
        );
        return res.data;
    },

    async viewAgreement(token, agreementId){
        const res = await api.get(`/entente/${agreementId}`,
            {
                responseType: "blob",
                headers: {
                    Authorization: `Bearer ${token}`
                },
            }
        );
        return window.URL.createObjectURL(res.data);
    },

    async downloadAgreement(token, agreementId) {
        const res = await api.get(`/entente/${agreementId}/download`, {
            responseType: "blob",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    },
};