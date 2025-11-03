import React, { useEffect, useState } from "react";
import { StatCard } from "../../components/ui/stat-card.jsx";
import { FileTextIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import useAuthStore from "../../stores/authStore.js";
import useGeStore from "../../stores/geStore.js";
import { useOfferStore } from "../../stores/offerStore.js";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const GsDashboard = () => {
  const { t } = useTranslation("gs_dashboard");
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { cvs, loadAllsStudentCvs } = useGeStore();
  const { offers, loadAllOffersSummary } = useOfferStore();

  const [pendingCvCount, setPendingCvCount] = useState(0);
  const [acceptedCvCount, setAcceptedCvCount] = useState(0);
  const [availableOffers, setAvailableOffers] = useState(0);
  const [pendingOffers, setPendingOffers] = useState(0);

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

  useEffect(() => {
    if (cvs?.length) {
      const pending = cvs.filter((cv) => cv.status === "PENDING").length;
      const accepted = cvs.filter((cv) => cv.status === "ACCEPTED").length;
      setPendingCvCount(pending);
      setAcceptedCvCount(accepted);
    }
  }, [cvs]);

  useEffect(() => {
    if (offers?.length) {
      setAvailableOffers(offers.length);
      const pending = offers.filter((offer) => offer.status === "PENDING").length;
      setPendingOffers(pending);
    }
  }, [offers]);

  const stats = [
    {
      title: t("stats.pendingCvs"),
      value: pendingCvCount,
      icon: FileTextIcon,
    },
    {
      title: t("stats.acceptedCvs"),
      value: acceptedCvCount,
      icon: FileTextIcon,
    },
    {
      title: t("stats.availableOffers"),
      value: availableOffers,
      icon: EyeOpenIcon,
    },
    {
      title: t("stats.pendingOffers"),
      value: pendingOffers,
      icon: EyeOpenIcon,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t("titles.dashboard")}</h1>
      {/* <p className="text-gray-500"> */}
      {/*   {t("messages.welcome", { firstName: user?.firstName || "" })} */}
      {/* </p> */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <StatCard key={i} title={s.title} value={s.value} icon={s.icon} />
        ))}
      </div>
    </div>
  );
};
