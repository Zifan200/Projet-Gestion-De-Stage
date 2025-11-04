import React, { useEffect, useMemo } from "react";
import { useStudentStore } from "../../stores/studentStore.js";
import useAuthStore from "../../stores/authStore.js";
import { DataTable } from "../../components/ui/data-table.jsx";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function OffresAConfirmer() {
    const { t } = useTranslation("student_dashboard_decision");
    const { token } = useAuthStore();

    const {
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
        if (token) {
            loadAcceptedApplications(token);
        }
    }, [loadAcceptedApplications, token]);

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

    // Colonnes du tableau
    const columns = useMemo(() => [
        { key: "internshipOfferTitle", label: t("table.OfferTitle") },
        { key: "employerEmail", label: t("table.company") },
        {
            key: "actions",
            label: t("table.action"),
            actions: [
                { key: "accept", label: t("actions.accept") },
                { key: "reject", label: t("actions.reject") }
            ]
        }
    ], [t]);

    // Filtrer uniquement les candidatures approuvées par l'employeur
    const approvedApplications = applications.filter(app => app.status === "ACCEPTED");

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
                <DataTable
                    columns={columns}
                    data={approvedApplications}
                    onAction={(actionKey, row) => {
                        if (actionKey === "accept") {
                            acceptOffer(row.id, token);
                        } else if (actionKey === "reject") {
                            const raison = prompt(t("reasons.enterReason"), "");
                            if (raison !== null) {
                                rejectOffer(row.id, raison, token);
                            }
                        }
                    }}
                />
            )}
        </div>
    );
}
