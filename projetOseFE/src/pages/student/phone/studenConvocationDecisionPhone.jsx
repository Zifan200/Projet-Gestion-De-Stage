import React, { useEffect, useMemo, useState } from "react";
import useAuthStore from "../../../stores/authStore.js";
import { DataTable } from "../../../components/ui/data-table.jsx";
import { Modal } from "../../../components/ui/modal.jsx";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useStudentStore, ApprovalStatus } from "../../../stores/studentStore.js";

export default function StudentConvocationDecisionPhone() {
    const { t } = useTranslation("student_dashboard_convocations");
    const { token } = useAuthStore();
    const [selectedConvocation, setSelectedConvocation] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const { convocations, loadConvocations, loading, error, clearMessages, updateConvocationStatus } = useStudentStore();

    useEffect(() => {
        loadConvocations(token);
    }, [token]);

    useEffect(() => {
        if (error) {
            toast.error(typeof error === "string" ? error : error?.message || t("errors.generic"));
            clearMessages();
        }
    }, [error, clearMessages, t]);

    const columns = useMemo(() => [
        { key: "internshipOfferTitle", label: t("table.offerTitle") },
        {
            key: "convocationDate",
            label: t("table.convocationDate"),
            format: (date) => date ? new Date(date).toLocaleString() : ""
        },
        {
            key: "actions",
            label: t("table.action"),
            actions: [
                { key: "view", showIcon: true }
            ]
        }
    ], [t]);

    const handleAction = (actionKey, convocation) => {
        setSelectedConvocation(convocation);
        if (actionKey === "view") {
            setShowModal(true);
        }
    };

    const filteredConvocations = useMemo(() => convocations || [], [convocations]);

    return (
        <div className="p-4 max-w-[430px] mx-auto mt-6">
            <h1 className="text-xl font-semibold mb-4">{t("table.title")}</h1>

            {loading && (
                <div className="flex justify-center items-center h-40">
                    <span>{t("loading")}</span>
                </div>
            )}

            {!loading && filteredConvocations.length === 0 && (
                <p className="text-gray-500 text-center mt-8">{t("noConvocations")}</p>
            )}

            {!loading && filteredConvocations.length > 0 && (
                <DataTable
                    columns={columns}
                    data={filteredConvocations}
                    onAction={handleAction}
                />
            )}

            {selectedConvocation && showModal && (
                <Modal
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    title={selectedConvocation.internshipOfferTitle}
                    size="default"
                >
                    <div className="space-y-4">
                        {/* Internship Title */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-1">{t("modal.offerTitle")}</h3>
                            <p className="text-gray-600">{selectedConvocation.internshipOfferTitle}</p>
                        </div>

                        {/* Employer */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-1">{t("modal.employer")}</h3>
                            <p className="text-gray-600">{selectedConvocation.employerEnterpriseName}</p>
                        </div>

                        {/* Convocation Date */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-1">{t("modal.convocationDate")}</h3>
                            <p className="text-gray-600">{new Date(selectedConvocation.convocationDate).toLocaleString()}</p>
                        </div>

                        {/* Buttons */}
                        {selectedConvocation.status === "PENDING" && (
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
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
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
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

                        {selectedConvocation.status !== "PENDING" && (
                            <div className="flex justify-end mt-4">
                                <button
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
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
