import React, { useEffect, useMemo } from "react";
import { useStudentStore } from "../../stores/studentStore.js";
import useAuthStore from "../../stores/authStore.js";
import { DataTable } from "../../components/ui/data-table.jsx";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function OffresAConfirmer() {
    const { t } = useTranslation("student_dashboard_decision");

    const { token, user } = useAuthStore();
    const {
        applications,
        loadApplicationsByStatus,
        acceptOffer,
        rejectOffer,
        loading,
        error,
        successMessage,
        clearMessages,
    } = useStudentStore();

// ✅ Charger les applications uniquement si user et token sont définis
    useEffect(() => {
        if (user?.email && token) {
            loadApplicationsByStatus(token, "PENDING");
        }
    }, [loadApplicationsByStatus, user, token]);

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

    const handleAccept = async (applicationId) => {
        await acceptOffer(applicationId, user.email, token);
    };

    const handleReject = async (applicationId) => {
        const reason = prompt(t("prompt.rejectReason"));
        if (reason) {
            await rejectOffer(applicationId, user.email, reason, token);
        }
    };

    const columns = useMemo(() => [
        { key: "offerTitle", label: t("table.title") },
        { key: "companyName", label: t("table.company") },
        {
            key: "createdAt",
            label: t("table.receivedDate"),
            render: (row) => new Date(row.createdAt).toLocaleDateString(),
        },
        {
            key: "actions",
            label: t("table.action"),
            actions: [
                {
                    key: "accept",
                    label: <span>{t("actions.accept")}</span>,
                },
                {
                    key: "reject",
                    label: <span>{t("actions.reject")}</span>,
                },
            ],
        },
    ], [t]);

    const handleAction = (action, app) => {
        if (action === "accept") handleAccept(app.id);
        else if (action === "reject") handleReject(app.id);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>

            {loading && (
                <div className="flex justify-center items-center h-40">
                    <span>{t("loading")}</span>
                </div>
            )}

            {!loading && applications.length === 0 && (
                <p className="text-gray-500 text-center mt-8">{t("noApplications")}</p>
            )}

            {!loading && applications.length > 0 && (
                <DataTable columns={columns} data={applications} onAction={handleAction} />
            )}
        </div>
    );
}