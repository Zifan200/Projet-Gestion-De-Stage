import { api } from "../lib/api.js";

export const internshipAgreementService = {
    async getAllAvailable(token){
        const res = await api.get("/entente/all-available", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    },

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
    }
};