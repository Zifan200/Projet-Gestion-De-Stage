import {useTranslation} from "react-i18next";
import {Table} from "../../components/ui/table.jsx";
import {Header} from "../../components/ui/header.jsx";
import React, {useEffect, useState} from "react";
import useAuthStore from "../../stores/authStore.js";
import {useOfferStore} from "../../stores/offerStore.js";
import {useNavigate} from "react-router";

const offerStatuses = [
  "STATUS",
  "PENDING",
  "ACCEPTED",
  "REJECTED"
];

export const AllOffers = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const [ currentOffers, setCurrentOffers ] = useState([]);
    const [ currentOfferStatus, setCurrentOfferStatus ] = useState("STATUS");
    const {
        offers, loadAllOffers,
        acceptedOffers, loadAcceptedOffers,
        rejectedOffers, loadRejectedOffers,
        pendingOffers, loadPendingOffers,
        loading
    } = useOfferStore();

    useEffect(() => {
        loadAllOffers();
        loadPendingOffers();
        loadAcceptedOffers();
        loadRejectedOffers();
    }, []);

    useEffect(() => {
        handleOfferStatusChange()
    }, [currentOffers, currentOfferStatus]);

    const handleOfferStatusChange = () => {
        switch (currentOfferStatus) {
            case "PENDING":
                loadPendingOffers();
                setCurrentOffers(pendingOffers);
                break;
            case "ACCEPTED":
                loadAcceptedOffers();
                setCurrentOffers(acceptedOffers);
                break;
            case "REJECTED":
                loadRejectedOffers();
                setCurrentOffers(rejectedOffers);
                break;
            case "STATUS":
                loadAllOffers();
                setCurrentOffers(offers);
                break;
        }
    };

    return (
        <div className="space-y-6">
            <select
                value={currentOfferStatus}
                onChange={(e) => setCurrentOfferStatus(e.target.value)}
            >
                {
                    offerStatuses.map((offerStatus) => (
                        <option key={offerStatus} value={offerStatus}>
                            {offerStatus}
                        </option>
                    ))
                }
            </select>

            <Header
                title={t("menu.allOffers")}
            />
            <Table
                headers={[
                    t("offer.table.offerTitle"),
                    t("offer.table.enterprise"),
                    t("offer.table.deadline"),
                ]}
                rows={
                    currentOffers.map((offer) => (
                        <tr key={offer.id} className="border-t border-gray-300">
                            <td className="px-4 py-2">{offer.title}</td>
                            <td className="px-4 py-2">{offer.enterpriseName}</td>
                            <td className="px-4 py-2">
                                {new Date(offer.expirationDate).toLocaleDateString()}
                            </td>
                        </tr>
                    ))
                }
                emptyMessage={t("offer.table.noOffers")}
            />
        </div>
    );
}