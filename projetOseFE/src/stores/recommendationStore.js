import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as recommendationService from "../services/recommendationService.js";

export const useRecommendationStore = create(
  persist(
    (set, get) => ({
      recommendations: [],
      studentRecommendations: [],
      offerRecommendations: [],
      loading: false,
      error: null,

      createOrUpdateRecommendation: async (token, recommendation) => {
        try {
          set({ loading: true, error: null });
          const data = await recommendationService.createOrUpdateRecommendation(
            token,
            recommendation
          );
          set({ loading: false });
          return data;
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      loadRecommendationsForStudent: async (token, studentId) => {
        try {
          set({ loading: true, error: null });
          const data = await recommendationService.getRecommendationsForStudent(
            token,
            studentId
          );
          set({ studentRecommendations: data, loading: false });
          return data;
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      loadRecommendationsForOffer: async (token, offerId) => {
        try {
          set({ loading: true, error: null });
          const data = await recommendationService.getRecommendationsForOffer(
            token,
            offerId
          );
          set({ offerRecommendations: data, loading: false });
          return data;
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      loadAllRecommendations: async (token) => {
        try {
          set({ loading: true, error: null });
          const data = await recommendationService.getAllRecommendations(token);
          set({ recommendations: data, loading: false });
          return data;
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      loadRecommendationsByGestionnaire: async (token, gestionnaireId) => {
        try {
          set({ loading: true, error: null });
          const data =
            await recommendationService.getRecommendationsByGestionnaire(
              token,
              gestionnaireId
            );
          set({ recommendations: data, loading: false });
          return data;
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      deleteRecommendation: async (token, id) => {
        try {
          set({ loading: true, error: null });
          await recommendationService.deleteRecommendation(token, id);
          set((state) => ({
            recommendations: state.recommendations.filter((r) => r.id !== id),
            loading: false,
          }));
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      deleteRecommendationByStudentAndOffer: async (
        token,
        studentId,
        offerId
      ) => {
        try {
          set({ loading: true, error: null });
          await recommendationService.deleteRecommendationByStudentAndOffer(
            token,
            studentId,
            offerId
          );
          set((state) => ({
            recommendations: state.recommendations.filter(
              (r) => !(r.studentId === studentId && r.offerId === offerId)
            ),
            loading: false,
          }));
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "recommendation-storage",
    }
  )
);
