import React from "react";
import { StatCard } from "../../components/ui/stat-card.jsx";
import {
  BackpackIcon,
  PersonIcon,
  CheckIcon,
  EnvelopeClosedIcon,
} from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";

export const EmployerDashboard = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title={t("menu.myOffer")}
          value="12"
          change="+1% ce mois"
          icon={EnvelopeClosedIcon}
        />
        {/* <StatCard */}
        {/*   title={t("menu.activeOffer")} */}
        {/*   value="8" */}
        {/*   change="+1" */}
        {/*   icon={BackpackIcon} */}
        {/* /> */}
        {/* <StatCard */}
        {/*   title={t("menu.studentOffer")} */}
        {/*   value="42" */}
        {/*   change="+5%" */}
        {/*   icon={PersonIcon} */}
        {/* /> */}
        {/* <StatCard */}
        {/*   title={t("menu.offerConfirm")} */}
        {/*   value="18" */}
        {/*   change="+3" */}
        {/*   icon={CheckIcon} */}
        {/* /> */}
      </div>

      {/* <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"> */}
      {/*   <h2 className="text-lg font-semibold text-gray-800 mb-4"> */}
      {/*     {t("menu.lastActivity")} */}
      {/*   </h2> */}
      {/* </section> */}
    </div>
  );
};
