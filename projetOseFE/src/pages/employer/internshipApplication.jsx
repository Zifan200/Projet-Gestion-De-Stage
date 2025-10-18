import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useEmployerStore } from "../../stores/employerStore.js";
import { useCvStore } from "../../stores/cvStore.js";
import useAuthStore from "../../stores/authStore.js";

export const InternshipApplications = () => {
    const { t } = useTranslation();
    const { applications, fetchApplications, loading, error } = useEmployerStore();
    const {
        previewUrl,
        previewType,
        previewCvForEmployer,
        downloadCvForEmployer,
        closePreview
    } = useCvStore();
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { token } = useAuthStore.getState();

    useEffect(() => {
        fetchApplications();
    }, []);

    // Ouvrir le modal pour voir les détails
    const handleViewApplication = (application) => {
        setSelectedApplication(application);
        setIsModalOpen(true);
    };

    // Prévisualiser le CV (employeur)
    // Prévisualiser le CV (employeur)
    const handlePreviewCv = async (application) => {
        console.log("=== DEBUG Preview ===");
        console.log("CV ID :", application.selectedCvID);
        console.log("Email étudiant :", application.studentEmail);
        console.log("Objet application :", application);
        console.log("=====================");

        if (!application.selectedCvID || !application.studentEmail) {
            console.error("❌ CV ID ou email étudiant manquant !");
            return;
        }

        try {
            await previewCvForEmployer(application.selectedCvID, application.studentEmail);
        } catch (err) {
            console.error("❌ Erreur lors de la prévisualisation du CV:", err);
        }
    };


    // Télécharger le CV (employeur)
    const handleDownloadCv = async (application) => {
        if (!application.selectedCvID || !application.studentEmail) {
            console.error("CV ID or student email is missing!");
            return;
        }
        try {
            await downloadCvForEmployer(
                application.selectedCvID,
                application.selectedCvFileName,
                application.studentEmail
            );
        } catch (err) {
            console.error("Erreur lors du téléchargement du CV:", err);
        }
    };

    if (loading) return <div>{t("internshipApplications.loading") || "Chargement..."}</div>;
    if (error) return <div>{t("internshipApplications.error") || "Erreur"}: {error}</div>;

    return (
        <div className="p-10">
            {/* Table des candidatures */}
            <div className="overflow-x-auto bg-white shadow rounded">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-[#F9FBFC] text-gray-600 uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3">{t("internshipApplications.table.offerTitle") || "Offre"}</th>
                        <th className="px-4 py-3">{t("internshipApplications.table.studentName") || "Étudiant"}</th>
                        <th className="px-4 py-3">{t("internshipApplications.table.cv") || "CV"}</th>
                        <th className="px-4 py-3">{t("internshipApplications.table.status") || "Statut"}</th>
                        <th className="px-4 py-3">{t("internshipApplications.table.action") || "Action"}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {applications.map((app) => (
                        <tr key={app.id} className="border-t border-zinc-300 text-zinc-700 text-xl">
                            <td className="px-4 py-2">{app.internshipOfferTitle}</td>
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
                                            Télécharger
                                        </button>
                                    </>
                                ) : (
                                    "Aucun CV"
                                )}
                            </td>
                            <td className="px-4 py-2">{app.status}</td>
                            <td className="px-4 py-2">
                                <button
                                    className="px-6 py-3 bg-green-300 text-black rounded-xl text-lg font-semibold hover:bg-green-400 transition-all duration-200"
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
                        <h3 className="text-xl font-semibold">Prévisualisation du CV</h3>
                        <button
                            className="px-2 py-1 text-white bg-red-500 rounded hover:bg-red-600"
                            onClick={closePreview}
                        >
                            Fermer
                        </button>
                    </div>
                    {previewType === "pdf" ? (
                        <iframe src={previewUrl} className="w-full h-96 border" title="Preview CV" />
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
                        <h2 className="text-3xl font-semibold mb-4">{selectedApplication.studentEmail}</h2>
                        <p>
                            <strong>{t("internshipApplications.modal.offerTitle") || "Offre"}:</strong>{" "}
                            {selectedApplication.internshipOfferTitle}
                        </p>
                        <p>
                            <strong>{t("internshipApplications.modal.cv") || "CV"}:</strong>{" "}
                            {selectedApplication.selectedCvFileName || "Aucun CV"}
                        </p>
                        <p>
                            <strong>{t("internshipApplications.modal.status") || "Statut"}:</strong>{" "}
                            {selectedApplication.status}
                        </p>
                        <p>
                            <strong>{t("internshipApplications.modal.appliedAt") || "Postulé le"}:</strong>{" "}
                            {new Date(selectedApplication.createdAt).toLocaleDateString()}
                        </p>
                        <div className="mt-6 flex justify-end">
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-lg"
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
