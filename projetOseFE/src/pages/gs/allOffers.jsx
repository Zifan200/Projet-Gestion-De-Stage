import { useTranslation } from "react-i18next";
import { Table } from "../../components/ui/table.jsx";
import { Header } from "../../components/ui/header.jsx";
import React, { useEffect, useState } from "react";
import { useOfferStore } from "../../stores/offerStore.js";
import useAuthStore from "../../stores/authStore.js";
import { Button } from "../../components/ui/button.jsx";
import { toast } from "sonner";

export const AllOffers = () => {
  const { t } = useTranslation("gs_dashboard_all_internships");
  const user = useAuthStore((s) => s.user);

  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOffers, setCurrentOffers] = useState([]);
  const [rejectReason, setRejectReason] = useState("");

  const offerStatuses = {
    ALL: t("filter.all"),
    PENDING: t("status.pending"),
    ACCEPTED: t("status.accepted"),
    REJECTED: t("status.rejected"),
  };

  const [currentOfferStatus, setCurrentOfferStatus] = useState(
    offerStatuses.ALL,
  );
  const [currentProgram, setCurrentProgram] = useState(t("filter.program.all"));

  const {
    offers,
    loadAllOffersSummary,
    acceptedOffers,
    loadAcceptedOffers,
    rejectedOffers,
    loadRejectedOffers,
    pendingOffers,
    loadPendingOffers,
    programs,
    loadPrograms,
    viewOffer,
    loading,
    updateOfferStatus,
    downloadOfferPdf,
  } = useOfferStore();

  useEffect(() => {
    const loadAllData = async () => {
      await loadPrograms();
      await loadAllOffersSummary();
      await loadPendingOffers();
      await loadAcceptedOffers();
      await loadRejectedOffers();
    };
    loadAllData();
  }, []);

  useEffect(() => {
    applyCurrentFilter();
  }, [
    currentOfferStatus,
    currentProgram,
    offers,
    pendingOffers,
    acceptedOffers,
    rejectedOffers,
  ]);

  const applyCurrentFilter = () => {
    let listToFilter = [];
    switch (currentOfferStatus) {
      case offerStatuses.PENDING:
        listToFilter = pendingOffers;
        break;
      case offerStatuses.ACCEPTED:
        listToFilter = acceptedOffers;
        break;
      case offerStatuses.REJECTED:
        listToFilter = rejectedOffers;
        break;
      case offerStatuses.ALL:
        listToFilter = offers;
        break;
    }

    let filtered = listToFilter;
    if (currentProgram !== t("filter.program.all")) {
      filtered = listToFilter.filter(
        (o) => o.targetedProgramme === currentProgram,
      );
    }
    setCurrentOffers(filtered);
  };

  const openOffer = async (offerId) => {
    try {
      await viewOffer(user.token, offerId);
      const { selectedOffer, isModalOpen } = useOfferStore.getState();
      setSelectedOffer(selectedOffer);
      setIsModalOpen(isModalOpen);
    } catch (err) {
      console.error(err);
      toast.error(t("error.loadOffer"));
    }
  };

  const handleAccept = async () => {
    try {
      await updateOfferStatus(user.token, selectedOffer.id, "ACCEPTED", "");
      toast.success(t("modal.accepted"));
      setIsModalOpen(false);
      setSelectedOffer(null);
      await loadAllOffersSummary();
      await loadPendingOffers();
      await loadAcceptedOffers();
      await loadRejectedOffers();
    } catch (err) {
      console.error(err);
      toast.error(t("error.updateStatus"));
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return toast.error(t("modal.reasonRequired"));

    try {
      await updateOfferStatus(
        user.token,
        selectedOffer.id,
        "REJECTED",
        rejectReason,
      );
      toast.success(t("modal.rejectSuccess"));
      setIsModalOpen(false);
      setSelectedOffer(null);
      setRejectReason("");
      await loadAllOffersSummary();
      await loadPendingOffers();
      await loadAcceptedOffers();
      await loadRejectedOffers();
    } catch (err) {
      console.error(err);
      toast.error(t("error.rejectFailed"));
    }
  };

  const handleDownload = async (id) => {
    try {
      await downloadOfferPdf(user.token, id);
      toast.success(t("success.download"));
    } catch {
      toast.error(t("error.download"));
    }
  };

  const tableRows = () =>
    currentOffers.map((offer) => (
      <tr key={offer.id} className="border-t border-gray-300">
        <td className="px-4 py-2">{offer.title}</td>
        <td className="px-4 py-2">{offer.enterpriseName}</td>
        <td className="px-4 py-2">{offer.targetedProgramme}</td>
        <td className="px-4 py-2">
          {t(`status.${offer.status?.toLowerCase()}`)}
        </td>
        <td className="px-4 py-2">
          {new Date(offer.expirationDate).toLocaleDateString()}
        </td>
        <td className="px-4 py-2 flex space-x-2">
          <Button
            label={t("actions.view")}
            className="w-1/2"
            onClick={() => openOffer(offer.id)}
          />
          <Button
            onClick={() => handleDownload(offer.id)}
            label={t("actions.download")}
            className="w-1/2 bg-amber-200 hover:bg-amber-50"
          />
        </td>
      </tr>
    ));

  return (
    <div className="space-y-6">
      <select
        value={currentProgram}
        onChange={(e) => setCurrentProgram(e.target.value)}
      >
        <option value={t("filter.program.all")}>
          {t("filter.program.all")}
        </option>
        {programs.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      <select
        value={currentOfferStatus}
        onChange={(e) => setCurrentOfferStatus(e.target.value)}
      >
        {Object.values(offerStatuses).map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      {loading ? (
        <p>{t("table.loading")}</p>
      ) : (
        <>
          <Header title={t("title")} />
          <Table
            headers={[
              t("table.offerTitle"),
              t("table.enterprise"),
              t("table.program"),
              t("table.status"),
              t("table.deadline"),
              t("actions.view"),
            ]}
            rows={tableRows()}
            emptyMessage={t("table.noOffers")}
          />
        </>
      )}

      {isModalOpen && selectedOffer && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-3/4 max-w-lg">
            <h2 className="text-xl font-semibold mb-4">
              {selectedOffer.title}
            </h2>
            <p>
              <strong>{t("modal.companyEmail")}:</strong>{" "}
              {selectedOffer.employerEmail}
            </p>
            <p>
              <strong>{t("modal.targetedProgramme")}:</strong>{" "}
              {selectedOffer.targetedProgramme}
            </p>
            <p>
              <strong>{t("modal.publishedDate")}:</strong>{" "}
              {selectedOffer.publishedDate
                ? new Date(selectedOffer.publishedDate).toLocaleDateString()
                : "-"}
            </p>
            <p>
              <strong>{t("modal.deadline")}:</strong>{" "}
              {selectedOffer.expirationDate
                ? new Date(selectedOffer.expirationDate).toLocaleDateString()
                : "-"}
            </p>
            <p>
              <strong>{t("modal.description")}:</strong>{" "}
              {selectedOffer.description}
            </p>
            <p>
              <strong>{t("modal.status")}:</strong>{" "}
              {t(`status.${selectedOffer.status?.toLowerCase()}`)}
            </p>

            <div className="mt-4">
              <label className="block font-medium mb-1">
                {t("modal.rejectReason")}
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t("modal.reasonPlaceholder")}
                className="w-full border rounded p-2"
                rows={3}
              />
            </div>

            <div className="flex justify-between mt-6">
              <div className="flex space-x-2">
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  onClick={handleAccept}
                >
                  {t("modal.accept")}
                </button>

                <button
                  className={`px-4 py-2 rounded text-white ${
                    rejectReason.trim()
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                  disabled={!rejectReason.trim()}
                  onClick={handleReject}
                >
                  {t("actions.reject")}
                </button>
              </div>

              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedOffer(null);
                  setRejectReason("");
                }}
              >
                {t("modal.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
