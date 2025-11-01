import { useEffect, useState } from "react";
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

    useEffect(() => {
        fetchApplications();
    }, []);

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

    return (
        <div className="p-10">
            {/* Table des candidatures */}
            <div className="overflow-x-auto bg-white shadow rounded">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-[#F9FBFC] text-gray-600 uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3">{t("internshipApplications.table.offerTitle") || "Offre"}</th>
                        <th className="px-4 py-3">{t("internshipApplications.table.studentName") || "Nom et Prénom"}</th>
                        <th className="px-4 py-3">{t("internshipApplications.table.studentEmail") || "Email"}</th>
                        <th className="px-4 py-3">{t("internshipApplications.table.cv") || "CV"}</th>
                        <th className="px-4 py-3">{t("internshipApplications.table.statusTitle") || "Statut"}</th>
                        <th className="px-4 py-3">{t("internshipApplications.table.action") || "Action"}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {applications.map((app) => (
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
                            <td className="px-4 py-2">
                                {t(`internshipApplications.table.status.${app.status.toLowerCase()}`)}
                            </td>
                            <td className="px-4 py-2">
                                <button
                                    className="px-14 py-0.5 bg-[#B3FE3B] rounded-full font-bold text-lg hover:bg-green-400 transition-all duration-200"
                                    onClick={() => handleViewApplication(app)}
                                >
                                    {t("internshipApplications.table.actionView") || "Voir"}
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
                        <p>
                            <strong>{t("internshipApplications.modal.email") || "Email"}: </strong>
                            {selectedApplication.studentEmail}
                        </p>
                        <p>
                            <strong>{t("internshipApplications.modal.cv") || "CV"}: </strong>
                            {selectedApplication.selectedCvFileName || "Aucun CV"}
                        </p>
                        <p>
                            <strong>{t("internshipApplications.modal.offerTitle") || "Offre"}: </strong>
                            {selectedApplication.internshipOfferTitle}
                        </p>
                        <p>
                            <strong>{t("internshipApplications.modal.appliedAt") || "Postulé le"}: </strong>
                            {new Date(selectedApplication.createdAt).toLocaleDateString()}
                        </p>
                        <p>
                            <strong>{t("internshipApplications.modal.statusTitle") || "Statut"}: </strong>
                            {t(`internshipApplications.modal.status.${selectedApplication.status.toLowerCase()}`)}
                        </p>
                        {selectedApplication.status === "REJECTED" &&
                            <p>
                                <strong>{t("internshipApplications.modal.reason") || "Raison"}: </strong>
                                {selectedApplication.reason}
                            </p>
                        }

                        <div className="mt-6 flex justify-end">
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedApplication(null);
                                }}
                            >
                                {t("internshipApplications.modal.close") || "Fermer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};