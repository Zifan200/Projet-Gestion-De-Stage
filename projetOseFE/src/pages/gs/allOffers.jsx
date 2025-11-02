
import { useTranslation } from "react-i18next";
import { Table } from "../../components/ui/table.jsx";
import { Header } from "../../components/ui/header.jsx";
import React, { useEffect, useState } from "react";
import { useOfferStore } from "../../stores/offerStore.js";
import useAuthStore from "../../stores/authStore.js";
import { toast } from "sonner";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
} from "../../components/ui/popover.jsx";
import { EyeOpenIcon, DownloadIcon } from "@radix-ui/react-icons";

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
  const [currentProgram, setCurrentProgram] = useState(null);
  const [currentSession, setCurrentSession] = useState("All");
  const [currentYear, setCurrentYear] = useState("All");

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
    currentSession,
    currentYear,
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

    // Filter by program
    if (currentProgram) {
      filtered = filtered.filter((o) => o.targetedProgramme === currentProgram);
    }

    // Filter by session
    if (currentSession !== "All") {
      filtered = filtered.filter((o) => o.session === currentSession);
    }

    // Filter by year
    if (currentYear !== "All") {
      filtered = filtered.filter((o) => {
        if (!o.startDate) return false;
        const year = new Date(o.startDate).getFullYear();
        return year.toString() === currentYear;
      });
    }

    setCurrentOffers(filtered);
  };

  // Extract available years
  const availableYears = Array.from(
    new Set(
      offers
        .filter((o) => o.startDate)
        .map((o) => new Date(o.startDate).getFullYear())
    )
  ).sort((a, b) => b - a);

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

  const getStatusColor = (status) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return statusColors[status?.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  const tableRows = () =>
    currentOffers.map((offer) => (
      <tr key={offer.id} className="border-t border-gray-200 text-gray-700 text-sm">
        <td className="px-4 py-3">{offer.title}</td>
        <td className="px-4 py-3">{offer.enterpriseName}</td>
        <td className="px-4 py-3">{offer.targetedProgramme}</td>
        <td className="px-4 py-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(offer.status)}`}
          >
            {t(`status.${offer.status?.toLowerCase()}`)}
          </span>
        </td>
        <td className="px-4 py-3">
          {new Date(offer.expirationDate).toLocaleDateString()}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => openOffer(offer.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200"
            >
              <EyeOpenIcon className="w-4 h-4" />
              <span>{t("actions.view")}</span>
            </button>
            <button
              onClick={() => handleDownload(offer.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-green-100 text-green-700 hover:bg-green-200"
            >
              <DownloadIcon className="w-4 h-4" />
              <span>{t("actions.download")}</span>
            </button>
          </div>
        </td>
      </tr>
    ));

  return (
    <div className="space-y-6">
      <Header title={t("title")} />

      {/* Filters */}
      <div className="flex items-center gap-4">
        {/* Status Filter */}
        <Popover>
          {({ open, setOpen, triggerRef, contentRef }) => (
            <>
              <PopoverTrigger
                open={open}
                setOpen={setOpen}
                triggerRef={triggerRef}
              >
                <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                  {t("filter.status")}: {currentOfferStatus}
                </span>
              </PopoverTrigger>
              <PopoverContent open={open} contentRef={contentRef}>
                <div className="flex flex-col gap-2 min-w-[150px]">
                  {Object.values(offerStatuses).map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setCurrentOfferStatus(status);
                        setOpen(false);
                      }}
                      className={`px-3 py-1 rounded text-left ${
                        currentOfferStatus === status
                          ? "bg-blue-100 font-semibold"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
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

        {/* Program Filter */}
        <Popover>
          {({ open, setOpen, triggerRef, contentRef }) => (
            <>
              <PopoverTrigger
                open={open}
                setOpen={setOpen}
                triggerRef={triggerRef}
              >
                <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                  {t("filter.program")}:{" "}
                  {currentProgram || t("programAll")}
                </span>
              </PopoverTrigger>
              <PopoverContent open={open} contentRef={contentRef}>
                <div className="flex flex-col gap-2 min-w-[150px]">
                  <button
                    onClick={() => {
                      setCurrentProgram(null);
                      setOpen(false);
                    }}
                    className={`px-3 py-1 rounded text-left ${
                      !currentProgram
                        ? "bg-blue-100 font-semibold"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {t("programAll")}
                  </button>
                  {programs.map((program) => (
                    <button
                      key={program}
                      onClick={() => {
                        setCurrentProgram(program);
                        setOpen(false);
                      }}
                      className={`px-3 py-1 rounded text-left ${
                        currentProgram === program
                          ? "bg-blue-100 font-semibold"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {program}
                    </button>
                  ))}
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

        {/* Session and Year Filters */}
        <div className="ml-auto flex items-center gap-4">
          {/* Session Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">
              {t("filter.session")}:
            </label>
            <select
              className="rounded border border-zinc-300 p-1"
              value={currentSession}
              onChange={(e) => setCurrentSession(e.target.value)}
            >
              <option value="All">{t("session.all")}</option>
              <option value="Automne">{t("session.autumn")}</option>
              <option value="Hiver">{t("session.winter")}</option>
            </select>
          </div>

          {/* Year Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">
              {t("filter.year")}:
            </label>
            <select
              className="rounded border border-zinc-300 p-1"
              value={currentYear}
              onChange={(e) => setCurrentYear(e.target.value)}
            >
              <option value="All">{t("session.year")}</option>
              {availableYears.map((year) => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <p>{t("table.loading")}</p>
      ) : (
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

