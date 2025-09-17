import {api} from "../lib/api.js";


export const employerService = {
    async create(employer) {
        const res = await api.post('/employers', employer)
        return res.data
    },
}
