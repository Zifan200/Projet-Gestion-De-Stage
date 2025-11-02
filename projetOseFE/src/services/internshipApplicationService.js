import {api} from "../lib/api.js";

export const internshipApplicationService = {

    async loadAllApplications(){
        const res = await api.get(`/gs/get-all/students/with-application`);
        return res.data;
    },

    async loadAllApplicationsFromInternshipOffer(offerId){
        const res = await api.get(`/internship-applications/get-all/internship-offer/${offerId}`);
        return res.data;
    }
}