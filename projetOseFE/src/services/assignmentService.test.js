import { describe, it, expect, vi, beforeEach } from "vitest";
import { assignmentService } from "./assignmentService.js";
import { api } from "../lib/api.js";

vi.mock("../lib/api.js");

describe("assignmentService", () => {
  const mockToken = "test-token";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllStudents", () => {
    it("should fetch all students", async () => {
      const mockStudents = [
        { id: 1, firstName: "John", lastName: "Doe", email: "john@test.com" },
        { id: 2, firstName: "Jane", lastName: "Smith", email: "jane@test.com" },
      ];

      api.get.mockResolvedValue({ data: mockStudents });

      const result = await assignmentService.getAllStudents(mockToken);

      expect(api.get).toHaveBeenCalledWith("/gs/students", {
        headers: { Authorization: `Bearer ${mockToken}` },
      });
      expect(result).toEqual(mockStudents);
    });

    it("should handle errors when fetching students", async () => {
      const mockError = new Error("Network error");
      api.get.mockRejectedValue(mockError);

      await expect(
        assignmentService.getAllStudents(mockToken),
      ).rejects.toThrow("Network error");
    });
  });

  describe("getAllProfessors", () => {
    it("should fetch all professors", async () => {
      const mockProfessors = [
        {
          id: 1,
          firstName: "Prof",
          lastName: "A",
          available: true,
          assignedStudentsCount: 3,
        },
        {
          id: 2,
          firstName: "Prof",
          lastName: "B",
          available: false,
          assignedStudentsCount: 5,
        },
      ];

      api.get.mockResolvedValue({ data: mockProfessors });

      const result = await assignmentService.getAllProfessors(mockToken);

      expect(api.get).toHaveBeenCalledWith("/gs/teachers", {
        headers: { Authorization: `Bearer ${mockToken}` },
      });
      expect(result).toEqual(mockProfessors);
    });
  });

  describe("assignStudentToProfessor", () => {
    it("should assign a student to a professor", async () => {
      const mockAssignment = {
        id: 1,
        studentId: 1,
        professorId: 2,
        createdAt: "2024-01-01",
      };

      api.post.mockResolvedValue({ data: mockAssignment });

      const result = await assignmentService.assignStudentToProfessor(
        1,
        2,
        mockToken,
      );

      expect(api.post).toHaveBeenCalledWith(
        "/gs/assignments",
        { studentId: 1, teacherId: 2 },
        {
          headers: { Authorization: `Bearer ${mockToken}` },
        },
      );
      expect(result).toEqual(mockAssignment);
    });

    it("should handle errors when assigning student", async () => {
      const mockError = new Error("Assignment failed");
      api.post.mockRejectedValue(mockError);

      await expect(
        assignmentService.assignStudentToProfessor(1, 2, mockToken),
      ).rejects.toThrow("Assignment failed");
    });
  });

  describe("reassignStudentToProfessor", () => {
    it("should reassign a student to a different professor", async () => {
      const mockReassignment = {
        id: 1,
        studentId: 1,
        professorId: 3,
        updatedAt: "2024-01-02",
      };

      api.put.mockResolvedValue({ data: mockReassignment });

      const result = await assignmentService.reassignStudentToProfessor(
        1,
        3,
        mockToken,
      );

      expect(api.put).toHaveBeenCalledWith(
        "/gs/assignments/1",
        { teacherId: 3 },
        {
          headers: { Authorization: `Bearer ${mockToken}` },
        },
      );
      expect(result).toEqual(mockReassignment);
    });
  });

  describe("getAssignmentHistory", () => {
    it("should fetch assignment history for a student", async () => {
      const mockHistory = [
        {
          id: 1,
          studentId: 1,
          professorId: 2,
          createdAt: "2024-01-01",
        },
        {
          id: 2,
          studentId: 1,
          professorId: 3,
          createdAt: "2024-01-02",
        },
      ];

      api.get.mockResolvedValue({ data: mockHistory });

      const result = await assignmentService.getAssignmentHistory(1, mockToken);

      expect(api.get).toHaveBeenCalledWith("/gs/assignments/history/1", {
        headers: { Authorization: `Bearer ${mockToken}` },
      });
      expect(result).toEqual(mockHistory);
    });
  });

  describe("retryNotification", () => {
    it("should retry notification for an assignment", async () => {
      const mockResponse = { success: true };

      api.post.mockResolvedValue({ data: mockResponse });

      const result = await assignmentService.retryNotification(1, mockToken);

      expect(api.post).toHaveBeenCalledWith(
        "/gs/assignments/1/retry-notification",
        {},
        {
          headers: { Authorization: `Bearer ${mockToken}` },
        },
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle errors when retrying notification", async () => {
      const mockError = new Error("Notification retry failed");
      api.post.mockRejectedValue(mockError);

      await expect(
        assignmentService.retryNotification(1, mockToken),
      ).rejects.toThrow("Notification retry failed");
    });
  });
});
