import {api} from "../lib/api.js";

export const internshipApplicationService = {
    async getAllStudentsWithApplications(token) {
        const res = await api.get("/gs/", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    },
}