import { api } from "../lib/api.js";

export const cvService = {
  async upload(file) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/student/cv/me/cv", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async list() {
    const res = await api.get("/student/cv/me");
    return res.data;
  },

  async download(cvId) {
    const res = await api.get(`/student/cv/${cvId}/download`, {
      responseType: "blob",
    });
    return res.data;
  },

  async remove(cvId) {
    const res = await api.delete(`/student/cv/${cvId}`);
    return res.status === 204;
  },

  async preview(cvId) {
    const res = await api.get(`/student/cv/${cvId}/download`, {
      responseType: "blob",
    });
    return window.URL.createObjectURL(res.data);
  },

  async downloadCv(cvId) {
    const res = await api.get(`/student/cv/${cvId}/download`, {
      responseType: "blob",
    });
    return res.data; // blob binaire
  },

  async applyCVService(token, offerId, cvId, studentEmail) {
    const payload = {
      studentEmail,
      selectedCvID: Number(cvId),
      internshipOfferId: Number(offerId),
    };

    const res = await api.post("/student/apply-to-internship-offer", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return res.data;
  },

  // // --- Fonctions pour employer ---
  // async previewForEmployer(cvId, studentEmail, token) {
  //   const payload = {
  //     email: studentEmail,
  //     password: "" // inutile ici, mais requis par LoginDTO
  //   };
  //
  //   const res = await api.post(
  //       `/employer/${cvId}/download`,
  //       payload,
  //       {
  //         responseType: "blob",
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //   );
  //
  //   return window.URL.createObjectURL(res.data);
  // },
  //
  // async downloadCvForEmployer(cvId, fileName, studentEmail, token) {
  //   const payload = {
  //     email: studentEmail,
  //     password: "" // idem, requis pour correspondre à LoginDTO
  //   };
  //
  //   const res = await api.post(
  //       `/employer/${cvId}/download`,
  //       payload,
  //       {
  //         responseType: "blob",
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //   );
  //
  //   const blob = new Blob([res.data]);
  //   const link = document.createElement("a");
  //   link.href = window.URL.createObjectURL(blob);
  //   link.download = fileName || `cv_${cvId}.pdf`;
  //   link.click();
  // }
};
