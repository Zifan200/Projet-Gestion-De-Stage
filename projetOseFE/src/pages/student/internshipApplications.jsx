import { useTranslation } from "react-i18next";
import { useStudentStore } from "../../stores/studentStore.js";
import { useEffect, useState } from "react";
import useAuthStore from "../../stores/authStore.js";
import { useNavigate } from "react-router-dom";
import { Table } from "../../components/ui/table.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Header } from "../../components/ui/header.jsx";
import {useOfferStore} from "../../stores/offerStore.js";
import {toast} from "sonner";

export const StudentApplications = () => {
    const { t } = useTranslation("internship_applications");
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const { applications, loadAllApplications, loadApplicationsByStatus, loading} = useStudentStore();
    const { downloadOfferPdf } = useOfferStore();
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const statuses = {
        ALL: t("filter.all"),
        PENDING: t("status.pending"),
        ACCEPTED: t("status.accepted"),
        REJECTED: t("status.rejected"),
    };
    const [currentStatus, setCurrentStatus] = useState(Object.entries(statuses)[0][0]);
    const ALL_INDEX = 0;
    const REJECTED_INDEX = 3;

    useEffect(() => {
        if (user == null || !isAuthenticated)
            navigate("/");
        else {
            const getData = async () => {
                await loadAllApplications();
            };
            getData();
        }
    }, []);

    useEffect(() => {
        const data = Object.entries(statuses);
        if (currentStatus !== data[ALL_INDEX][0])
            loadApplicationsByStatus(user.token, currentStatus);
        else
            loadAllApplications();
    }, [currentStatus]);

    const handleViewApplication = (application) => {
        setSelectedApplication(application);
        setIsModalOpen(true);
    };

    const handleDownloadApplication = async (offerId) => {
        try {
            await downloadOfferPdf(user.token, offerId);
            toast.success(t("success.download"));
        } catch (err) {
            toast.error(t("offer.error.download"));
            console.error(err);
        }
    };

    const rows = () => {
        return applications.map((app) => (
            <tr key={app.id} className="border-t border-gray-300">
                <td className="px-4 py-2">{app.internshipOfferTitle}</td>
                <td className="px-4 py-2">{new Date(app.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2">
                    {t(`status.${app.status.toLowerCase()}`)}
                </td>
                <td className="px-4 py-2 flex space-x-2">
                    <Button
                        label={t("table.actionView")}
                        onClick={() => handleViewApplication(app)}
                    />
                    <Button
                        label={t("table.download")}
                        className={"bg-amber-200 hover:bg-amber-50"}
                        onClick={() => handleDownloadApplication(app.internshipOfferId)}
                    />
                </td>
            </tr>
        ))
    };

    return (
        <div className="space-y-6">
            { loading ? <p>Chargement...</p> :
                <>
                    <Header title={t("title")}/>

                    {/* Filtre pour les statuts */}
                    <select
                        value={currentStatus}
                        onChange={(e) => setCurrentStatus(e.target.value)}
                    >
                        {Object.entries(statuses).map((status) =>
                            <option key={status[0]} value={status[0]}>
                                {
                                    status[0] === "ALL" ?
                                        t(`filter.${status[0].toLowerCase()}`) :
                                        t(`status.${status[0].toLowerCase()}`)
                                }
                            </option>
                        )}
                    </select>

                    {/* Table des postulations */}
                    <Table
                        headers={
                            [
                                t("table.offerTitle"),
                                t("table.appliedAt"),
                                t("table.status"),
                                ""
                            ]
                        }
                        rows={rows()}
                        emptyMessage={t("table.noApplications")}
                    />
                </>
            }

            {/* Vue détaillée pour les postulations */}
            {isModalOpen && selectedApplication && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-3/4 max-w-lg">
                        <h2 className="text-xl font-semibold mb-4">
                            {selectedApplication.internshipOfferTitle}
                        </h2>
                        <p>
                            <strong>{t("offer.modal.companyEmail")}: </strong>
                            {selectedApplication.employerEmail}
                        </p>
                        <p>
                            <strong>{t("modal.deadline")}: </strong>
                            {new Date(selectedApplication.internshipOfferExpirationDate).toLocaleDateString()}
                        </p>
                        <p>
                            <strong>{t("modal.appliedAt")}: </strong>
                            {new Date(selectedApplication.createdAt).toLocaleDateString()}
                        </p>
                        <p>
                            <strong>{t("offer.modal.description")}: </strong>
                            {selectedApplication.internshipOfferDescription}
                        </p>
                        <p>
                            <strong>{t("modal.statusTitle")}: </strong>
                            {t(`modal.status.${selectedApplication.status.toLowerCase()}`)}
                        </p>
                        {selectedApplication.status === Object.entries(statuses)[REJECTED_INDEX][0] &&
                            <p>
                                <strong>{t("modal.reason")}: </strong>
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
                                {t("modal.close")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
