import { api } from "../lib/api.js";

export const studentService = {
  async register(student) {
    const res = await api.post("/student/register", student);
    return res.data;
  },

  async getAllApplications(token) {
    const res = await api.get("/student/get-all-internship-applications", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },

  async getApplicationsByStatus(token, appStatus) {
    const res = await api.get(`/student/get-internship-applications/${appStatus}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },
  async acceptOffer(applicationId, studentEmail, token) {
    const res = await api.post(
        `/student/${applicationId}/accept`,
        { studentEmail },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
    );
    return res.data;
  },

  async rejectOffer(applicationId, studentEmail, etudiantRaison, token) {
    const res = await api.post(
        `/student/${applicationId}/reject`,
        { studentEmail, etudiantRaison },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
    );
    return res.data;
  },
};