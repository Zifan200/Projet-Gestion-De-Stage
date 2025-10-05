import React from "react";
import { useTranslation } from "react-i18next";
import { Header } from "../../components/ui/header.jsx";
import { Table } from "../../components/ui/table.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useOfferStore } from "../../stores/offerStore.js";
import { toast } from "sonner";

export const OfferList = ({ navigate }) => {
  const { t } = useTranslation();
  const { offers, loadOffers, deleteOffer } = useOfferStore();

  React.useEffect(() => {
    loadOffers();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteOffer(id);
      toast.success(t("offer.success.delete"));
    } catch {
      toast.error(t("offer.error.delete"));
    }
  };

  const rows = offers.map((offer) => (
    <tr key={offer.id} className="border-t border-gray-300">
      <td className="px-4 py-2">{offer.title}</td>
      <td className="px-4 py-2">{offer.targetedProgramme}</td>
      <td className="px-4 py-2">{offer.employerEmail}</td>
      <td className="px-4 py-2">
        {new Date(offer.expirationDate).toLocaleDateString()}
      </td>
      <td className="px-4 py-2 flex space-x-2">
        <Button
          onClick={() => navigate(`/dashboard/employer/offers/${offer.id}`)}
          label={t("offer.actions.view")}
        />
        <Button
          onClick={() => handleDelete(offer.id)}
          label={t("offer.actions.delete")}
          className="bg-red-400"
        />
      </td>
    </tr>
  ));

  return (
    <div className="space-y-6">
      <Header
        title={t("offer.table.title")}
        actionLabel={t("offer.actions.create_another")}
        onAction={() => navigate("/dashboard/employer/add-intership")}
      />
      <Table
        headers={[
          t("offer.table.offerTitle"),
          t("offer.table.program"),
          t("offer.table.email"),
          t("offer.table.deadline"),
          t("offer.table.actions"),
        ]}
        rows={rows}
        emptyMessage={t("offer.table.noOffers")}
      />
    </div>
  );
};
