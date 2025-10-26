import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useEmployerStore } from "../../stores/employerStore.js";
import { useCvStore } from "../../stores/cvStore.js";
import useAuthStore from "../../stores/authStore.js";
import { toast } from "sonner";

export const InternshipApplications = () => {
    const { t } = useTranslation();
    const { applications, fetchApplications } = useEmployerStore();
    const {
        previewUrl,
        previewType,
        previewCvForEmployer,
        downloadCvForEmployer,
        closePreview,
    } = useCvStore();

    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterSession, setFilterSession] = useState("All");
    const [filterYear, setFilterYear] = useState("All");

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const handleViewApplication = (application) => {
        setSelectedApplication(application);
        setIsModalOpen(true);
    };

    const handlePreviewCv = (application) => {
        try {
            previewCvForEmployer(application.selectedCvFileData, application.selectedCvFileName);
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDownloadCv = (application) => {
        try {
            downloadCvForEmployer(application.selectedCvFileData, application.selectedCvFileName);
        } catch (err) {
            toast.error(t("internshipApplications.errors.downloadCv"));
        }
    };

    // 🔹 Filtrage par session et année
    const filteredApplications = useMemo(() => {
        let filtered = applications;

        if (filterSession !== "All") {
            filtered = filtered.filter((a) => a.session === filterSession);
        }

        if (filterYear !== "All") {
            filtered = filtered.filter((a) => {
                // On suppose que "createdAt" ou "startDate" indique l'année
                const date = a.startDate ? new Date(a.startDate) : new Date(a.createdAt);
                return date.getFullYear().toString() === filterYear;
            });
        }

        return filtered;
    }, [applications, filterSession, filterYear]);

    // 🔹 Extraire dynamiquement les années disponibles
    const availableYears = useMemo(() => {
        const years = new Set();
        applications.forEach((a) => {
            const date = a.startDate ? new Date(a.startDate) : new Date(a.createdAt);
            if (!isNaN(date)) years.add(date.getFullYear().toString());
        });
        return Array.from(years).sort();
    }, [applications]);

    return (
        <div className="p-10 space-y-6">
            {/* 🔹 Filtres en haut à droite */}
            <div className="flex justify-end mb-4 gap-6">
                {/* Filtre Session */}
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">{t("offer.filter.session")}:</label>
                    <select
                        className="rounded border border-zinc-300 p-1"
                        value={filterSession}
                        onChange={(e) => setFilterSession(e.target.value)}
                    >
                        <option value="All">{t("offer.session.all")}</option>
                        <option value="Automne">{t("offer.session.autumn")}</option>
                        <option value="Hiver">{t("offer.session.winter")}</option>
                    </select>
                </div>

                {/* Filtre Année */}
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Filter by year:</label>
                    <select
                        className="rounded border border-zinc-300 p-1"
                        value={filterYear}
                        onChange={(e) => setFilterYear(e.target.value)}
                    >
                        <option value="Year">{t("offer.session.year")}</option>
                        {availableYears.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table des candidatures */}
            <div className="overflow-x-auto bg-white shadow rounded">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-[#F9FBFC] text-gray-600 uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3">{t("internshipApplications.table.offerTitle")}</th>
                        <th className="px-4 py-3">{t("internshipApplications.table.studentName")}</th>
                        <th className="px-4 py-3">{t("internshipApplications.table.studentEmail")}</th>
                        <th className="px-4 py-3">{t("internshipApplications.table.cv")}</th>
                        <th className="px-4 py-3">{t("internshipApplications.table.status")}</th>
                        <th className="px-4 py-3">{t("internshipApplications.table.action")}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredApplications.map((app) => (
                        <tr key={app.id} className="border-t border-zinc-300 text-zinc-700 text-base">
                            <td className="px-4 py-2">{app.internshipOfferTitle}</td>
                            <td className="px-4 py-2">{app.studentFirstName} {app.studentLastName}</td>
                            <td className="px-4 py-2">{app.studentEmail}</td>
                            <td className="px-4 py-2">
                                {app.selectedCvFileName ? (
                                    <>
                                        <button
                                            className="text-blue-600 underline hover:text-blue-800 mr-2"
                                            onClick={() => handlePreviewCv(app)}
                                        >
                                            {app.selectedCvFileName}
                                        </button>
                                        <button
                                            className="text-green-600 underline hover:text-green-800"
                                            onClick={() => handleDownloadCv(app)}
                                        >
                                            {t("internshipApplications.table.download")}
                                        </button>
                                    </>
                                ) : (
                                    t("internshipApplications.table.noCv")
                                )}
                            </td>
                            <td className="px-4 py-2">{app.status}</td>
                            <td className="px-4 py-2">
                                <button
                                    className="px-14 py-0.5 bg-[#B3FE3B] rounded-full font-bold text-lg hover:bg-green-400 transition-all duration-200"
                                    onClick={() => handleViewApplication(app)}
                                >
                                    {t("internshipApplications.table.actionView")}
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Preview CV */}
            {previewUrl && (
                <div className="mt-6 p-4 border-t border-gray-300 bg-gray-50 rounded">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-semibold">{t("internshipApplications.previewCv")}</h3>
                        <button
                            className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
                            onClick={closePreview}
                        >
                            {t("internshipApplications.closeCvPreview")}
                        </button>
                    </div>
                    {previewType === "pdf" ? (
                        <iframe
                            src={previewUrl}
                            className="w-full h-[600px] border"
                            title="Preview CV"
                        />
                    ) : (
                        <a
                            href={previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                        >
                            Ouvrir le CV
                        </a>
                    )}
                </div>
            )}

            {/* Modal détails candidature */}
            {isModalOpen && selectedApplication && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-3/4 max-w-lg">
                        <h2 className="text-xl font-semibold mb-4">
                            {selectedApplication.studentFirstName} {selectedApplication.studentLastName}
                        </h2>
                        <p><strong>Email:</strong> {selectedApplication.studentEmail}</p>
                        <p><strong>CV:</strong> {selectedApplication.selectedCvFileName || "Aucun CV"}</p>
                        <p><strong>Offre:</strong> {selectedApplication.internshipOfferTitle}</p>
                        <p><strong>Statut:</strong> {selectedApplication.status}</p>
                        <p><strong>Postulé le:</strong> {new Date(selectedApplication.createdAt).toLocaleDateString()}</p>

                        <div className="mt-6 flex justify-end">
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedApplication(null);
                                }}
                            >
                                {t("internshipApplications.modal.close")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
