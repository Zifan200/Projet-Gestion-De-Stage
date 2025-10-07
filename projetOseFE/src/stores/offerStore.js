import { create } from "zustand";
import { persist } from "zustand/middleware";
import { offerService } from "../services/offerService.js";

export const useOfferStore = create(
    persist(
        (set, get) => ({
            offers: [],
            pendingOffers: [],
            acceptedOffers: [],
            rejectedOffers: [],
            offersByProgram: [],
            programs: [],
            loading: false,
            error: null,

            loadOffers: async (token) => {
                try {
                    set({ loading: true, error: null });
                    const data = await offerService.getOffers(token);
                    set({ offers: data, loading: false });
                } catch (err) {
                    set({ error: err, loading: false });
                }
            },

            loadAllOffers: async (token) => {
                try {
                    set({ loading: true, error: null });
                    const data = await offerService.getAllOffers(token);
                    set({ offers: data, loading: false });
                } catch (err) {
                    set({ error: err, loading: false });
                }
            },

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

            loadPrograms: async (token) => {
                try {
                    set({ loading: true, error: null });
                    const data = await offerService.getProgramNames(token);
                    set({ programs: data, loading: false });
                } catch (err) {
                    set({ error: err, loading: false });
                }
            },
        }),
        { name: "offer-storage" },
    ),
);