import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "../../components/ui/header.jsx";
import { DataTable } from "../../components/ui/data-table.jsx";
import { Modal } from "../../components/ui/modal.jsx";
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

export const OfferList = () => {
  const { t } = useTranslation("employer_dashboard_offers");
  const user = useAuthStore((s) => s.user);
  const { offers, loadOffers, downloadOfferPdf } = useOfferStore();
  const navigate = useNavigate();

  const [filterStatus, setFilterStatus] = useState(null);
  const [sortKey, setSortKey] = useState("date");
  const [filterSession, setFilterSession] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
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

  const availableYears = useMemo(() => {
    const years = new Set();
    offers.forEach((offer) => {
      if (offer.startDate) {
        const year = new Date(offer.startDate).getFullYear();
        years.add(year);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [offers]);

  const sortedAndFilteredOffers = useMemo(() => {
    let filtered = offers;

    if (filterStatus) filtered = filtered.filter((o) => o.status === filterStatus);
    if (filterSession !== "All")
      filtered = filtered.filter(
          (o) => o.session?.toLowerCase() === filterSession.toLowerCase()
      );
    if (filterYear !== "All") filtered = filtered.filter(
        (o) => o.startDate && new Date(o.startDate).getFullYear().toString() === filterYear
    );

    return [...filtered].sort((a, b) => {
      if (sortKey === "date") return new Date(b.expirationDate) - new Date(a.expirationDate);
      if (sortKey === "applications") return (b.applicationCount || 0) - (a.applicationCount || 0);
      return 0;
    });
  }, [offers, filterStatus, filterSession, filterYear, sortKey]);

  const columns = [
    { key: "title", label: t("table.offerTitle") },
    { key: "enterpriseName", label: t("table.enterprise") },
    { key: "targetedProgramme", label: t("table.program") },
    { key: "expirationDate", label: t("table.deadline") },
    {
      key: "status",
      label: t("table.status"),
      format: (status) => t(`status.${status?.toLowerCase()}`)
    },
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
          {/* Filter by Status */}
          <Popover>
            {({ open, setOpen, triggerRef, contentRef }) => (
                <>
                  <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
                <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                  {t("filter.status")}:{" "}
                  {filterStatus ? t(`status.${filterStatus.toLowerCase()}`) : t("filter.all")}
                </span>
                  </PopoverTrigger>
                  <PopoverContent open={open} contentRef={contentRef}>
                    <div className="flex flex-col gap-2 min-w-[150px]">
                      {["ACCEPTED", "REJECTED", "PENDING"].map((status) => (
                          <button
                              key={status}
                              onClick={() => { setFilterStatus(status); setOpen(false); }}
                              className={`px-3 py-1 rounded text-left ${filterStatus === status ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`}
                          >
                            {t(`status.${status.toLowerCase()}`)}
                          </button>
                      ))}
                      <button onClick={() => { setFilterStatus(null); setOpen(false); }} className="px-3 py-1 rounded text-left hover:bg-gray-100">
                        {t("filter.all")}
                      </button>
                      <PopoverClose setOpen={setOpen}>
                        <span className="text-sm text-gray-600">{t("menu.close")}</span>
                      </PopoverClose>
                    </div>
                  </PopoverContent>
                </>
            )}
          </Popover>

          {/* Sort */}
          <Popover>
            {({ open, setOpen, triggerRef, contentRef }) => (
                <>
                  <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
                <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                  {t("sort.by")}: {sortKey === "date" ? t("sort.date") : t("sort.applications")}
                </span>
                  </PopoverTrigger>
                  <PopoverContent open={open} contentRef={contentRef}>
                    <div className="flex flex-col gap-2 min-w-[150px]">
                      <button onClick={() => { setSortKey("date"); setOpen(false); }} className={`px-3 py-1 rounded text-left ${sortKey === "date" ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`}>
                        {t("sort.date")}
                      </button>
                      <button onClick={() => { setSortKey("applications"); setOpen(false); }} className={`px-3 py-1 rounded text-left ${sortKey === "applications" ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`}>
                        {t("sort.applications")}
                      </button>
                      <PopoverClose setOpen={setOpen}>
                        <span className="text-sm text-gray-600">{t("menu.close")}</span>
                      </PopoverClose>
                    </div>
                  </PopoverContent>
                </>
            )}
          </Popover>

          {/* Session Filter */}
          <Popover>
            {({ open, setOpen, triggerRef, contentRef }) => (
                <>
                  <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
                <span
                    className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
  {t("filter.session")}: {filterSession === "All" ? t("session.all") : t(`session.${filterSession.toLowerCase()}`)}
</span>
                  </PopoverTrigger>
                  <PopoverContent open={open} contentRef={contentRef}>
                    <div className="flex flex-col gap-2 min-w-[150px]">{["automne", "hiver"].map((session) => (
                        <button
                            key={session}
                            onClick={() => { setFilterSession(session); setOpen(false); }}
                            className={`px-3 py-1 rounded text-left ${filterSession === session ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`}
                        >
                          {t(`session.${session.toLowerCase()}`)} {/* <-- ici la traduction */}
                        </button>
                    ))}
                      <button onClick={() => { setFilterSession("All"); setOpen(false); }} className="px-3 py-1 rounded text-left hover:bg-gray-100">
                        {t("session.all")}
                      </button>
                      <PopoverClose setOpen={setOpen}>
                        <span className="text-sm text-gray-600">{t("menu.close")}</span>
                      </PopoverClose>
                    </div>
                  </PopoverContent>
                </>
            )}
          </Popover>

          {/* Year Filter */}
          <Popover>
            {({ open, setOpen, triggerRef, contentRef }) => (
                <>
                  <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
                <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                  {t("filter.year")}: {filterYear === "All" ? t("session.AllYears") : filterYear}
                </span>
                  </PopoverTrigger>
                  <PopoverContent open={open} contentRef={contentRef}>
                    <div className="flex flex-col gap-2 min-w-[150px] max-h-[300px] overflow-y-auto">
                      {availableYears.map((year) => (
                          <button
                              key={year}
                              onClick={() => { setFilterYear(year.toString()); setOpen(false); }}
                              className={`px-3 py-1 rounded text-left ${filterYear === year.toString() ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`}
                          >
                            {year}
                          </button>
                      ))}
                      <button onClick={() => { setFilterYear("All"); setOpen(false); }} className="px-3 py-1 rounded text-left hover:bg-gray-100">
                        {t("session.AllYears")}
                      </button>
                      <PopoverClose setOpen={setOpen}>
                        <span className="text-sm text-gray-600">{t("menu.close")}</span>
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
            size="default"
            footer={
              <button
                onClick={() => setSelectedOffer(null)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <span>{t("actions.close")}</span>
              </button>
            }
        >
          {selectedOffer && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("table.enterprise")}</h3>
                    <p className="text-gray-600">{selectedOffer.enterpriseName}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("table.program")}</h3>
                    <p className="text-gray-600">{selectedOffer.targetedProgramme}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("table.deadline")}</h3>
                    <p className="text-gray-600">{new Date(selectedOffer.expirationDate).toLocaleDateString()}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("table.status")}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        selectedOffer.status === "ACCEPTED" ? "bg-green-100 text-green-800" :
                            selectedOffer.status === "REJECTED" ? "bg-red-100 text-red-800" :
                                "bg-yellow-100 text-yellow-800"
                    }`}>
                    {t(`status.${selectedOffer.status?.toLowerCase()}`)}
                  </span>
                  </div>
                </div>

                {selectedOffer.reason?.trim() && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("table.reason")}</h3>
                      <p className="text-gray-600 whitespace-pre-wrap">{selectedOffer.reason}</p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {selectedOffer.description && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("table.description")}</h3>
                        <p className="text-gray-600 whitespace-pre-wrap">{selectedOffer.description}</p>
                      </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.salary")}</h3>
                    <p className="text-gray-600">
                      { localStorage.key("lang") === "fr" ?
                        selectedOffer.salary.toLocaleString("fr-CA", {style: "currency", currency: "CAD"}) :
                        selectedOffer.salary.toLocaleString("en-CA", {style: "currency", currency: "CAD"})
                      }
                    </p>
                  </div>
                </div>
              </div>
          )}
        </Modal>
      </div>
  );
};