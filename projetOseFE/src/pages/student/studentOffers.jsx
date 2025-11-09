import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useAuthStore from "../../stores/authStore.js";
import { useOfferStore } from "../../stores/offerStore.js";
import { useCvStore } from "../../stores/cvStore.js";
import { useStudentStore } from "../../stores/studentStore.js";
import { toast } from "sonner";
import { DataTable } from "../../components/ui/data-table.jsx";
import { Header } from "../../components/ui/header.jsx";
import { Modal } from "../../components/ui/modal.jsx";
import { EyeOpenIcon, DownloadIcon } from "@radix-ui/react-icons";
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "../../components/ui/popover.jsx";

export const StudentOffers = () => {
  const { t } = useTranslation("student_dashboard_offers");
  const navigate = useNavigate();

  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterSession, setFilterSession] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
  const [selectedCv, setSelectedCv] = useState(null);

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { offers, loadOffersSummary, viewOffer, downloadOfferPdf } =
    useOfferStore();
  const { cvs, loadCvs, applyCvStore } = useCvStore();
  const { applications, loadAllApplications } = useStudentStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/");
    } else if (user.role === "STUDENT") {
      loadOffersSummary();
      loadCvs();
      loadAllApplications();
    }
  }, [isAuthenticated, user, navigate, loadOffersSummary, loadCvs, loadAllApplications]);

  if (!isAuthenticated || !user) return null;

  const handleViewOffer = async (offerId) => {
    try {
      await viewOffer(user.token, offerId);
      const { selectedOffer, isModalOpen } = useOfferStore.getState();
      setSelectedOffer(selectedOffer);
      setIsModalOpen(isModalOpen);
    } catch (error) {
      toast.error(t("errors.viewOffer"));
    }
  };

  const handleDownload = async (offerId) => {
    try {
      await downloadOfferPdf(user.token, offerId);
      toast.success(t("actions.download"));
    } catch {
      toast.error(t("errors.viewOffer"));
    }
  };

  const handleApply = async () => {
    if (!selectedCv) {
      toast.warning(t("errors.selectCv"));
      return;
    }
    try {
      await applyCvStore(selectedOffer.id, selectedCv.id);
      toast.success(t("success.applyOffer"));
      setIsModalOpen(false);
      setSelectedOffer(null);
      setSelectedCv(null);
      loadAllApplications();
    } catch {
      toast.error(t("errors.applyOffer"));
    }
  };

  const currentYear = new Date().getFullYear().toString();

  const filteredOffers = useMemo(() => {
    return offers
        .filter((offer) => offer.session?.toLowerCase() === "hiver") // session Hiver
        .filter(
            (offer) =>
                offer.startDate &&
                new Date(offer.startDate).getFullYear().toString() === currentYear // année actuelle
        )
        .filter(
            (offer) => !applications.find((a) => a.internshipOfferId === offer.id) // exclure offres déjà appliquées
        );
  }, [offers, applications]);


  // Extract available years
  const availableYears = useMemo(() => {
    const years = new Set();
    offers.forEach((offer) => {
      if (offer.startDate) years.add(new Date(offer.startDate).getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [offers]);

  const handleAction = (action, offer) => {
    if (action === "view") {
      handleViewOffer(offer.id);
    } else if (action === "download") {
      handleDownload(offer.id);
    }
  };

  const columns = [
    { key: "title", label: t("table.title") },
    { key: "enterpriseName", label: t("table.company") },
    { key: "expirationDate", label: t("table.deadline") },
    {
      key: "actions",
      label: t("table.action"),
      actions: [
        {
          key: "view",
          label: (
            <>
              <EyeOpenIcon className="w-4 h-4" />
              <span>{t("actions.apply")}</span>
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

  const tableData = filteredOffers.map((offer) => ({
    ...offer,
    expirationDate: offer.expirationDate
      ? new Date(offer.expirationDate).toLocaleDateString()
      : "-",
  }));

  return (
    <div className="space-y-6">
      <Header title={t("title")} />

     {/*  Session et Year Filters avec popover
      <div className="flex justify-start gap-4 mb-4">
         Session Filter
        <Popover>
          {({ open, setOpen, triggerRef, contentRef }) => (
              <>
                <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
          <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
            {t("student_dashboard_offers:filter.session")}:{" "}
            {filterSession !== "All" ? filterSession : t("student_dashboard_offers:session.all")}
          </span>
                </PopoverTrigger>
                <PopoverContent open={open} contentRef={contentRef}>
                  <div className="flex flex-col gap-2 min-w-[150px]">
                    {["Automne", "Hiver"].map((session) => (
                        <button
                            key={session}
                            onClick={() => { setFilterSession(session); setOpen(false); }}
                            className={`px-3 py-1 rounded text-left ${filterSession === session ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`}
                        >
                          {session}
                        </button>
                    ))}
                    <button
                        onClick={() => { setFilterSession("All"); setOpen(false); }}
                        className="px-3 py-1 rounded text-left hover:bg-gray-100"
                    >
                      {t("student_dashboard_offers:session.all")}
                    </button>
                    <PopoverClose setOpen={setOpen}>
                      <span className="text-sm text-gray-600">{t("menu.close")}</span>
                    </PopoverClose>
                  </div>
                </PopoverContent>
              </>
          )}
        </Popover>*/}

        {/* Year Filter
        <Popover>
          {({ open, setOpen, triggerRef, contentRef }) => (
              <>
                <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
          <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
            {t("student_dashboard_offers:filter.year")}:{" "}
            {filterYear !== "All" ? filterYear : t("student_dashboard_offers:session.year")}
          </span>
                </PopoverTrigger>
                <PopoverContent open={open} contentRef={contentRef}>
                  <div className="flex flex-col gap-2 min-w-[150px]">
                    {availableYears.map((year) => (
                        <button
                            key={year}
                            onClick={() => { setFilterYear(year.toString()); setOpen(false); }}
                            className={`px-3 py-1 rounded text-left ${filterYear === year.toString() ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`}
                        >
                          {year}
                        </button>
                    ))}
                    <button
                        onClick={() => { setFilterYear("All"); setOpen(false); }}
                        className="px-3 py-1 rounded text-left hover:bg-gray-100"
                    >
                      {t("student_dashboard_offers:session.year")}
                    </button>
                    <PopoverClose setOpen={setOpen}>
                      <span className="text-sm text-gray-600">{t("menu.close")}</span>
                    </PopoverClose>
                  </div>
                </PopoverContent>
              </>
          )}
        </Popover>*/}
      {/*</div>*/}



      <DataTable columns={columns} data={tableData} onAction={handleAction} />

      {/* Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOffer(null);
          setSelectedCv(null);
        }}
        title={selectedOffer?.title}
        size="default"
        footer={
          <>
            <button
              onClick={() => {
                setIsModalOpen(false);
                setSelectedOffer(null);
                setSelectedCv(null);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              <span>{t("modal.close")}</span>
            </button>
            <button
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCv
                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              onClick={handleApply}
              disabled={!selectedCv}
            >
              <span>{t("modal.apply")}</span>
            </button>
          </>
        }
      >
        {selectedOffer && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.companyEmail")}</h3>
                <p className="text-gray-600">{selectedOffer.employerEmail}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.targetedProgramme")}</h3>
                <p className="text-gray-600">{selectedOffer.targetedProgramme}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.publishedDate")}</h3>
                <p className="text-gray-600">
                  {selectedOffer.publishedDate
                    ? new Date(selectedOffer.publishedDate).toLocaleDateString()
                    : "-"}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.deadline")}</h3>
                <p className="text-gray-600">
                  {selectedOffer.expirationDate
                    ? new Date(selectedOffer.expirationDate).toLocaleDateString()
                    : "-"}
                </p>
              </div>
            </div>

            {selectedOffer.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.description")}</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{selectedOffer.description}</p>
              </div>
            )}

            {/* CV Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("modal.selectCv")}
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={selectedCv?.id || ""}
                onChange={(e) =>
                  setSelectedCv(
                    cvs.find((cv) => cv.id.toString() === e.target.value),
                  )
                }
              >
                <option value="">-- {t("modal.chooseCv")} --</option>
                {cvs
                  .filter((cv) => cv.status === "ACCEPTED")
                  .map((cv) => (
                    <option key={cv.id} value={cv.id}>
                      {cv.name || cv.fileName}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};