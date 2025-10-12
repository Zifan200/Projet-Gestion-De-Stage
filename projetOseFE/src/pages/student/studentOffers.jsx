import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useAuthStore from "../../stores/authStore.js";
import { useOfferStore } from "../../stores/offerStore.js";

export const StudentOffers = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [selectedOffer, setSelectedOffer] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const user = useAuthStore((s) => s.user);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const { offers, loading, loadOffersSummary, viewOffer } = useOfferStore();

    useEffect(() => {
        if (!isAuthenticated || !user) {
            navigate("/");
        } else {
            loadOffersSummary();
        }
    }, [isAuthenticated, user, navigate, loadOffersSummary]);

    if (!isAuthenticated || !user) return null;

    const handleViewOffer = async (offerId) => {
        try {
            await viewOffer(user.token, offerId);
            const { selectedOffer, isModalOpen } = useOfferStore.getState();
            setSelectedOffer(selectedOffer);
            setIsModalOpen(isModalOpen);
        } catch (error) {
            console.error(error);
            alert("Impossible de récupérer l'offre");
        }
    };

    return (
        <div className="p-10">
            {/* Titre */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{t("studentOffers.title")}</h2>
            </div>

            {loading ? (
                <p>{t("studentOffers.loading")}</p>
            ) : (
                <div className="overflow-x-auto bg-white shadow rounded">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-[#F9FBFC] text-gray-600 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3">{t("studentOffers.table.title")}</th>
                            <th className="px-4 py-3">{t("studentOffers.table.company")}</th>
                            <th className="px-4 py-3">{t("studentOffers.table.deadline") || "Deadline"}</th>
                            <th className="px-4 py-3">{t("studentOffers.table.action") || "Action"}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {offers.length > 0 ? (
                            offers.map((offer) => (
                                <tr key={offer.id} className="border-t border-zinc-300 text-zinc-700">
                                    <td className="px-4 py-2">{offer.title}</td>
                                    <td className="px-4 py-2">{offer.enterpriseName}</td>
                                    <td className="px-4 py-2">
                                        {offer.expirationDate
                                            ? new Date(offer.expirationDate).toLocaleDateString()
                                            : "-"}
                                    </td>
                                    <td className="px-4 py-2">
                                        <button
                                            className="px-3 py-1 bg-[#B3FE3B] rounded-full font-bold hover:bg-green-400"
                                            onClick={() => handleViewOffer(offer.id)}
                                        >
                                            {t("studentOffers.actions.view") || "View"}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center py-4 text-gray-500">
                                    {t("studentOffers.noOffers")}
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && selectedOffer && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-3/4 max-w-lg">
                        <h2 className="text-xl font-semibold mb-4">{selectedOffer.title}</h2>
                        <p><strong>{t("studentOffers.modal.companyEmail")}:</strong> {selectedOffer.employerEmail}</p>
                        <p><strong>{t("studentOffers.modal.targetedProgramme")}:</strong> {selectedOffer.targetedProgramme}</p>
                        <p><strong>{t("studentOffers.modal.publishedDate")}:</strong> {selectedOffer.publishedDate ? new Date(selectedOffer.publishedDate).toLocaleDateString() : "-"}</p>
                        <p><strong>{t("studentOffers.modal.deadline")}:</strong> {selectedOffer.expirationDate ? new Date(selectedOffer.expirationDate).toLocaleDateString() : "-"}</p>
                        <p><strong>{t("studentOffers.modal.description")}:</strong> {selectedOffer.description}</p>

                        {/* Ligne des boutons */}
                        <div className="mt-6 flex justify-between">
                            <button
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                onClick={() => alert(`Postuler à l'offre : ${selectedOffer.title}`)}
                            >
                                {t("studentOffers.modal.apply")}
                            </button>

                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={() => { setIsModalOpen(false); setSelectedOffer(null); }}
                            >
                                {t("studentOffers.modal.close")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};