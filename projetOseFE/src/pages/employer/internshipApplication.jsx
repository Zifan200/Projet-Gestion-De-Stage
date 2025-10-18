import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEmployerStore } from "../../stores/employerStore.js";

export const InternshipApplications = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const { applications, fetchApplications, loading, error } = useEmployerStore();
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleViewApplication = (application) => {
        setSelectedApplication(application);
        setIsModalOpen(true);
    };

    if (loading) return <div>{t("internshipApplications.loading") || "Chargement..."}</div>;
    if (error) return <div>{t("internshipApplications.error") || "Erreur"}: {error}</div>;

    return (
        <div className="p-10">
            {/* Table des candidatures */}
            {/* Table des candidatures */}
            <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-[#F9FBFC] text-gray-600 uppercase text-xs">
                <tr>
                    <th className="px-4 py-3">{t("internshipApplications.table.offerTitle") || "Offre"}</th>
                    <th className="px-4 py-3">{t("internshipApplications.table.studentName") || "Nom"}</th>
                    <th className="px-4 py-3">{t("internshipApplications.table.studentEmail") || "Email"}</th>
                    <th className="px-4 py-3">{t("internshipApplications.table.cv") || "CV"}</th>
                    <th className="px-4 py-3">{t("internshipApplications.table.status") || "Statut"}</th>
                    <th className="px-4 py-3">{t("internshipApplications.table.action") || "Action"}</th>
                </tr>
                </thead>

                <tbody>
                {applications.map((app) => (
                    <tr key={app.id} className="border-t border-zinc-300 text-zinc-700 text-lg">
                        <td className="px-4 py-2">{app.internshipOfferTitle}</td>
                        <td className="px-4 py-2">{app.studentFirstName} {app.studentLastName}</td>
                        <td className="px-4 py-2">{app.studentEmail}</td>
                        <td className="px-4 py-2">{app.selectedCvFileName}</td>
                        <td className="px-4 py-2">{app.status}</td>
                        <td className="px-4 py-2">
                            <button
                                className="px-6 py-3 bg-green-300 text-black rounded-lg hover:bg-green-300 text-lg font-semibold"
                                onClick={() => handleViewApplication(app)}
                            >
                                {t("internshipApplications.table.actionView") || "Voir"}
                            </button>
                        </td>
                    </tr>

                ))}
                </tbody>
            </table>


            {/* Modal pour détails */}
            {isModalOpen && selectedApplication && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-3/4 max-w-lg">
                        <h2 className="text-xl font-semibold mb-4">
                            {selectedApplication.studentFirstName} {selectedApplication.studentLastName}
                        </h2>
                        <p>
                            <strong>{t("internshipApplications.modal.email") || "Email"}:</strong> {selectedApplication.studentEmail}
                        </p>
                        <p>
                            <strong>{t("internshipApplications.modal.offerTitle") || "Offre"}:</strong> {selectedApplication.internshipOfferTitle}
                        </p>
                        <p>
                            <strong>{t("internshipApplications.modal.cv") || "CV"}:</strong> {selectedApplication.selectedCvFileName}
                        </p>
                        <p>
                            <strong>{t("internshipApplications.modal.status") || "Statut"}:</strong> {selectedApplication.status}
                        </p>
                        <p>
                            <strong>{t("internshipApplications.modal.appliedAt") || "Postulé le"}:</strong> {new Date(selectedApplication.createdAt).toLocaleDateString()}
                        </p>

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
