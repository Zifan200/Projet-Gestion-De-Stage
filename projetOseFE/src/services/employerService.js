import { toast } from "sonner";
import useAuthStore from "../stores/authStore.js";
import {api} from "../lib/api.js";

export const employerService = {
  register: async (employer) => {
    try {
      const res = await fetch("http://localhost:8080/api/v1/employer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employer),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.message || "Erreur lors de l'inscription");
        throw new Error(err.message || "Erreur lors de l'inscription");
      }

      return await res.json();
    } catch (err) {
      toast.error(err.message || "Erreur inconnue");
      throw err;
    }
  },

  getAllApplications: async () => {
    try {
      // Récupérer le token depuis le localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Vous devez être connecté pour voir les candidatures");
        throw new Error("Token manquant");
      }

      const res = await fetch(
          "http://localhost:8080/api/v1/employer/get-all-internship-applications",
          {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          }
      );

      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Token invalide ou expiré, veuillez vous reconnecter");
        } else {
          toast.error("Erreur lors de la récupération des candidatures");
        }
        throw new Error(`Erreur ${res.status}`);
      }

      return await res.json();
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  approveApplication: async(token, id) => {
    const res = api.put(
        `/employer/get-internship-application/${id}/approve`,
        null,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
    );
    return res;
  },

  rejectApplication: async(token, id, reason) => {
    const res = api.put(
        `/employer/get-internship-application/${id}/reject`,
        { reason },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
    );
    return res;
  },
};
