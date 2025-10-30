import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "../../components/ui/header.jsx";
import { DataTable } from "../../components/ui/data-table.jsx";
import { useOfferStore } from "../../stores/offerStore.js";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
} from "../../components/ui/popover.jsx";
import useAuthStore from "../../stores/authStore.js";

import { EyeOpenIcon, DownloadIcon } from "@radix-ui/react-icons";

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-lg"
          >
            ✕
          </button>
        </div>
        <div className="text-gray-800">{children}</div>
      </div>
    </div>
  );
};

export const OfferList = () => {
  const { t } = useTranslation("employer_dashboard_offers");
  const user = useAuthStore((s) => s.user);
  const { offers, loadOffers, downloadOfferPdf } = useOfferStore();
  const navigate = useNavigate();

  const [filterStatus, setFilterStatus] = useState(null);
  const [sortKey, setSortKey] = useState("date");
  const [selectedOffer, setSelectedOffer] = useState(null);

  useEffect(() => {
    loadOffers().catch(() => toast.error(t("error.load")));
  }, []);

  const handleDownload = async (id) => {
    try {
      await downloadOfferPdf(user.token, id);
      toast.success(t("success.download"));
    } catch {
      toast.error(t("error.download"));
    }
  };

  const handleAction = (action, offer) => {
    if (action === "view") setSelectedOffer(offer);
    else if (action === "download") handleDownload(offer.id);
  };

  const sortedAndFilteredOffers = useMemo(() => {
    let filtered = filterStatus
      ? offers.filter((o) => o.status === filterStatus)
      : offers;

    return [...filtered].sort((a, b) => {
      if (sortKey === "date")
        return new Date(b.expirationDate) - new Date(a.expirationDate);
      if (sortKey === "applications")
        return (b.applicationCount || 0) - (a.applicationCount || 0);
      return 0;
    });
  }, [offers, filterStatus, sortKey]);

  const columns = [
    { key: "title", label: t("table.offerTitle") },
    { key: "enterpriseName", label: t("table.enterprise") },
    { key: "targetedProgramme", label: t("table.program") },
    { key: "expirationDate", label: t("table.deadline") },
    { key: "status", label: t("table.status") },
    { key: "applicationCount", label: t("table.applications") },
    {
      key: "actions",
      label: t("table.actions"),
      actions: [
        {
          key: "view",
          label: (
            <>
              <EyeOpenIcon className="w-4 h-4" />
              <span>{t("actions.view")}</span>
            </>
          ),
        },
        {
          key: "download",
          label: (
            <>
              <DownloadIcon className="w-4 h-4" />
              <span>{t("actions.download")}</span>
            </>
          ),
        },
      ],
    },
  ];

  const tableData = sortedAndFilteredOffers.map((offer) => ({
    ...offer,
    expirationDate: new Date(offer.expirationDate).toLocaleDateString(),
    rawStatus: offer.status?.toLowerCase(),
    status: t(`status.${offer.status?.toLowerCase()}`),
  }));

  return (
    <div className="space-y-6">
      <Header
        title={t("title")}
        actionLabel={t("actions.create_another")}
        onAction={() => navigate("/dashboard/employer/add-intership")}
      />

      {/* Filters & Sorting */}
      <div className="flex items-center gap-4">
        <Popover>
          {({ open, setOpen, triggerRef, contentRef }) => (
            <>
              <PopoverTrigger
                open={open}
                setOpen={setOpen}
                triggerRef={triggerRef}
              >
                <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                  {t("filter.status")}:{" "}
                  {filterStatus
                    ? t(`status.${filterStatus.toLowerCase()}`)
                    : t("filter.all")}
                </span>
              </PopoverTrigger>
              <PopoverContent open={open} contentRef={contentRef}>
                <div className="flex flex-col gap-2 min-w-[150px]">
                  {["ACCEPTED", "REJECTED", "PENDING"].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setFilterStatus(status);
                        setOpen(false);
                      }}
                      className={`px-3 py-1 rounded text-left ${
                        filterStatus === status
                          ? "bg-blue-100 font-semibold"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {t(`status.${status.toLowerCase()}`)}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setFilterStatus(null);
                      setOpen(false);
                    }}
                    className="px-3 py-1 rounded text-left hover:bg-gray-100"
                  >
                    {t("filter.all")}
                  </button>
                  <PopoverClose setOpen={setOpen}>
                    <span className="text-sm text-gray-600">
                      {t("menu.close")}
                    </span>
                  </PopoverClose>
                </div>
              </PopoverContent>
            </>
          )}
        </Popover>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={tableData}
        onAction={handleAction}
        emptyMessage={t("table.noOffers")}
      />

      {/* Modal */}
      <Modal
        open={!!selectedOffer}
        onClose={() => setSelectedOffer(null)}
        title={selectedOffer?.title}
      >
        <p className="mb-2 text-gray-700">
          <strong>{t("table.enterprise")}:</strong>{" "}
          {selectedOffer?.enterpriseName}
        </p>
        <p className="mb-2 text-gray-700">
          <strong>{t("table.program")}:</strong>{" "}
          {selectedOffer?.targetedProgramme}
        </p>
        <p className="mb-2 text-gray-700">
          <strong>{t("table.deadline")}:</strong>{" "}
          {new Date(selectedOffer?.expirationDate).toLocaleDateString()}
        </p>
        <p className="mb-4 text-gray-700">
          <strong>{t("table.status")}:</strong>{" "}
          {t(`status.${selectedOffer?.status?.toLowerCase()}`)}
        </p>
        {selectedOffer?.reason && (
          <p className="mb-4 text-gray-700">
            <strong>{t("table.reason")}:</strong> {selectedOffer.reason}
          </p>
        )}
        <p className="text-gray-800 whitespace-pre-line">
          {selectedOffer?.description || t("noDescription")}
        </p>
      </Modal>
    </div>
  );
};
