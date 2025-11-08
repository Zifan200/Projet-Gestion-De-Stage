import React, { useEffect, useMemo } from "react";
import { StatCard } from "../../components/ui/stat-card.jsx";
import { CheckIcon, EnvelopeClosedIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";
import { useEmployerStore } from "../../stores/employerStore.js";
import useAuthStore from "../../stores/authStore.js";
import {PhoneCallIcon} from "lucide-react";

export const EmployerDashboard = () => {
  const { t } = useTranslation("employer_dashboard");
  const {
    applications,
    fetchApplications,
    convocations,
    loadConvocations,
    loading,
    error
  } = useEmployerStore();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user?.role === "EMPLOYER") {
      fetchApplications();
      loadConvocations();
    }
  }, [fetchApplications, loadConvocations, user]);

  const stats = useMemo(() => {
    const totalApplications = applications.length;
    const activeApplications = applications.filter(
      (o) => o.status === "PENDING",
    ).length;
    const confirmedApplications = applications.filter(
      (o) => o.status === "ACCEPTED",
    ).length;

    const uniqueStudents = new Set(
      applications.map((app) => app.studentEmail || app.etudiant?.email)
    );
    const totalStudents = uniqueStudents.size;

    const pendingConvocations = convocations.filter((c) => c.status === "PENDING").length;

    return {
      totalApplications,
      activeApplications,
      confirmedApplications,
      totalStudents,
      pendingConvocations
    };
  }, [applications, convocations]);

  if (loading)
    return <p className="text-gray-600">{t("messages.loadPrompt")}</p>;
  if (error) return <p className="text-red-500">{t("errors.loadOffers")}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold mb-6">{t("titles.home")}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title={t("stats.applications")}
          value={stats.totalApplications}
          icon={EnvelopeClosedIcon}
        />
        <StatCard
          title={t("stats.activeApplications")}
          value={stats.activeApplications}
          icon={EnvelopeClosedIcon}
        />
        <StatCard
          title={t("stats.offerConfirm")}
          value={stats.confirmedApplications}
          icon={CheckIcon}
        />
        <StatCard
          title={t("stats.totalStudents")}
          value={stats.totalStudents}
          icon={CheckIcon}
        />
        <StatCard
            title={t("stats.pendingConvocations")}
            value={stats.pendingConvocations}
            icon={PhoneCallIcon}
        />
      </div>
    </div>
  );
};
