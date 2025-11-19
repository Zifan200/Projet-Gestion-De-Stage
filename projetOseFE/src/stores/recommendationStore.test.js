import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRecommendationStore } from "./recommendationStore.js";
import * as recommendationService from "../services/recommendationService.js";

vi.mock("../services/recommendationService.js");

describe("recommendationStore", () => {
  const mockToken = "test-token";

  beforeEach(() => {
    vi.clearAllMocks();
    useRecommendationStore.setState({
      recommendations: [],
      studentRecommendations: [],
      offerRecommendations: [],
      loading: false,
      error: null,
    });
  });

  describe("createOrUpdateRecommendation", () => {
    it("should create or update a recommendation successfully", async () => {
      const mockRecommendation = {
        studentId: 1,
        offerId: 2,
        priorityCode: "GREEN",
      };
      const mockResponse = {
        id: 1,
        ...mockRecommendation,
        recommendedAt: "2024-01-01",
      };

      recommendationService.createOrUpdateRecommendation.mockResolvedValue(
        mockResponse
      );

      const result = await useRecommendationStore
        .getState()
        .createOrUpdateRecommendation(mockToken, mockRecommendation);

      expect(result).toEqual(mockResponse);
      expect(useRecommendationStore.getState().loading).toBe(false);
      expect(useRecommendationStore.getState().error).toBe(null);
    });

    it("should handle errors when creating recommendation", async () => {
      const mockError = new Error("Create failed");
      recommendationService.createOrUpdateRecommendation.mockRejectedValue(
        mockError
      );

      await expect(
        useRecommendationStore
          .getState()
          .createOrUpdateRecommendation(mockToken, {})
      ).rejects.toThrow("Create failed");

      expect(useRecommendationStore.getState().error).toBe("Create failed");
      expect(useRecommendationStore.getState().loading).toBe(false);
    });
  });

  describe("loadRecommendationsForStudent", () => {
    it("should load student recommendations successfully", async () => {
      const mockRecommendations = [
        {
          id: 1,
          studentId: 1,
          offerId: 2,
          priorityCode: "GREEN",
        },
        {
          id: 2,
          studentId: 1,
          offerId: 3,
          priorityCode: "BLUE",
        },
      ];

      recommendationService.getRecommendationsForStudent.mockResolvedValue(
        mockRecommendations
      );

      await useRecommendationStore
        .getState()
        .loadRecommendationsForStudent(mockToken, 1);

      expect(useRecommendationStore.getState().studentRecommendations).toEqual(
        mockRecommendations
      );
      expect(useRecommendationStore.getState().loading).toBe(false);
      expect(useRecommendationStore.getState().error).toBe(null);
    });

    it("should handle errors when loading student recommendations", async () => {
      const mockError = new Error("Load failed");
      recommendationService.getRecommendationsForStudent.mockRejectedValue(
        mockError
      );

      await expect(
        useRecommendationStore
          .getState()
          .loadRecommendationsForStudent(mockToken, 1)
      ).rejects.toThrow("Load failed");

      expect(useRecommendationStore.getState().error).toBe("Load failed");
      expect(useRecommendationStore.getState().loading).toBe(false);
    });
  });

  describe("loadRecommendationsForOffer", () => {
    it("should load offer recommendations successfully", async () => {
      const mockRecommendations = [
        {
          id: 1,
          studentId: 1,
          offerId: 2,
          priorityCode: "GOLD",
        },
      ];

      recommendationService.getRecommendationsForOffer.mockResolvedValue(
        mockRecommendations
      );

      await useRecommendationStore
        .getState()
        .loadRecommendationsForOffer(mockToken, 2);

      expect(useRecommendationStore.getState().offerRecommendations).toEqual(
        mockRecommendations
      );
      expect(useRecommendationStore.getState().loading).toBe(false);
    });

    it("should handle errors when loading offer recommendations", async () => {
      const mockError = new Error("Load failed");
      recommendationService.getRecommendationsForOffer.mockRejectedValue(
        mockError
      );

      await expect(
        useRecommendationStore
          .getState()
          .loadRecommendationsForOffer(mockToken, 2)
      ).rejects.toThrow("Load failed");

      expect(useRecommendationStore.getState().error).toBe("Load failed");
    });
  });

  describe("loadAllRecommendations", () => {
    it("should load all recommendations successfully", async () => {
      const mockRecommendations = [
        { id: 1, priorityCode: "GREEN" },
        { id: 2, priorityCode: "BLUE" },
      ];

      recommendationService.getAllRecommendations.mockResolvedValue(
        mockRecommendations
      );

      await useRecommendationStore
        .getState()
        .loadAllRecommendations(mockToken);

      expect(useRecommendationStore.getState().recommendations).toEqual(
        mockRecommendations
      );
      expect(useRecommendationStore.getState().loading).toBe(false);
    });

    it("should handle errors when loading all recommendations", async () => {
      const mockError = new Error("Load failed");
      recommendationService.getAllRecommendations.mockRejectedValue(mockError);

      await expect(
        useRecommendationStore.getState().loadAllRecommendations(mockToken)
      ).rejects.toThrow("Load failed");

      expect(useRecommendationStore.getState().error).toBe("Load failed");
    });
  });

  describe("loadRecommendationsByGestionnaire", () => {
    it("should load recommendations by gestionnaire successfully", async () => {
      const mockRecommendations = [
        {
          id: 1,
          gestionnaireId: 5,
          priorityCode: "GREEN",
        },
      ];

      recommendationService.getRecommendationsByGestionnaire.mockResolvedValue(
        mockRecommendations
      );

      await useRecommendationStore
        .getState()
        .loadRecommendationsByGestionnaire(mockToken, 5);

      expect(useRecommendationStore.getState().recommendations).toEqual(
        mockRecommendations
      );
      expect(useRecommendationStore.getState().loading).toBe(false);
    });

    it("should handle errors when loading by gestionnaire", async () => {
      const mockError = new Error("Load failed");
      recommendationService.getRecommendationsByGestionnaire.mockRejectedValue(
        mockError
      );

      await expect(
        useRecommendationStore
          .getState()
          .loadRecommendationsByGestionnaire(mockToken, 5)
      ).rejects.toThrow("Load failed");

      expect(useRecommendationStore.getState().error).toBe("Load failed");
    });
  });

  describe("deleteRecommendation", () => {
    it("should delete a recommendation successfully", async () => {
      useRecommendationStore.setState({
        recommendations: [
          { id: 1, priorityCode: "GREEN" },
          { id: 2, priorityCode: "BLUE" },
        ],
      });

      recommendationService.deleteRecommendation.mockResolvedValue();

      await useRecommendationStore.getState().deleteRecommendation(mockToken, 1);

      expect(useRecommendationStore.getState().recommendations).toEqual([
        { id: 2, priorityCode: "BLUE" },
      ]);
      expect(useRecommendationStore.getState().loading).toBe(false);
    });

    it("should handle errors when deleting recommendation", async () => {
      const mockError = new Error("Delete failed");
      recommendationService.deleteRecommendation.mockRejectedValue(mockError);

      await expect(
        useRecommendationStore.getState().deleteRecommendation(mockToken, 1)
      ).rejects.toThrow("Delete failed");

      expect(useRecommendationStore.getState().error).toBe("Delete failed");
    });
  });

  describe("deleteRecommendationByStudentAndOffer", () => {
    it("should delete by student and offer successfully", async () => {
      useRecommendationStore.setState({
        recommendations: [
          { id: 1, studentId: 1, offerId: 2, priorityCode: "GREEN" },
          { id: 2, studentId: 2, offerId: 3, priorityCode: "BLUE" },
        ],
      });

      recommendationService.deleteRecommendationByStudentAndOffer.mockResolvedValue();

      await useRecommendationStore
        .getState()
        .deleteRecommendationByStudentAndOffer(mockToken, 1, 2);

      expect(useRecommendationStore.getState().recommendations).toEqual([
        { id: 2, studentId: 2, offerId: 3, priorityCode: "BLUE" },
      ]);
      expect(useRecommendationStore.getState().loading).toBe(false);
    });

    it("should handle errors when deleting by student and offer", async () => {
      const mockError = new Error("Delete failed");
      recommendationService.deleteRecommendationByStudentAndOffer.mockRejectedValue(
        mockError
      );

      await expect(
        useRecommendationStore
          .getState()
          .deleteRecommendationByStudentAndOffer(mockToken, 1, 2)
      ).rejects.toThrow("Delete failed");

      expect(useRecommendationStore.getState().error).toBe("Delete failed");
    });
  });

  describe("clearError", () => {
    it("should clear the error", () => {
      useRecommendationStore.setState({ error: "Some error" });

      useRecommendationStore.getState().clearError();

      expect(useRecommendationStore.getState().error).toBe(null);
    });
  });
});
