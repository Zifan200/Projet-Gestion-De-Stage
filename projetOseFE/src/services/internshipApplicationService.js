import {api} from "../lib/api.js";

export const internshipApplicationService = {

    async loadAllApplicationsFromInternshipOffer(offerId){
        const res = await api.get(`/internship-applications/get-all/internship-offer/${offerId}`);
        return res.data;
    }
}