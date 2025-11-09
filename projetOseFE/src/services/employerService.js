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

  createConvocation : async (formData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/api/v1/employer/create-convocation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'envoi de la convocation");
      }

      const data = await response.json();
      console.log("Convocation créée :", data);
      toast.success("Convocation envoyée avec succès !");
    }
    catch (error) {
      console.error("Erreur lors de la création :", error);
      toast.error(error.message);
    }
  },

  getListConvocation: async (token) =>{
    const res = await api.get(
        `/employer/liste-convocations-employer`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
    );
    return res.data
  }
};
