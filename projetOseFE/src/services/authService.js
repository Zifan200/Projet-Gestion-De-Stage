import { api } from "../lib/api.js";

export const authService = {
  async requestPasswordChange(email) {
    return await api.post(
      `/user/password-reset/request?email=${email}`,
      email,
    );
  },

  async resetPasswordChange(token, newPassword) {
    return await api.post(
      `/user/password-reset/confirm`,
      {
        token,
        newPassword,
      },
    );
  },

  async getMe(token) {
    const res = await api.get(`/user/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },

  async login(userCredential) {
    const res = await api.post(
      `/user/signin`,
      userCredential,
      {
        headers: {},
      },
    );
    return res.data;
  },
};
