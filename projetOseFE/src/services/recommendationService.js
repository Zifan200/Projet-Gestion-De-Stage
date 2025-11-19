import { api } from "../lib/api";

export const createOrUpdateRecommendation = async (token, recommendation) => {
  const response = await api.post("/recommendations", recommendation, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getRecommendationsForStudent = async (token, studentId) => {
  const response = await api.get(`/recommendations/student/${studentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getRecommendationsForOffer = async (token, offerId) => {
  const response = await api.get(`/recommendations/offer/${offerId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getRecommendationsByGestionnaire = async (
  token,
  gestionnaireId
) => {
  const response = await api.get(
    `/recommendations/gestionnaire/${gestionnaireId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const getAllRecommendations = async (token) => {
  const response = await api.get("/recommendations", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getRecommendationById = async (token, id) => {
  const response = await api.get(`/recommendations/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteRecommendation = async (token, id) => {
  await api.delete(`/recommendations/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteRecommendationByStudentAndOffer = async (
  token,
  studentId,
  offerId
) => {
  await api.delete(`/recommendations/student/${studentId}/offer/${offerId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
