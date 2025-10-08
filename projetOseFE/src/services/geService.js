import { api } from "../lib/api.js";

export const geService = {
  async getAllStudentCvs(token) {
    const res = await api.get("/gs/list", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },

  async approveCv(cvId, token) {
    const res = await api.put(`/gs/${cvId}/approve`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },

  async rejectCv(cvId, reason, token) {
    const res = await api.put(
      `/gs/${cvId}/reject`,
      { reason },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return res.data;
  },

  async updateCvStatus(cvId, status, reason, token) {
    const res = await api.put(
      `/gs/${cvId}/status`,
      { status, reason },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return res.data;
  },

  async downloadCv(cvId, token) {
    const res = await api.get(`/gs/${cvId}/download`, {
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },
};
