import { create } from "zustand";
import { persist } from "zustand/middleware";
import { assignmentService } from "../services/assignmentService.js";

export const useAssignmentStore = create(
  persist(
    (set, get) => ({
      students: [],
      professors: [],
      selectedStudent: null,
      assignmentHistory: [],
      loading: false,
      error: null,

      loadStudents: async () => {
        try {
          set({ loading: true, error: null });
          const data = await assignmentService.getAllStudents();
          set({ students: data, loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
        }
      },

      loadProfessors: async () => {
        try {
          set({ loading: true, error: null });
          const data = await assignmentService.getAllProfessors();
          set({ professors: data, loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
        }
      },

      assignStudent: async (studentId, professorId) => {
        try {
          set({ loading: true, error: null });
          const assignment = await assignmentService.assignStudentToProfessor(
            studentId,
            professorId,
          );
          set((state) => ({
            students: state.students.map((student) =>
              student.id === studentId
                ? { ...student, professorId, assignmentId: assignment.id }
                : student,
            ),
            loading: false,
          }));
          return assignment;
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      reassignStudent: async (assignmentId, professorId) => {
        try {
          set({ loading: true, error: null });
          const updatedAssignment =
            await assignmentService.reassignStudentToProfessor(
              assignmentId,
              professorId,
            );
          const studentId = get().students.find(
            (s) => s.assignmentId === assignmentId,
          )?.id;
          if (studentId) {
            set((state) => ({
              students: state.students.map((student) =>
                student.id === studentId
                  ? { ...student, professorId }
                  : student,
              ),
              loading: false,
            }));
          }
          return updatedAssignment;
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      loadAssignmentHistory: async (studentId) => {
        try {
          set({ loading: true, error: null });
          const history = await assignmentService.getAssignmentHistory(
            studentId,
          );
          set({ assignmentHistory: history, loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
        }
      },

      retryNotification: async (assignmentId) => {
        try {
          set({ loading: true, error: null });
          await assignmentService.retryNotification(assignmentId);
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      setSelectedStudent: (student) => {
        set({ selectedStudent: student });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    { name: "assignment-storage" },
  ),
);

export default useAssignmentStore;
