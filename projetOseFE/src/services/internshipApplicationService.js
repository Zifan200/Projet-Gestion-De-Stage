import {api} from "../lib/api.js";

export const internshipApplicationService = {
    async getAllStudentsWithApplications(token) {
        const res = await api.get("/gs//get-all/students/with-application", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    },
}