import {api} from "../lib/api.js";

export const intershipOfferService = {
    async getAllOffersSummary() {
        const res = await api.get("/internship-offers/all-offers-summary");
        return res.data;
    },
}