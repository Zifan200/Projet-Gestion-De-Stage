import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useAuthStore from "../../stores/authStore.js";
import { useOfferStore } from "../../stores/offerStore.js";

export const StudentOffers = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const user = useAuthStore((s) => s.user);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const { offers, loading, loadOffersSummary } = useOfferStore();
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
            console.log(offers)
            setFilteredOffers(offers);
        } else if (filter === "expired") {
            setFilteredOffers(offers.filter(o => new Date(o.expirationDate) < new Date()));
        } else if (filter === "active") {
            setFilteredOffers(offers.filter(o => new Date(o.expirationDate) >= new Date()));
        }
    }, [offers, filter]);

    if (!isAuthenticated || !user) return null;

    return (
        <div className="p-10">
            {/* Titre et dropdown sur la même ligne */}
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
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="text-center py-4 text-gray-500">
                                    {t("studentOffers.noOffers")}
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
