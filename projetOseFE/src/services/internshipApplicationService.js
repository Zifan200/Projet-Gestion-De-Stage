import {api} from "../lib/api.js";

export const internshipApplicationService = {
    async loadStudentsWithApplications() {
        const res = await api.get("/gs/get-all/students/with-application");
        return res.data;
    },
}