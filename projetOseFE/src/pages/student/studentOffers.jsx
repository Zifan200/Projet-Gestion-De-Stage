import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import useAuthStore from "../../stores/authStore.js";
import { useOfferStore } from "../../stores/offerStore.js";

export const StudentOffers = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const user = useAuthStore((s) => s.user);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const { offers, loading, loadOffers, applyToOffer } = useOfferStore();

    useEffect(() => {
        if (!isAuthenticated || !user) {
            navigate("/");
        } else {
            loadOffers(); // récupère les offres via l'API
        }
    }, [isAuthenticated, user, navigate, loadOffers]);

    const handleApply = async (offerId) => {
        try {
            await applyToOffer(offerId);
            toast.success(t("studentOffers.success.applyOffer"));
        } catch {
            toast.error(t("studentOffers.errors.applyOffer"));
        }
    };

    if (!isAuthenticated || !user) return null;

    return (
        <div className="p-10">
            <h2 className="text-xl font-semibold mb-4">{t("studentOffers.title")}</h2>
            {loading ? (
                <p>{t("studentOffers.loading")}</p>
            ) : (
                <div className="overflow-x-auto bg-white shadow rounded">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-[#F9FBFC] text-gray-600 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3">{t("studentOffers.table.title")}</th>
                            <th className="px-4 py-3">{t("studentOffers.table.company")}</th>
                            <th className="px-4 py-3">{t("studentOffers.table.actions")}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {offers.map((offer) => (
                            <tr key={offer.id} className="border-t border-zinc-300 text-zinc-700">
                                <td className="px-4 py-2">{offer.title}</td>
                                <td className="px-4 py-2">{offer.companyName}</td>
                                <td className="px-4 py-2">
                                    <button
                                        className="px-3 py-1 bg-[#B3FE3B] rounded"
                                        onClick={() => handleApply(offer.id)}
                                    >
                                        {t("studentOffers.actions.apply")}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {offers.length === 0 && (
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
