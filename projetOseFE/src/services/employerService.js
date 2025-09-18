import {api} from "../lib/api.js";


export const employerService = {
    async register(employer) {
        const res = await api.post('/employer/register', employer)
        return res.data
    },
}
