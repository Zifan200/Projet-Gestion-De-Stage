import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FilePlusIcon, ClipboardIcon } from "@radix-ui/react-icons";
import { Button } from "../../components/ui/button.jsx";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import useAuthStore from "../../stores/authStore.js";
import { useOfferStore } from "../../stores/offerStore.js";

export const DashboardEmployer = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const {
    offers,
    loading,
    loadOffers,
    createOffer,
    deleteOffer,
    acceptCandidate,
    error,
  } = useOfferStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/");
    } else {
      loadOffers();
    }
  }, [isAuthenticated, user, navigate]);

  const handleCreateOffer = async () => {
    try {
      const newOffer = {
        title: "New Internship",
        description: "Write a description here",
        date: new Date().toISOString(),
      };
      await createOffer(newOffer);
      toast.success(t("employerDashboard.success.createOffer"));
    } catch {
      toast.error(t("employerDashboard.errors.createOffer"));
    }
  };

  const handleDeleteOffer = async (offerId) => {
    try {
      await deleteOffer(offerId);
      toast.success(t("employerDashboard.success.deleteOffer"));
    } catch {
      toast.error(t("employerDashboard.errors.deleteOffer"));
    }
  };

  const handleAcceptCandidate = async (offerId, candidateId) => {
    try {
      await acceptCandidate(offerId, candidateId);
      toast.success(t("employerDashboard.success.acceptCandidate"));
    } catch {
      toast.error(t("employerDashboard.errors.acceptCandidate"));
    }
  };

  if (!isAuthenticated || !user) return null;

  return (
    <div className="h-[100vh]">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="bg-[#000]/3 pt-10 pl-10 pr-10">
          <h1 className="text-5xl">{t("employerDashboard.title")}</h1>
          <h3 className="text-xl mt-10 uppercase">
            {t("employerDashboard.menu")}
          </h3>
          <div className="mt-2">
            <div className="bg-zinc-200 p-2 flex border-zinc-300 border rounded-xl mt-5 cursor-pointer">
              <FilePlusIcon className="w-5 h-5 mr-2 my-auto" />
              {t("employerDashboard.addOffer")}
            </div>
            <div className="bg-zinc-200 p-2 flex border-zinc-300 border rounded-xl mt-5 cursor-pointer">
              <ClipboardIcon className="w-5 h-5 mr-2 my-auto" />
              {t("employerDashboard.manageOffers")}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="ml-auto mr-auto pt-10 w-full pr-30 pl-30">
          <div className="flex flex-row items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {t("employerDashboard.myOffers")}
            </h2>
            <Button
              className="bg-[#B3FE3B] text-black shadow-lg border border-zinc-300 rounded-xl"
              onClick={handleCreateOffer}
            >
              {t("employerDashboard.createOffer")}
            </Button>
          </div>

          <div className="w-full h-[1px] bg-zinc-300 mb-10 mt-10 rounded-full"></div>

          {loading ? (
            <p>{t("loading")}</p>
          ) : (
            <div className="overflow-x-auto bg-white shadow rounded">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-[#F9FBFC] text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">
                      {t("employerDashboard.table.title")}
                    </th>
                    <th className="px-4 py-3">
                      {t("employerDashboard.table.description")}
                    </th>
                    <th className="px-4 py-3">
                      {t("employerDashboard.table.date")}
                    </th>
                    <th className="px-4 py-3">
                      {t("employerDashboard.table.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((offer) => (
                    <tr
                      key={offer.id}
                      className="border-t border-zinc-300 text-zinc-700"
                    >
                      <td className="px-4 py-2">{offer.title}</td>
                      <td className="px-4 py-2">{offer.description}</td>
                      <td className="px-4 py-2">
                        {new Date(offer.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 space-x-2 flex">
                        <Button
                          className="pt-[5px] pb-[5px] pl-1 pr-1 bg-green-400"
                          onClick={() =>
                            handleAcceptCandidate(offer.id, "candidate-id")
                          }
                        >
                          {t("employerDashboard.actions.accept")}
                        </Button>
                        <Button
                          className="pt-[5px] pb-[5px] pl-1 pr-1 bg-red-400"
                          onClick={() => handleDeleteOffer(offer.id)}
                        >
                          {t("employerDashboard.actions.delete")}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {offers.length === 0 && (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center py-4 text-gray-500"
                      >
                        {t("employerDashboard.noOffers")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
