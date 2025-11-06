import React, { useEffect, useMemo, useState } from "react";
import { useStudentStore } from "../../stores/studentStore.js";
import useAuthStore from "../../stores/authStore.js";
import { DataTable } from "../../components/ui/data-table.jsx";
import { Modal } from "../../components/ui/modal.jsx";
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "../../components/ui/popover.jsx";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { CheckIcon, Cross2Icon } from "@radix-ui/react-icons";

export default function OffresAConfirmer() {
    const { t } = useTranslation("student_dashboard_decision");
    const { token, user } = useAuthStore();
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("details");
    const [rejectReason, setRejectReason] = useState("");
    const [filterStudentStatus, setFilterStudentStatus] = useState(null);

    const {
        convocations,
        applications,
        loadAcceptedApplications,
        loading,
        error,
        successMessage,
        clearMessages,
        acceptOffer,
        rejectOffer
    } = useStudentStore();

    // Charger uniquement les candidatures approuvées par l'employeur
    useEffect(() => {
        if (token && user?.role === "STUDENT") {
            loadAcceptedApplications(token);
        }
    }, [loadAcceptedApplications, token, user?.role]);

    // DEBUG : afficher les applications dans la console
    useEffect(() => {
        console.log("Applications chargées :", applications);
    }, [applications]);

    // Gestion des messages
    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            clearMessages();
        }
        if (error) {
            const errorMessage = typeof error === "string" ? error : error?.message || t("errors.generic");
            toast.error(errorMessage);
            clearMessages();
        }
    }, [successMessage, error, clearMessages, t]);

    const columns = useMemo(() => [
        { key: "internshipOfferTitle", label: t("table.OfferTitle") },
        { key: "employerEmail", label: t("table.company") },
        {
            key: "etudiantStatus",
            label: t("table.studentStatus"),
            format: (status) => status ? t(`studentStatus.${status.toLowerCase()}`) : t("studentStatus.pending")
        },
        {
            key: "actions",
            label: t("table.action"),
            actions: [{ key: "view", label: t("actions.view"), showIcon: true }]
        }
    ], [t]);

    const approvedApplications = convocations.filter(app => app.status === "ACCEPTED");

    const filteredApplications = useMemo(() => {
        let filtered = approvedApplications;

        if (filterStudentStatus) {
            filtered = filtered.filter((app) => {
                if (filterStudentStatus === "PENDING") {
                    return !app.etudiantStatus || app.etudiantStatus === "PENDING";
                }
                return app.etudiantStatus === filterStudentStatus;
            });
        }

        return filtered;
    }, [approvedApplications, filterStudentStatus]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">{t("table.title")}</h1>

            {loading && (
                <div className="flex justify-center items-center h-40">
                    <span>{t("loading")}</span>
                </div>
            )}

            {!loading && approvedApplications.length === 0 && (
                <p className="text-gray-500 text-center mt-8">{t("noApplications")}</p>
            )}

            {!loading && approvedApplications.length > 0 && (
                <>
                    <div className="mb-4 flex gap-3">
                        {/* Filtre par statut étudiant */}
                        <Popover>
                            {({ open, setOpen, triggerRef, contentRef }) => (
                                <>
                                    <PopoverTrigger
                                        open={open}
                                        setOpen={setOpen}
                                        triggerRef={triggerRef}
                                    >
                                        <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                                            {t("filter.studentStatus")}:{" "}
                                            {filterStudentStatus
                                                ? t(`studentStatus.${filterStudentStatus.toLowerCase()}`)
                                                : t("filter.all")}
                                        </span>
                                    </PopoverTrigger>
                                    <PopoverContent open={open} contentRef={contentRef}>
                                        <div className="flex flex-col gap-2 min-w-[200px]">
                                            {["PENDING", "CONFIRMED_BY_STUDENT", "REJECTED_BY_STUDENT"].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => {
                                                        setFilterStudentStatus(status);
                                                        setOpen(false);
                                                    }}
                                                    className={`px-3 py-1 rounded text-left ${
                                                        filterStudentStatus === status
                                                            ? "bg-blue-100 font-semibold"
                                                            : "hover:bg-gray-100"
                                                    }`}
                                                >
                                                    {t(`studentStatus.${status.toLowerCase()}`)}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    setFilterStudentStatus(null);
                                                    setOpen(false);
                                                }}
                                                className="px-3 py-1 rounded text-left hover:bg-gray-100"
                                            >
                                                {t("filter.all")}
                                            </button>
                                            <PopoverClose setOpen={setOpen}>
                                                <span className="text-sm text-gray-600">
                                                    {t("filter.close")}
                                                </span>
                                            </PopoverClose>
                                        </div>
                                    </PopoverContent>
                                </>
                            )}
                        </Popover>
                    </div>

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
                </>
            )}

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
                        <>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setModalMode("details");
                                }}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                                <span>{t("modal.close")}</span>
                            </button>
                            {!selectedOffer?.etudiantStatus && (
                                <>
                                    <button
                                        onClick={() => setModalMode("reject")}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-red-100 text-red-700 hover:bg-red-200"
                                    >
                                        <Cross2Icon className="w-4 h-4" />
                                        <span>{t("actions.reject")}</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            acceptOffer(selectedOffer.id, selectedOffer.studentEmail, token);
                                            setShowModal(false);
                                            setModalMode("details");
                                        }}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                    >
                                        <CheckIcon className="w-4 h-4" />
                                        <span>{t("actions.accept")}</span>
                                    </button>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => {
                                    setModalMode("details");
                                    setRejectReason("");
                                }}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                                <span>Annuler</span>
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
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-red-100 text-red-700 hover:bg-red-200"
                            >
                                <span>Confirmer</span>
                            </button>
                        </>
                    )
                }
            >
                {selectedOffer && modalMode === "details" && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.offerTitle")}</h3>
                                <p className="text-gray-600">{selectedOffer.internshipOfferTitle}</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.employer")}</h3>
                                <p className="text-gray-600">{selectedOffer.employerEmail}</p>
                            </div>
                        </div>

                        {selectedOffer.internshipOfferDescription && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.description")}</h3>
                                <p className="text-gray-600 whitespace-pre-wrap">{selectedOffer.internshipOfferDescription}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            {selectedOffer.startDate && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.startDate")}</h3>
                                    <p className="text-gray-600">{new Date(selectedOffer.startDate).toLocaleDateString()}</p>
                                </div>
                            )}

                            {selectedOffer.session && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.session")}</h3>
                                    <p className="text-gray-600">{selectedOffer.session}</p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.employerStatus")}</h3>
                                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                                    {t(`employerStatus.${selectedOffer.status.toLowerCase()}`)}
                                </span>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.studentStatus")}</h3>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                    selectedOffer.etudiantStatus === "CONFIRMED_BY_STUDENT" ? "bg-green-100 text-green-800" :
                                    selectedOffer.etudiantStatus === "REJECTED_BY_STUDENT" ? "bg-red-100 text-red-800" :
                                    "bg-yellow-100 text-yellow-800"
                                }`}>
                                    {selectedOffer.etudiantStatus ? t(`studentStatus.${selectedOffer.etudiantStatus.toLowerCase()}`) : t("studentStatus.pending")}
                                </span>
                            </div>
                        </div>

                        {selectedOffer.selectedCvFileName && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.selectedCv")}</h3>
                                <p className="text-gray-600">{selectedOffer.selectedCvFileName}</p>
                            </div>
                        )}

                        {selectedOffer.createdAt && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.applicationDate")}</h3>
                                <p className="text-gray-600">{new Date(selectedOffer.createdAt).toLocaleDateString()}</p>
                            </div>
                        )}
                    </div>
                )}

                {selectedOffer && modalMode === "reject" && (
                    <div className="space-y-4">
                        <p className="text-gray-600">{t("reasonModal.description")}</p>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Raison
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder={t("reasonModal.placeholder")}
                                className="w-full min-h-[150px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
