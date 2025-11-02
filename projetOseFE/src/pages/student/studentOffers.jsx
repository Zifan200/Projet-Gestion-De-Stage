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
import { EyeOpenIcon, DownloadIcon } from "@radix-ui/react-icons";

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

  // Filter offers by session, year, and exclude already applied offers
  const filteredOffers = useMemo(() => {
    let filtered = offers;

    // Filter by session
    if (filterSession && filterSession !== "All") {
      filtered = filtered.filter((offer) => offer.session === filterSession);
    }

    // Filter by year
    if (filterYear && filterYear !== "All") {
      filtered = filtered.filter(
        (offer) =>
          offer.startDate &&
          new Date(offer.startDate).getFullYear().toString() === filterYear
      );
    }

    // Exclude offers already applied to
    filtered = filtered.filter(
      (offer) => !applications.find((a) => a.internshipOfferId === offer.id)
    );

    return filtered;
  }, [offers, filterSession, filterYear, applications]);

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

      {/* Session and Year Filters */}
      <div className="flex items-center justify-end gap-4">
        {/* Session Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">{t("filter.session")}:</label>
          <select
            className="rounded border border-zinc-300 p-1"
            value={filterSession}
            onChange={(e) => setFilterSession(e.target.value)}
          >
            <option value="All">{t("session.all")}</option>
            <option value="Automne">{t("session.autumn")}</option>
            <option value="Hiver">{t("session.winter")}</option>
          </select>
        </div>

        {/* Year Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">{t("filter.year")}:</label>
          <select
            className="rounded border border-zinc-300 p-1"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
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

      <DataTable columns={columns} data={tableData} onAction={handleAction} />

      {/* Modal */}
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

            {/* CV Select */}
            <div className="mt-4">
              <label className="block mb-1 font-semibold">
                {t("modal.selectCv")}
              </label>
              <select
                className="w-full border rounded px-2 py-1"
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

            <div className="mt-6 flex justify-between">
              <button
                className={`px-4 py-2 rounded text-white ${
                  selectedCv
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
                onClick={handleApply}
                disabled={!selectedCv}
              >
                {t("modal.apply")}
              </button>

              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedOffer(null);
                  setSelectedCv(null);
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
