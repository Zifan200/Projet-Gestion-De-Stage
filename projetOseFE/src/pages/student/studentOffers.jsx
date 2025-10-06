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
    const [filter, setFilter] = useState("all");
    const [filteredOffers, setFilteredOffers] = useState([]);

    useEffect(() => {
        if (!isAuthenticated || !user) {
            navigate("/");
        } else {
            loadOffersSummary();
        }
    }, [isAuthenticated, user, navigate, loadOffersSummary]);

    // Filtrer les offres
    useEffect(() => {
        if (filter === "all") {
            setFilteredOffers(offers);
        } else if (filter === "expired") {
            setFilteredOffers(offers.filter(o => new Date(o.expirationDate) < new Date()));
        } else if (filter === "active") {
            setFilteredOffers(offers.filter(o => new Date(o.expirationDate) >= new Date()));
        }
    }, [offers, filter]);

    if (!isAuthenticated || !user) return null;

    const handleViewOffer = async (offerId) => {
        try {
            await viewOffer(user.token, offerId);
            const { selectedOffer, isModalOpen } = useOfferStore.getState()
            setSelectedOffer(selectedOffer);
            setIsModalOpen(isModalOpen);
        } catch (error) {
            console.error(error);
            alert("Impossible de récupérer l'offre");
        }
    };


    return (
        <div className="p-10">
            {/* Titre et dropdown */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{t("studentOffers.title")}</h2>
                <div>
                    <label className="mr-2 font-medium">{t("studentOffers.filterLabel") || "Filter:"}</label>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="border rounded px-2 py-1"
                    >
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="expired">Expired</option>
                    </select>
                </div>
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
                        {filteredOffers.length > 0 ? (
                            filteredOffers.map((offer) => (
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
                        <button
                            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            onClick={() => { setIsModalOpen(false); setSelectedOffer(null); }}
                        >
                            {t("studentOffers.modal.close")}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
