import { api } from "../lib/api.js";

export const studentService = {
  async register(student) {
    const res = await api.post("/student/register", student);
    return res.data;
  },
};
