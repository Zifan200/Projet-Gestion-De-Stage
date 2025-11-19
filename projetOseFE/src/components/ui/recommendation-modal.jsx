import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "./modal.jsx";
import { useRecommendationStore } from "../../stores/recommendationStore.js";
import { useOfferStore } from "../../stores/offerStore.js";
import useAuthStore from "../../stores/authStore.js";
import { toast } from "sonner";

export const RecommendationModal = ({ open, onClose, student, onSuccess }) => {
  const { t } = useTranslation("gs_dashboard_recommendations");
  const { token } = useAuthStore();
  const { createOrUpdateRecommendation, deleteRecommendation, loading } = useRecommendationStore();
  const { offers, loadOffersSummary } = useOfferStore();
  const [selectedRecommendations, setSelectedRecommendations] = useState({});

  useEffect(() => {
    if (open && token) {
      loadOffersSummary(token);
    }
  }, [open, token]);

  // Filter offers to match what the student can see
  const currentYear = (new Date().getFullYear() + 1).toString();

  // Temporarily disable program filter for debugging
  const filteredOffers = offers
    .filter((offer) => {
      // Only filter by session if offer has a session
      if (!offer.session) return true;
      return offer.session.toLowerCase() === "hiver";
    })
    .filter((offer) => {
      // Only filter by year if offer has a startDate
      if (!offer.startDate) return true;
      const offerYear = new Date(offer.startDate).getFullYear().toString();
      console.log(`Offer ${offer.id} year: ${offerYear}, current year: ${currentYear}`);
      return offerYear === currentYear;
    });
    // Removed program filter temporarily

  // Debug: log filtering results
  console.log('Total offers:', offers.length);
  console.log('Filtered offers:', filteredOffers.length);
  console.log('Student program:', student?.program);
  console.log('Current year:', currentYear);
  console.log('Offers:', offers);

  useEffect(() => {
    if (open && student?.existingRecommendations) {
      // Pré-remplir avec les recommandations existantes
      const existing = {};
      student.existingRecommendations.forEach(rec => {
        existing[rec.offerId] = {
          checked: true,
          priorityCode: rec.priorityCode,
          id: rec.id
        };
      });
      setSelectedRecommendations(existing);
    } else if (!open) {
      setSelectedRecommendations({});
    }
  }, [open, student]);

  const handleToggleOffer = (offerId) => {
    setSelectedRecommendations(prev => ({
      ...prev,
      [offerId]: {
        checked: !prev[offerId]?.checked,
        priorityCode: prev[offerId]?.priorityCode || "",
        id: prev[offerId]?.id
      }
    }));
  };

  const handlePriorityChange = (offerId, priorityCode) => {
    setSelectedRecommendations(prev => ({
      ...prev,
      [offerId]: {
        ...prev[offerId],
        priorityCode
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      // Traiter toutes les recommandations
      for (const [offerId, data] of Object.entries(selectedRecommendations)) {
        if (data.checked && data.priorityCode) {
          // Créer ou mettre à jour
          await createOrUpdateRecommendation(token, {
            studentId: student.id,
            offerId: parseInt(offerId),
            priorityCode: data.priorityCode,
          });
        } else if (!data.checked && data.id) {
          // Supprimer si décochée et existait
          await deleteRecommendation(token, data.id);
        }
      }

      toast.success(t("toast.recommendationsUpdated"));
      onSuccess?.();
      onClose();
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error(t("toast.maxGoldRecommendations"));
      } else {
        toast.error(t("toast.recommendationError"));
      }
    }
  };

  const footer = (
    <>
      <button
        onClick={onClose}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
        disabled={loading}
      >
        {t("modal.cancel")}
      </button>
      <button
        onClick={handleSubmit}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? t("modal.saving") : t("modal.save")}
      </button>
    </>
  );

  if (!student) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("modal.title")}
      footer={footer}
      size="lg"
    >
      <div className="space-y-4">
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">
            {t("modal.student")}: <span className="font-semibold">{student.firstName} {student.lastName}</span>
          </p>
          <p className="text-sm text-gray-600">
            {t("modal.email")}: {student.email}
          </p>
          {student.program && (
            <p className="text-sm text-gray-600">
              {t("modal.program")}: {student.program}
            </p>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-blue-800 text-sm">
            {t("info.maxGold")}
          </p>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t("modal.selectOffers")}
          </label>

          {filteredOffers.length === 0 ? (
            <p className="text-gray-500 text-sm">{t("modal.noOffers")}</p>
          ) : (
            filteredOffers.map((offer) => (
              <div key={offer.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedRecommendations[offer.id]?.checked || false}
                    onChange={() => handleToggleOffer(offer.id)}
                    className="mt-1"
                    disabled={loading}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">
                      {offer.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {offer.targetedProgramme}
                    </div>

                    {selectedRecommendations[offer.id]?.checked && (
                      <div className="mt-2 flex gap-2">
                        {["BRONZE", "SILVER", "GOLD"].map((priority) => (
                          <label
                            key={priority}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                              selectedRecommendations[offer.id]?.priorityCode === priority
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`priority-${offer.id}`}
                              value={priority}
                              checked={selectedRecommendations[offer.id]?.priorityCode === priority}
                              onChange={(e) => handlePriorityChange(offer.id, e.target.value)}
                              className="sr-only"
                              disabled={loading}
                            />
                            {t(`priority.${priority.toLowerCase()}.badge`)}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </label>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
