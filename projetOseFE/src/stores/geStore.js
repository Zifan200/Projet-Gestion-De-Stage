import {create} from "zustand";
import {persist} from "zustand/middleware";
import {geService} from "../services/geService.js";
import {internshipApplicationService} from "../services/internshipApplicationService.js"

export const useGeStore = create(
    persist(
        (set, get) => ({
            applicationsList: [],
            selectedOfferApplicationsList: [],
            cvs: [],
            downloadingId: null,
            loading: false,
            error: null,

            loadAllsStudentCvs: async () => {
                try {
                    const data = await geService.getAllStudentCvs();
                    set({cvs: data, error: null});
                } catch (err) {
                    set({error: err.message});
                }
            },
            loadAllInternshipApplications: async () => {
                try {
                    const data = await geService.getAllInternshipApplications();
                    set({applications: data, error: null});
                } catch (err) {
                    set({error: err.message});
                }
            },


            approveCv: async (cvId) => {
                const res = await geService.approveCv(cvId);
                set((state) => ({
                    cvs: state.cvs.map((cv) =>
                        cv.id === cvId ? {...cv, status: "ACCEPTED"} : cv,
                    ),
                }));
                return res;
            },

            rejectCv: async (cvId, reason) => {
                const res = await geService.rejectCv(cvId, reason);
                set((state) => ({
                    cvs: state.cvs.map((cv) =>
                        cv.id === cvId ? {...cv, status: "REJECTED", reason} : cv,
                    ),
                }));
                return res;
            },

            downloadCv: async (cvId, options = {preview: false}) => {
                set({downloadingId: cvId});
                const blob = await geService.downloadCv(cvId);

                if (options.preview) {
                    return blob;
                }

                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `cv_${cvId}`;
                link.click();
                URL.revokeObjectURL(url);
                set({downloadingId: null});
            },

            loadAllApplications: async () =>{
                try{
                    set({loading: true, error: null });
                    const data = await internshipApplicationService.loadAllApplications();
                    set({applicationsList:data, loading: false});
                }catch (err){
                    set({error: err, loading: false});
                }
            },

            loadAllApplicationsFromInternshipOffer: async (offerId) =>{
                try{
                    set({loading: true, error: null });
                    const data = await internshipApplicationService.loadAllApplicationsFromInternshipOffer(offerId);
                    set({selectedOfferApplicationsList:data, loading: false});
                }catch (err){
                    set({error: err, loading: false});
                }
            },
        }),
        {name: "ge-storage"},
    ),
);

export default useGeStore;
