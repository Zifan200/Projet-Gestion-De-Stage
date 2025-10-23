import {create} from "zustand";
import {persist} from "zustand/middleware";
import {offerService} from "../services/offerService.js";

export const useOfferStore = create(
    persist(
        (set, get) => ({
            offers: [],
            pendingOffers: [],
            acceptedOffers: [],
            rejectedOffers: [],
            offersByProgram: [],
            programs: [],
            selectedOffer: null,
            loading: false,
            error: null,

            // Pour l'employeur : charger ses offres complètes
            loadOffers: async (token) => {
                try {
                    set({ loading: true, error: null });
                    const data = await offerService.getOffers(token);
                    set({ offers: data, loading: false });
                } catch (err) {
                    set({ error: err, loading: false });
                }
            },

            loadAllOffersSummary: async (token) => {
                try {
                    set({ loading: true, error: null });
                    const data = await offerService.getAllOffersSummary(token);
                    set({ offers: data, loading: false });
                } catch (err) {
                    set({ error: err, loading: false });
                }
            },

            createOffer: async (token, payload) => {
                const data = await offerService.createOffer(token, payload);
                set({ offers: [...get().offers, data] });
                return data;
            },

            deleteOffer: async (token, id) => {
                await offerService.deleteOffer(token, id);
                set({ offers: get().offers.filter((o) => o.id !== id) });
            },

            // Pour l'étudiant : charger les résumés d'offres
            loadOffersSummary: async (token) => {
                try {
                    set({ loading: true, error: null });
                    const data = await offerService.getAcceptedOffersSummary(token);
                    set({ offers: data, loading: false });
                } catch (err) {
                    set({ error: err, loading: false });
                }
            },
            // Modal pour voir les détails d'une offre
            viewOffer: async (token, offerId) => {
                try {
                    const data = await offerService.getOfferById(token, offerId);
                    set({ selectedOffer: data, isModalOpen: true });
                } catch (err) {
                    console.error(err);
                    set({ error: err, loading: false});
                }
            },

            updateOfferStatus: async (token, id, status, reason) => {
                try {
                    set({ loading: true, error: null });
                    const updatedOffer = await offerService.updateOfferStatus(
                        token,
                        id,
                        status,
                        reason
                    );

                    // Mettre à jour l'offre correspondante dans le store
                    set({
                        offers: get().offers.map((o) =>
                            o.id === updatedOffer.id ? updatedOffer : o
                        ),
                        loading: false,
                    });

                    return updatedOffer;
                } catch (err) {
                    set({ error: err, loading: false });
                    throw err;
                }
            },

            closeModal: () => set({ selectedOffer: null, isModalOpen: false }),

            loadPendingOffers: async (token) => {
                try {
                    set({ loading: true, error: null });
                    const data = await offerService.getPendingOffers(token);
                    set({ pendingOffers: data, loading: false });
                } catch (err) {
                    set({ error: err, loading: false });
                }
            },

            loadRejectedOffers: async (token) => {
                try {
                    set({ loading: true, error: null });
                    const data = await offerService.getRejectedOffers(token);
                    set({ rejectedOffers: data, loading: false });
                } catch (err) {
                    set({ error: err, loading: false });
                }
            },

            loadAcceptedOffers: async (token) => {
                try {
                    set({ loading: true, error: null });
                    const data = await offerService.getAcceptedOffers(token);
                    set({ acceptedOffers: data, loading: false });
                } catch (err) {
                    set({ error: err, loading: false });
                }
            },

            loadOffersByProgram: async (token, program) => {
                try {
                    set({ loading: true, error: null });
                    const data = await offerService.getOffersByProgram(token, program);
                    set({ offersByProgram: data, loading: false });
                    return data;
                } catch (err) {
                    set({ error: err, loading: false });
                }
            },

            loadPrograms: async (token) => {
                try {
                    set({ loading: true, error: null });
                    const data = await offerService.getProgramNames(token);
                    set({ programs: data, loading: false });
                } catch (err) {
                    set({ error: err, loading: false });
                }
            },
            downloadOfferPdf: async (token, id) => {
                try {
                    const pdfBlob = await offerService.downloadOfferPdf(token, id);

                    const url = window.URL.createObjectURL(new Blob([pdfBlob],
                        { type: "application/pdf" }));
                    const link = document.createElement("a");
                    link.href = url;

                    link.setAttribute("download", `internship_offer.pdf`);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();

                    return true;
                }
                catch (err) {
                    console.error("Error :", err);
                    throw err;
                }
            }
        }),

        { name: "offer-storage" }
    )
);
