import { describe, it, expect, vi, beforeEach } from "vitest";
import * as recommendationService from "./recommendationService.js";
import { api } from "../lib/api.js";

vi.mock("../lib/api.js");

describe("recommendationService", () => {
  const mockToken = "test-token";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createOrUpdateRecommendation", () => {
    it("should create or update a recommendation", async () => {
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

      api.post.mockResolvedValue({ data: mockResponse });

      const result = await recommendationService.createOrUpdateRecommendation(
        mockToken,
        mockRecommendation
      );

      expect(api.post).toHaveBeenCalledWith("/recommendations", mockRecommendation, {
        headers: { Authorization: `Bearer ${mockToken}` },
      });
      expect(result).toEqual(mockResponse);
    });

    it("should handle errors when creating recommendation", async () => {
      const mockError = new Error("Create failed");
      api.post.mockRejectedValue(mockError);

      await expect(
        recommendationService.createOrUpdateRecommendation(mockToken, {})
      ).rejects.toThrow("Create failed");
    });
  });

  describe("getRecommendationsForStudent", () => {
    it("should fetch recommendations for a student", async () => {
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

      api.get.mockResolvedValue({ data: mockRecommendations });

      const result = await recommendationService.getRecommendationsForStudent(
        mockToken,
        1
      );

      expect(api.get).toHaveBeenCalledWith("/recommendations/student/1", {
        headers: { Authorization: `Bearer ${mockToken}` },
      });
      expect(result).toEqual(mockRecommendations);
    });

    it("should handle errors when fetching student recommendations", async () => {
      const mockError = new Error("Fetch failed");
      api.get.mockRejectedValue(mockError);

      await expect(
        recommendationService.getRecommendationsForStudent(mockToken, 1)
      ).rejects.toThrow("Fetch failed");
    });
  });

  describe("getRecommendationsForOffer", () => {
    it("should fetch recommendations for an offer", async () => {
      const mockRecommendations = [
        {
          id: 1,
          studentId: 1,
          offerId: 2,
          priorityCode: "GOLD",
        },
      ];

      api.get.mockResolvedValue({ data: mockRecommendations });

      const result = await recommendationService.getRecommendationsForOffer(
        mockToken,
        2
      );

      expect(api.get).toHaveBeenCalledWith("/recommendations/offer/2", {
        headers: { Authorization: `Bearer ${mockToken}` },
      });
      expect(result).toEqual(mockRecommendations);
    });
  });

  describe("getRecommendationsByGestionnaire", () => {
    it("should fetch recommendations by gestionnaire", async () => {
      const mockRecommendations = [
        {
          id: 1,
          gestionnaireId: 5,
          priorityCode: "GREEN",
        },
      ];

      api.get.mockResolvedValue({ data: mockRecommendations });

      const result = await recommendationService.getRecommendationsByGestionnaire(
        mockToken,
        5
      );

      expect(api.get).toHaveBeenCalledWith("/recommendations/gestionnaire/5", {
        headers: { Authorization: `Bearer ${mockToken}` },
      });
      expect(result).toEqual(mockRecommendations);
    });
  });

  describe("getAllRecommendations", () => {
    it("should fetch all recommendations", async () => {
      const mockRecommendations = [
        { id: 1, priorityCode: "GREEN" },
        { id: 2, priorityCode: "BLUE" },
      ];

      api.get.mockResolvedValue({ data: mockRecommendations });

      const result = await recommendationService.getAllRecommendations(mockToken);

      expect(api.get).toHaveBeenCalledWith("/recommendations", {
        headers: { Authorization: `Bearer ${mockToken}` },
      });
      expect(result).toEqual(mockRecommendations);
    });
  });

  describe("getRecommendationById", () => {
    it("should fetch a recommendation by id", async () => {
      const mockRecommendation = {
        id: 1,
        studentId: 1,
        offerId: 2,
        priorityCode: "GOLD",
      };

      api.get.mockResolvedValue({ data: mockRecommendation });

      const result = await recommendationService.getRecommendationById(mockToken, 1);

      expect(api.get).toHaveBeenCalledWith("/recommendations/1", {
        headers: { Authorization: `Bearer ${mockToken}` },
      });
      expect(result).toEqual(mockRecommendation);
    });
  });

  describe("deleteRecommendation", () => {
    it("should delete a recommendation", async () => {
      api.delete.mockResolvedValue({});

      await recommendationService.deleteRecommendation(mockToken, 1);

      expect(api.delete).toHaveBeenCalledWith("/recommendations/1", {
        headers: { Authorization: `Bearer ${mockToken}` },
      });
    });

    it("should handle errors when deleting recommendation", async () => {
      const mockError = new Error("Delete failed");
      api.delete.mockRejectedValue(mockError);

      await expect(
        recommendationService.deleteRecommendation(mockToken, 1)
      ).rejects.toThrow("Delete failed");
    });
  });

  describe("deleteRecommendationByStudentAndOffer", () => {
    it("should delete a recommendation by student and offer", async () => {
      api.delete.mockResolvedValue({});

      await recommendationService.deleteRecommendationByStudentAndOffer(
        mockToken,
        1,
        2
      );

      expect(api.delete).toHaveBeenCalledWith(
        "/recommendations/student/1/offer/2",
        {
          headers: { Authorization: `Bearer ${mockToken}` },
        }
      );
    });

    it("should handle errors when deleting by student and offer", async () => {
      const mockError = new Error("Delete failed");
      api.delete.mockRejectedValue(mockError);

      await expect(
        recommendationService.deleteRecommendationByStudentAndOffer(mockToken, 1, 2)
      ).rejects.toThrow("Delete failed");
    });
  });
});
