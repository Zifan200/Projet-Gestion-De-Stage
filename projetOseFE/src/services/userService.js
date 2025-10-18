import { api } from "../lib/api.js";

export const userService = {
  async getSettings(token) {
    const res = await api.get(`/user/settings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data;
  },

  async updateSettings(token, settings) {
    const res = await api.put(`/user/settings`, settings, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data;
  },
};
