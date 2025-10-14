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

  async getAllOffersSummary(token) {
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

  async getRejectedOffers(token) {
    const res = await api.get("/internship-offers/filter-by-rejected-offers", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },

  async getOffersByProgram(token, program) {
    const res = await api.get(`/internship-offers/filter-by-program?program=${program}`, {
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

  async getAcceptedOffers(token) {
    const res = await api.get("/internship-offers/filter-by-accepted-offers", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },

  async getAcceptedOffersSummary(token) {
    const res = await api.get("/internship-offers/filter-by-accepted-offers", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },

  async getOfferById(token, id) {
    const res = await api.get(`/internship-offers/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },

  async getProgramNames(token) {
    const res = await api.get("/internship-offers/all-programs-name", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },
}
