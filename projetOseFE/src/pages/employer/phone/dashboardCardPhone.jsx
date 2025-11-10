import React, { useEffect, useMemo } from "react";
import { StatCard } from "../../../components/ui/stat-card.jsx";
import { CheckIcon, EnvelopeClosedIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";
import { useEmployerStore } from "../../../stores/employerStore.js";
import useAuthStore from "../../../stores/authStore.js";

export const DashboardCardPhone = () => {
    const { t } = useTranslation("employer_dashboard");
    const { applications, fetchApplications, loading, error } = useEmployerStore();
    const user = useAuthStore((s) => s.user);

    useEffect(() => {
        if (user?.role === "EMPLOYER") {
            fetchApplications();
        }
    }, [fetchApplications, user]);

    // Création dynamique des stats dans un tableau comme pour les étudiants
    const stats = useMemo(() => {
        const totalApplications = applications.length;
        const activeApplications = applications.filter(
            (o) => o.status === "PENDING"
        ).length;
        const confirmedApplications = applications.filter(
            (o) => o.status === "ACCEPTED"
        ).length;

        const uniqueStudents = new Set(
            applications.map((app) => app.studentEmail || app.etudiant?.email)
        );
        const totalStudents = uniqueStudents.size;

        return [
            { title: t("stats.applications"), value: totalApplications, icon: EnvelopeClosedIcon },
            { title: t("stats.activeApplications"), value: activeApplications, icon: EnvelopeClosedIcon },
            { title: t("stats.offerConfirm"), value: confirmedApplications, icon: CheckIcon },
            { title: t("stats.totalStudents"), value: totalStudents, icon: CheckIcon },
        ];
    }, [applications, t]);

    if (loading) return <p className="text-gray-600">{t("messages.loadPrompt")}</p>;
    if (error) return <p className="text-red-500">{t("errors.loadOffers")}</p>;

    return (
        <div className="flex-1 overflow-auto p-4 space-y-6 pt-8">
            <h1 className="text-xl font-semibold mb-4">{t("titles.home")}</h1>

            {/* Affichage des stats en mode vertical pour mobile */}
            <div className="flex flex-col gap-4">
                {stats.map((s, i) => (
                    <StatCard key={i} title={s.title} value={s.value} icon={s.icon} />
                ))}
            </div>
        </div>
    );
};
