import React, { useEffect, useMemo } from "react";
import { StatCard } from "../../components/ui/stat-card.jsx";
import { FileTextIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { useCvStore } from "../../stores/cvStore.js";
import { useOfferStore } from "../../stores/offerStore.js";
import useAuthStore from "../../stores/authStore.js";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const StudentDashboard = () => {
  const { cvs, loadCvs } = useCvStore();
  const {
    offers,
    loadOffersSummary,
    loadAcceptedOffers,
    loadPendingOffers,
    loadRejectedOffers,
  } = useOfferStore();

  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { t } = useTranslation("student_dashboard");

  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/");
    } else {
      loadCvs();
      if (token) {
        loadOffersSummary(token);
        loadAcceptedOffers(token);
        loadPendingOffers(token);
        loadRejectedOffers(token);
      }
    }
  }, [isAuthenticated, user, token]);

  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();

  const thisMonthCount = cvs.filter((cv) => {
    const date = new Date(cv.uploadedAt);
    return date.getMonth() === month && date.getFullYear() === year;
  }).length;

  const stats = useMemo(() => {
    const totalCvs = cvs.length;
    const availableOffers = offers.length;

    return [
      {
        title: t("stats.cvs"),
        value: totalCvs,
        icon: FileTextIcon,
      },
      {
        title: t("stats.availableOffers"),
        value: availableOffers,
        icon: EyeOpenIcon,
      },
    ];
  }, [cvs, offers, thisMonthCount, t]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t("titles.dashboard")}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <StatCard key={i} title={s.title} value={s.value} icon={s.icon} />
        ))}
      </div>
    </div>
  );
};
