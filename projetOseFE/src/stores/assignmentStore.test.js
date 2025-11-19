import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAssignmentStore } from "./assignmentStore.js";
import { assignmentService } from "../services/assignmentService.js";

vi.mock("../services/assignmentService.js");

describe("assignmentStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAssignmentStore.setState({
      students: [],
      professors: [],
      selectedStudent: null,
      assignmentHistory: [],
      loading: false,
      error: null,
    });
  });

  describe("loadStudents", () => {
    it("should load students successfully", async () => {
      const mockStudents = [
        {
          id: 1,
          firstName: "John",
          lastName: "Doe",
          professorId: null,
        },
        {
          id: 2,
          firstName: "Jane",
          lastName: "Smith",
          professorId: 1,
        },
      ];

      assignmentService.getAllStudents.mockResolvedValue(mockStudents);

      await useAssignmentStore.getState().loadStudents();

      expect(useAssignmentStore.getState().students).toEqual(mockStudents);
      expect(useAssignmentStore.getState().loading).toBe(false);
      expect(useAssignmentStore.getState().error).toBe(null);
    });

    it("should handle errors when loading students", async () => {
      const mockError = new Error("Failed to load students");
      assignmentService.getAllStudents.mockRejectedValue(mockError);

      await useAssignmentStore.getState().loadStudents();

      expect(useAssignmentStore.getState().error).toBe("Failed to load students");
      expect(useAssignmentStore.getState().loading).toBe(false);
    });
  });

  describe("loadProfessors", () => {
    it("should load professors successfully", async () => {
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

      assignmentService.getAllProfessors.mockResolvedValue(mockProfessors);

      await useAssignmentStore.getState().loadProfessors();

      expect(useAssignmentStore.getState().professors).toEqual(mockProfessors);
      expect(useAssignmentStore.getState().loading).toBe(false);
      expect(useAssignmentStore.getState().error).toBe(null);
    });

    it("should handle errors when loading professors", async () => {
      const mockError = new Error("Failed to load professors");
      assignmentService.getAllProfessors.mockRejectedValue(mockError);

      await useAssignmentStore.getState().loadProfessors();

      expect(useAssignmentStore.getState().error).toBe(
        "Failed to load professors",
      );
      expect(useAssignmentStore.getState().loading).toBe(false);
    });
  });

  describe("assignStudent", () => {
    it("should assign a student to a professor successfully", async () => {
      const mockAssignment = {
        id: 1,
        studentId: 1,
        professorId: 2,
        createdAt: "2024-01-01",
      };

      useAssignmentStore.setState({
        students: [
          {
            id: 1,
            firstName: "John",
            lastName: "Doe",
            professorId: null,
          },
        ],
      });

      assignmentService.assignStudentToProfessor.mockResolvedValue(
        mockAssignment,
      );

      const result = await useAssignmentStore.getState().assignStudent(1, 2);

      expect(result).toEqual(mockAssignment);
      expect(useAssignmentStore.getState().students[0].professorId).toBe(2);
      expect(useAssignmentStore.getState().students[0].assignmentId).toBe(1);
      expect(useAssignmentStore.getState().loading).toBe(false);
    });

    it("should handle errors when assigning student", async () => {
      const mockError = new Error("Assignment failed");
      assignmentService.assignStudentToProfessor.mockRejectedValue(mockError);

      await expect(
        useAssignmentStore.getState().assignStudent(1, 2),
      ).rejects.toThrow("Assignment failed");

      expect(useAssignmentStore.getState().error).toBe("Assignment failed");
      expect(useAssignmentStore.getState().loading).toBe(false);
    });
  });

  describe("reassignStudent", () => {
    it("should reassign a student to a different professor successfully", async () => {
      const mockReassignment = {
        id: 1,
        studentId: 1,
        professorId: 3,
        updatedAt: "2024-01-02",
      };

      useAssignmentStore.setState({
        students: [
          {
            id: 1,
            firstName: "John",
            lastName: "Doe",
            professorId: 2,
            assignmentId: 1,
          },
        ],
      });

      assignmentService.reassignStudentToProfessor.mockResolvedValue(
        mockReassignment,
      );

      const result = await useAssignmentStore.getState().reassignStudent(1, 3);

      expect(result).toEqual(mockReassignment);
      expect(useAssignmentStore.getState().students[0].professorId).toBe(3);
      expect(useAssignmentStore.getState().loading).toBe(false);
    });

    it("should handle errors when reassigning student", async () => {
      const mockError = new Error("Reassignment failed");
      assignmentService.reassignStudentToProfessor.mockRejectedValue(mockError);

      await expect(
        useAssignmentStore.getState().reassignStudent(1, 3),
      ).rejects.toThrow("Reassignment failed");

      expect(useAssignmentStore.getState().error).toBe("Reassignment failed");
      expect(useAssignmentStore.getState().loading).toBe(false);
    });
  });

  describe("loadAssignmentHistory", () => {
    it("should load assignment history for a student", async () => {
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

      assignmentService.getAssignmentHistory.mockResolvedValue(mockHistory);

      await useAssignmentStore.getState().loadAssignmentHistory(1);

      expect(useAssignmentStore.getState().assignmentHistory).toEqual(
        mockHistory,
      );
      expect(useAssignmentStore.getState().loading).toBe(false);
    });

    it("should handle errors when loading assignment history", async () => {
      const mockError = new Error("Failed to load history");
      assignmentService.getAssignmentHistory.mockRejectedValue(mockError);

      await useAssignmentStore.getState().loadAssignmentHistory(1);

      expect(useAssignmentStore.getState().error).toBe("Failed to load history");
      expect(useAssignmentStore.getState().loading).toBe(false);
    });
  });

  describe("retryNotification", () => {
    it("should retry notification successfully", async () => {
      assignmentService.retryNotification.mockResolvedValue({
        success: true,
      });

      await useAssignmentStore.getState().retryNotification(1);

      expect(useAssignmentStore.getState().loading).toBe(false);
      expect(useAssignmentStore.getState().error).toBe(null);
    });

    it("should handle errors when retrying notification", async () => {
      const mockError = new Error("Notification retry failed");
      assignmentService.retryNotification.mockRejectedValue(mockError);

      await expect(
        useAssignmentStore.getState().retryNotification(1),
      ).rejects.toThrow("Notification retry failed");

      expect(useAssignmentStore.getState().error).toBe(
        "Notification retry failed",
      );
      expect(useAssignmentStore.getState().loading).toBe(false);
    });
  });

  describe("setSelectedStudent", () => {
    it("should set the selected student", () => {
      const mockStudent = {
        id: 1,
        firstName: "John",
        lastName: "Doe",
      };

      useAssignmentStore.getState().setSelectedStudent(mockStudent);

      expect(useAssignmentStore.getState().selectedStudent).toEqual(
        mockStudent,
      );
    });
  });

  describe("clearError", () => {
    it("should clear the error", () => {
      useAssignmentStore.setState({ error: "Some error" });

      useAssignmentStore.getState().clearError();

      expect(useAssignmentStore.getState().error).toBe(null);
    });
  });
});
