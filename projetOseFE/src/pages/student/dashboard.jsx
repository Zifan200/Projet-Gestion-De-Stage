import React from "react";
import { StatCard } from "../../components/ui/stat-card.jsx";
import {
  FileTextIcon,
  DownloadIcon,
  CheckIcon,
  EyeOpenIcon, EnvelopeClosedIcon,
} from "@radix-ui/react-icons";
import { useCvStore } from "../../stores/cvStore.js";
import useAuthStore from "../../stores/authStore.js";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {useStudentStore} from "../../stores/studentStore.js";

export const StudentDashboard = () => {
  const { cvs, loadCvs } = useCvStore();
  const { applications, loadAllApplications } = useStudentStore();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !user) navigate("/");
    else {
      loadCvs();
      loadAllApplications();
    }
  }, [isAuthenticated, user]);

  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();

  const thisMonthCvCount = cvs.filter((cv) => {
    const date = new Date(cv.uploadedAt);
    return date.getMonth() === month && date.getFullYear() === year;
  }).length;

  const thisMonthApplicationCount = applications.filter((app) => {
    const date = new Date(app.createdAt);
    return date.getMonth() === month && date.getFullYear() === year;
  }).length;

  const stats = [
    {
      title: t("menu.cvs"),
      value: cvs.length,
      change: `+${thisMonthCvCount} ce mois`,
      icon: FileTextIcon,
    },
    {
      title: t("menu.applications"),
      value: applications.length,
      change: `+${thisMonthApplicationCount} ce mois`,
      icon: EnvelopeClosedIcon,
    },
  ];

  return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {stats.map((s, i) => (
              <StatCard
                  key={i}
                  title={s.title}
                  value={s.value}
                  change={s.change}
                  icon={s.icon}
              />
          ))}
        </div>

        {/* <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"> */}
        {/*   <h2 className="text-lg font-semibold text-gray-800 mb-4"> */}
        {/*     {t("menu.lastActivity")} */}
        {/*   </h2> */}
        {/* </section> */}
      </div>
  );
};