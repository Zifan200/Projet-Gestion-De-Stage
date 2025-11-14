import React, { useEffect, useMemo, useState } from "react";
import { useStudentStore } from "../../../stores/studentStore.js";
import useAuthStore from "../../../stores/authStore.js";
import { DataTable } from "../../../components/ui/data-table.jsx";
import { Modal } from "../../../components/ui/modal.jsx";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { CheckIcon, Cross2Icon } from "@radix-ui/react-icons";

export default function OffresAConfirmerPhone() {
    const { t } = useTranslation("student_dashboard_decision");
    const { token, user } = useAuthStore();
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("details");
    const [rejectReason, setRejectReason] = useState("");

    const {
        applications,
        loadAllApplications,
        loading,
        error,
        successMessage,
        clearMessages,
        acceptOffer,
        rejectOffer
    } = useStudentStore();

    // Charger toutes les candidatures pour l'étudiant
    useEffect(() => {
        if (token && user?.role === "STUDENT") {
            loadAllApplications(token);
        }
    }, [loadAllApplications, token, user?.role]);

    // Filtrer les candidatures ACCEPTED
    const approvedApplications = useMemo(
        () => applications.filter(app => app.postInterviewStatus === "ACCEPTED"),
        [applications]
    );

    // Filtrer pour l'année prochaine et session hiver
    const filteredApplications = useMemo(() => {
        const nextYear = new Date().getFullYear() + 1;
        return approvedApplications.filter(app => {
            const startYear = app.startDate ? new Date(app.startDate).getFullYear() : null;
            const isNextYear = startYear === nextYear;
            const isWinterSession = app.session?.toLowerCase() === "hiver";
            return isNextYear && isWinterSession;
        });
    }, [approvedApplications]);

    // Gestion des messages
    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            clearMessages();
        }
        if (error) {
            toast.error(typeof error === "string" ? error : error?.message || t("errors.generic"));
            clearMessages();
        }
    }, [successMessage, error, clearMessages, t]);

    // Colonnes simplifiées pour mobile
    const columns = useMemo(
        () => [
            { key: "internshipOfferTitle", label: t("table.OfferTitle") },
            { key: "employerEmail", label: t("table.company") },
            {
                key: "actions",
                label: t("table.action"),
                actions: [{ key: "view", showIcon: true }]
            }
        ],
        [t]
    );

    return (
        <div className="mt-10">
            <h1 className="text-xl font-bold mb-4">{t("table.title")}</h1>

            {loading && (
                <div className="flex justify-center items-center h-32">
                    <span>{t("loading")}</span>
                </div>
            )}

            {!loading && filteredApplications.length === 0 && (
                <p className="text-gray-500 text-center mt-8">{t("noApplications")}</p>
            )}

            {!loading && filteredApplications.length > 0 && (
                <>
                    <div className="overflow-x-hidden">
                        <DataTable
                            columns={columns}
                            data={filteredApplications}
                            onAction={(actionKey, row) => {
                                if (actionKey === "view") {
                                    setSelectedOffer(row);
                                    setModalMode("details");
                                    setShowModal(true);
                                }
                            }}
                        />
                    </div>


                    {/* Modal pour accepter ou rejeter */}
                    <Modal
                        open={showModal}
                        onClose={() => {
                            setShowModal(false);
                            setModalMode("details");
                            setRejectReason("");
                        }}
                        title={modalMode === "details" ? t("modal.title") : t("reasonModal.title")}
                        size="default"
                        footer={
                            modalMode === "details" ? (
                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    >
                                        {t("modal.close")}
                                    </button>
                                    {!selectedOffer?.etudiantStatus && (
                                        <>
                                            <button
                                                onClick={() => setModalMode("reject")}
                                                className="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                                            >
                                                <Cross2Icon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    acceptOffer(selectedOffer.id, selectedOffer.studentEmail, token);
                                                    setShowModal(false);
                                                    setModalMode("details");
                                                }}
                                                className="px-4 py-2 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                            >
                                                <CheckIcon className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={() => {
                                            setModalMode("details");
                                            setRejectReason("");
                                        }}
                                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    >
                                        {t("reasonModal.cancel")}
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!rejectReason.trim()) {
                                                toast.error(t("reasonModal.errorEmpty"));
                                                return;
                                            }
                                            rejectOffer(selectedOffer.id, selectedOffer.studentEmail, rejectReason, token);
                                            setShowModal(false);
                                            setModalMode("details");
                                            setRejectReason("");
                                        }}
                                        className="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                                    >
                                        {t("reasonModal.confirm")}
                                    </button>
                                </div>
                            )
                        }
                    >
                        {selectedOffer && modalMode === "details" && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">{selectedOffer.internshipOfferTitle}</h3>
                                <p className="text-gray-600">{selectedOffer.employerEmail}</p>
                            </div>
                        )}
                        {selectedOffer && modalMode === "reject" && (
                            <div className="space-y-4">
                                <p>{t("reasonModal.description")}</p>
                                <textarea
                                    value={rejectReason}
                                    onChange={e => setRejectReason(e.target.value)}
                                    placeholder={t("reasonModal.placeholder")}
                                    className="w-full min-h-[120px] border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>
                        )}
                    </Modal>
                </>
            )}
        </div>
    );
}
