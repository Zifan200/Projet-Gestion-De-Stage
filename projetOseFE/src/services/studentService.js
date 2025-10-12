import { api } from "../lib/api.js";

export const studentService = {
  async register(student) {
    const res = await api.post("/student/register", student);
    return res.data;
  },

  async applyCV(token, payload) {
    const res = await api.post("/student/apply-to-internship-offer", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },
};
