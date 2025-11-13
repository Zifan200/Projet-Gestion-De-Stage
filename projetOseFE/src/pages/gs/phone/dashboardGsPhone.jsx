import React, { useEffect, useState, useMemo } from "react";
import { StatCard } from "../../../components/ui/stat-card.jsx";
import { FileTextIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import useAuthStore from "../../../stores/authStore.js";
import useGeStore from "../../../stores/geStore.js";
import { useOfferStore } from "../../../stores/offerStore.js";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const DashboardGsPhone = () => {
    const { t } = useTranslation("gs_dashboard");
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const token = useAuthStore((s) => s.token);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const { cvs, loadAllsStudentCvs } = useGeStore();
    const { offers, loadAllOffersSummary } = useOfferStore();

    useEffect(() => {
        if (!isAuthenticated || !user) navigate("/");
    }, [isAuthenticated, user]);

    useEffect(() => {
        const fetchData = async () => {
            await loadAllsStudentCvs();
            if (token) await loadAllOffersSummary(token);
        };
        fetchData();
    }, [token]);

    // Utilisation de useMemo pour calculer dynamiquement les stats
    const stats = useMemo(() => {
        const pendingCvCount = cvs?.filter((cv) => cv.status === "PENDING").length || 0;
        const acceptedCvCount = cvs?.filter((cv) => cv.status === "ACCEPTED").length || 0;
        const availableOffers = offers?.length || 0;
        const pendingOffers = offers?.filter((offer) => offer.status === "PENDING").length || 0;

        return [
            { title: t("stats.pendingCvs"), value: pendingCvCount, icon: FileTextIcon },
            { title: t("stats.acceptedCvs"), value: acceptedCvCount, icon: FileTextIcon },
            { title: t("stats.availableOffers"), value: availableOffers, icon: EyeOpenIcon },
            { title: t("stats.pendingOffers"), value: pendingOffers, icon: EyeOpenIcon },
        ];
    }, [cvs, offers, t]);

    return (
        <div className="space-y-6 mt-8">
            <h1 className="text-2xl font-semibold text-center">{t("titles.dashboard")}</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                    <StatCard key={i} title={s.title} value={s.value} icon={s.icon} />
                ))}
            </div>
        </div>
    );
};
