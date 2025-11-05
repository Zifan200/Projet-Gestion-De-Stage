import React, { useEffect, useMemo, useState } from "react";
import useAuthStore from "../../stores/authStore.js";
import { DataTable } from "../../components/ui/data-table.jsx";
import { Modal } from "../../components/ui/modal.jsx";
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "../../components/ui/popover.jsx";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useStudentStore, ApprovalStatus } from "../../stores/studentStore.js";
import {offerService} from "../../services/offerService.js";

export default function StudentConvocations() {
    const { t } = useTranslation("student_dashboard_convocations");
    const { token } = useAuthStore();
    const [selectedConvocation, setSelectedConvocation] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState(null);
    const [offerTitle, setOfferTitle] = useState("");


    const { applications, loadConvocations, loading, error, clearMessages, updateConvocationStatus } = useStudentStore();

    // Charger les convocations
    useEffect(() => {
        if (token) {
            loadConvocations(token);
        }
    }, [loadConvocations, token]);

    // Gestion des messages d'erreur
    useEffect(() => {
        if (error) {
            toast.error(typeof error === "string" ? error : error?.message || t("errors.generic"));
            clearMessages();
        }
    }, [error, clearMessages, t]);

    useEffect(() => {
        if (selectedConvocation?.internshipOfferId) {
            offerService.getOfferById(token, selectedConvocation.internshipApplicationId)
                .then(data => setOfferTitle(data.title))
                .catch(err => {
                    console.error(err);
                    setOfferTitle(t("modal.unknownOffer"));
                });
        }
    }, [selectedConvocation, token, t]);

    const columns = useMemo(() => [
        { key: "internshipOfferTitle", label: t("table.offerTitle") },
        { key: "employerEmail", label: t("table.company") },
        { key: "convocationDate", label: t("table.convocationDate"), format: (date) => date ? new Date(date).toLocaleString() : "" },
        {
            key: "status",
            label: t("table.status"),
            format: (status) => status ? t(`convocationStatus.${status.toLowerCase()}`) : t("convocationStatus.pending")
        },
        {
            key: "actions",
            label: t("table.action"),
            actions: [
                { key: "view", label: t("actions.view"), showIcon: true },
            ]
        }
    ], [t]);

    const filteredConvocations = useMemo(() => {
        return filterStatus
            ? applications.filter((conv) => conv.status === filterStatus)
            : applications;
    }, [applications, filterStatus]);

    const handleAction = async (actionKey, convocation) => {
        setSelectedConvocation(convocation);
        if (actionKey === "view") {
            setShowModal(true);
        } else if (actionKey === "confirm" || actionKey === "reject") {
            const newStatus = actionKey === "confirm" ? "CONFIRMED_BY_STUDENT" : "REJECTED_BY_STUDENT";
            try {
                await updateConvocationStatus(convocation.id, convocation.studentEmail, newStatus, token);
                toast.success(t(`convocationStatus.${newStatus.toLowerCase()}Success`));
            } catch (err) {
                toast.error(err.message || t("errors.generic"));
            }
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">{t("table.title")}</h1>

            {loading && (
                <div className="flex justify-center items-center h-40">
                    <span>{t("loading")}</span>
                </div>
            )}

            {!loading && applications.length === 0 && (
                <p className="text-gray-500 text-center mt-8">{t("noConvocations")}</p>
            )}

            {!loading && applications.length > 0 && (
                <>
                    {/* Filtre par statut */}
                    <div className="mb-4 flex gap-3">
                        <Popover>
                            {({ open, setOpen, triggerRef, contentRef }) => (
                                <>
                                    <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
                                        <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                                            {t("filter.status")}: {filterStatus ? t(`convocationStatus.${filterStatus.toLowerCase()}`) : t("filter.all")}
                                        </span>
                                    </PopoverTrigger>
                                    <PopoverContent open={open} contentRef={contentRef}>
                                        <div className="flex flex-col gap-2 min-w-[200px]">
                                            {["PENDING", "CONFIRMED_BY_STUDENT", "REJECTED_BY_STUDENT"].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => {
                                                        setFilterStatus(status);
                                                        setOpen(false);
                                                    }}
                                                    className={`px-3 py-1 rounded text-left ${
                                                        filterStatus === status ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"
                                                    }`}
                                                >
                                                    {t(`convocationStatus.${status.toLowerCase()}`)}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    setFilterStatus(null);
                                                    setOpen(false);
                                                }}
                                                className="px-3 py-1 rounded text-left hover:bg-gray-100"
                                            >
                                                {t("filter.all")}
                                            </button>
                                            <PopoverClose setOpen={setOpen}>
                                                <span className="text-sm text-gray-600">{t("filter.close")}</span>
                                            </PopoverClose>
                                        </div>
                                    </PopoverContent>
                                </>
                            )}
                        </Popover>
                    </div>

                    <DataTable
                        columns={columns}
                        data={filteredConvocations}
                        onAction={handleAction}
                    />
                </>
            )}

            {selectedConvocation && showModal && (
                <Modal
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    title={t("modal.title")}
                    size="default"
                >
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.offerTitle")}</h3>
                            <p className="text-gray-600">{selectedConvocation.internshipApplicationTitle}</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.employer")}</h3>
                            <p className="text-gray-600">{selectedConvocation.employerEmail}</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.convocationDate")}</h3>
                            <p className="text-gray-600">{new Date(selectedConvocation.convocationDate).toLocaleString()}</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.status")}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                selectedConvocation.status === "CONFIRMED_BY_STUDENT" ? "bg-green-100 text-green-800" :
                                    selectedConvocation.status === "REJECTED_BY_STUDENT" ? "bg-red-100 text-red-800" :
                                        "bg-yellow-100 text-yellow-800"
                            }`}>
                    {selectedConvocation.status
                        ? t(`convocationStatus.${selectedConvocation.status.toLowerCase()}`)
                        : t("convocationStatus.pending")}
                </span>
                        </div>

                        {selectedConvocation.createdAt && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.createdAt")}</h3>
                                <p className="text-gray-600">{new Date(selectedConvocation.createdAt).toLocaleDateString()}</p>
                            </div>
                        )}

                        {selectedConvocation.status === "PENDING" && (
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    className="px-4 py-2 bg-green-100 text-green-800 rounded hover:bg-green-200"
                                    onClick={async () => {
                                        await updateConvocationStatus(
                                            selectedConvocation.id,
                                            selectedConvocation.studentEmail,
                                            ApprovalStatus.CONFIRMED_BY_STUDENT,
                                            token
                                        );
                                        setShowModal(false);
                                    }}
                                >
                                    {t("actions.confirm")}
                                </button>
                                <button
                                    className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
                                    onClick={async () => {
                                        await updateConvocationStatus(
                                            selectedConvocation.id,
                                            selectedConvocation.studentEmail,
                                            ApprovalStatus.REJECTED_BY_STUDENT,
                                            token
                                        );
                                        setShowModal(false);
                                    }}
                                >
                                    {t("actions.reject")}
                                </button>
                            </div>
                        )}

                        {/* Bouton Fermer */}
                        {selectedConvocation.status !== "PENDING" && (
                            <div className="mt-6 flex justify-end">
                                <button
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded
                                    hover:bg-gray-200"
                                    onClick={() => setShowModal(false)}
                                >
                                    <Cross2Icon className="w-4 h-4" />
                                    {t("modal.close")}
                                </button>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
}
