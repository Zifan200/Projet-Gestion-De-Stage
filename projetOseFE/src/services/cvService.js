import {api} from "../lib/api.js";


export const cvService = {
    async upload(file) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await api.post("/etudiants/cv/me/cv", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data;
    },

    async list() {
        const res = await api.get("/etudiants/cv/me");
        return res.data;
    },

    async download(cvId) {
        const res = await api.get(`/etudiants/cv/${cvId}/download`, {
            responseType: "blob",
        });
        return res.data;
    },

    async remove(cvId) {
        const res = await api.delete(`/etudiants/cv/${cvId}`);
        return res.status === 204;
    },

    async preview(cvId) {
        const res = await api.get(`/etudiants/cv/${cvId}/download`, {
            responseType: "blob",
        });
        return window.URL.createObjectURL(res.data);
    }
};