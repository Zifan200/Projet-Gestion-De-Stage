import { create } from "zustand";
import { persist } from "zustand/middleware";
import { offerService } from "../services/offerService.js";

export const useOfferStore = create(
  persist(
    (set, get) => ({
      offers: [],
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

      createOffer: async (token, payload) => {
        const data = await offerService.createOffer(token, payload);
        set({ offers: [...get().offers, data] });
        return data;
      },

      deleteOffer: async (token, id) => {
        await offerService.deleteOffer(token, id);
        set({ offers: get().offers.filter((o) => o.id !== id) });
      },
    }),
    { name: "offer-storage" },
  ),
);
