import { api } from "../lib/api.js";

export const employerService = {
  async register(employer) {
    const res = await api.post("/employer/register", employer);
    return res.data;
  },

  async getAllApplications() {
    const token = localStorage.getItem("jwtToken"); // Récupère le JWT stocké
    const res = await fetch("http://localhost:8080/api/v1/employer/get-all-internship-applications", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    return await res.json();
  }
};
