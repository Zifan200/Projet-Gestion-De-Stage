import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useAuthStore from "../../stores/authStore.js";
import { useOfferStore } from "../../stores/offerStore.js";
import { useCvStore } from "../../stores/cvStore.js";
import { toast } from "sonner";

export const StudentOffers = () => {
  const { t } = useTranslation("student_dashboard_offers");
  const navigate = useNavigate();

  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { offers, loadOffersSummary, viewOffer, downloadOfferPdf } =
    useOfferStore();
  const { cvs, loadCvs, applyCvStore } = useCvStore();

  const [selectedCv, setSelectedCv] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/");
    } else {
      loadOffersSummary();
      loadCvs();
    }
  }, [isAuthenticated, user, navigate, loadOffersSummary, loadCvs]);

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
    } catch {
      toast.error(t("errors.applyOffer"));
    }
  };

  return (
    <div className="p-10">
      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-[#F9FBFC] text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">{t("table.title")}</th>
              <th className="px-4 py-3">{t("table.company")}</th>
              <th className="px-4 py-3">{t("table.deadline")}</th>
              <th className="px-4 py-3">{t("table.action")}</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <tr
                key={offer.id}
                className="border-t border-zinc-300 text-zinc-700"
              >
                <td className="px-4 py-2">{offer.title}</td>
                <td className="px-4 py-2">{offer.enterpriseName}</td>
                <td className="px-4 py-2">
                  {offer.expirationDate
                    ? new Date(offer.expirationDate).toLocaleDateString()
                    : "-"}
                </td>
                <td className="px-4 py-2 flex space-x-2">
                  <button
                    className="px-3 py-1 bg-[#B3FE3B] rounded-full font-bold hover:bg-green-400"
                    onClick={() => handleViewOffer(offer.id)}
                  >
                    {t("actions.view")}
                  </button>
                  <button
                    className="px-3 py-1 bg-amber-200 hover:bg-amber-50 rounded-full font-bold"
                    onClick={() => handleDownload(offer.id)}
                  >
                    {t("actions.download")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
