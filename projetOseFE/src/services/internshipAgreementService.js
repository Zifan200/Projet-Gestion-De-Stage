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
};