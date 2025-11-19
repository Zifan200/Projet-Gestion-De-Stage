import { api } from "../lib/api.js";

export const assignmentService = {
  async getAllStudents(token) {
    const res = await api.get("/gs/students", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },

  async getAllProfessors(token) {
    const res = await api.get("/gs/teachers", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },

  async assignStudentToProfessor(studentId, professorId, token) {
    const res = await api.post(
      "/gs/assignments",
      { studentId, teacherId: professorId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return res.data;
  },

  async reassignStudentToProfessor(assignmentId, professorId, token) {
    const res = await api.put(
      `/gs/assignments/${assignmentId}`,
      { teacherId: professorId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return res.data;
  },

  async getAssignmentHistory(studentId, token) {
    const res = await api.get(`/gs/assignments/history/${studentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },

  async retryNotification(assignmentId, token) {
    const res = await api.post(
      `/gs/assignments/${assignmentId}/retry-notification`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return res.data;
  },
};
