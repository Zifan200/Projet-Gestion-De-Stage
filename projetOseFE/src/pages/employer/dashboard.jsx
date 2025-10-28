import React, { useEffect, useMemo, useState } from "react";
import { StatCard } from "../../components/ui/stat-card.jsx";
import { CheckIcon, EnvelopeClosedIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";
import { useEmployerStore } from "../../stores/employerStore.js";
import { api } from "../../lib/api.js";

export const EmployerDashboard = () => {
  const { t } = useTranslation("employer_dashboard");
  const { applications, fetchApplications, loading, error } =
    useEmployerStore();
  const [studentApps, setStudentApps] = useState([]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    const fetchStudentApps = async () => {
      try {
        const res = await api.get("/applications/employer");
        setStudentApps(res.data);
      } catch (e) {
        console.error(
          "Erreur lors du chargement des candidatures étudiantes:",
          e,
        );
      }
    };
    fetchStudentApps();
  }, []);

  const stats = useMemo(() => {
    const totalOffers = applications.length;
    const activeOffers = applications.filter(
      (o) => o.status === "PENDING",
    ).length;
    const acceptedOffers = applications.filter(
      (o) => o.status === "ACCEPTED",
    ).length;
    const confirmedOffers = acceptedOffers;
    const totalStudents = studentApps.length;

    return {
      totalOffers,
      activeOffers,
      totalStudents,
      confirmedOffers,
    };
  }, [applications, studentApps]);

  if (loading)
    return <p className="text-gray-600">{t("messages.loadPrompt")}</p>;
  if (error) return <p className="text-red-500">{t("errors.loadOffers")}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold mb-6">{t("titles.home")}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title={t("stats.myOffers")}
          value={stats.totalOffers}
          icon={EnvelopeClosedIcon}
        />
        <StatCard
          title={t("stats.offerConfirm")}
          value={stats.confirmedOffers}
          icon={CheckIcon}
        />
      </div>
    </div>
  );
};
