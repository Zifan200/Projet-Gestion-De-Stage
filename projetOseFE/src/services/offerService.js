import { api } from "../lib/api.js";

export const offerService = {
  async createOffer(token, payload) {
    const res = await api.post("/employer/create-internship-offer", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },

  async getOffers(token) {
    const res = await api.get("/employer/offers", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },

  async getAllOffers(token) {
    const res = await api.get("/internship-offers/all-offers-summary", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },

  async getPendingOffers(token) {
    const res = await api.get("/internship-offers/filter-by-pending-offers", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },

  async getAcceptedOffers(token) {
    const res = await api.get("/internship-offers/filter-by-accepted-offers", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },

  async getRejectedOffers(token) {
    const res = await api.get("/internship-offers/filter-by-rejected-offers", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },

  async deleteOffer(token, id) {
    await api.delete(`/employer/offers/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
