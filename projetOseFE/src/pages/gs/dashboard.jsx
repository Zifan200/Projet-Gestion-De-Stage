import React, { useEffect, useState } from "react";
import { StatCard } from "../../components/ui/stat-card.jsx";
import {
  FileTextIcon,
  CheckIcon,
  EyeOpenIcon,
  DownloadIcon,
} from "@radix-ui/react-icons";
import useAuthStore from "../../stores/authStore.js";
import useGeStore from "../../stores/geStore.js";
import { useOfferStore } from "../../stores/offerStore.js";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const GsDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { cvs, loadAllsStudentCvs } = useGeStore();
  const { offers, loadAllOffersSummary } = useOfferStore();

  const [pendingCount, setPendingCount] = useState(0);
  const [availableOffers, setAvailableOffers] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !user) navigate("/");
  }, [isAuthenticated, user]);

  useEffect(() => {
    const fetchData = async () => {
      await loadAllsStudentCvs();
      if (token) {
        await loadAllOffersSummary(token);
      }
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    if (cvs && cvs.length > 0) {
      const pending = cvs.filter((cv) => cv.status === "PENDING").length;
      setPendingCount(pending);
    }
  }, [cvs]);

  useEffect(() => {
    if (offers && offers.length > 0) {
      setAvailableOffers(offers.length);
    }
  }, [offers]);

  const stats = [
    {
      title: t("gsDashboard.stats.pending"),
      value: pendingCount,
      change: t("gsDashboard.stats.thisMonth"),
      icon: FileTextIcon,
    },
    {
      title: t("menu.availableOffers"),
      value: availableOffers,
      icon: EyeOpenIcon,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t("gsDashboard.title")}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <StatCard key={i} title={s.title} value={s.value} icon={s.icon} />
        ))}
      </div>
    </div>
  );
};
