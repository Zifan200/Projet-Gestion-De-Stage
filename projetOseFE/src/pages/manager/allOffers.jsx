import {useTranslation} from "react-i18next";
import {Table} from "../../components/ui/table.jsx";
import {Header} from "../../components/ui/header.jsx";
import React, {useEffect, useState} from "react";
import {authService} from "../../services/authService.js";
import {offerService} from "../../services/offerService.js";

const offerStatuses = [
  "STATUS",
  "PENDING",
  "ACCEPTED",
  "REJECTED"
];

export const AllOffers = () => {
    const { t } = useTranslation();
    const [user, setUser] = useState(null);
    const [currentOffers, setCurrentOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const token = localStorage.getItem("token");
                if (token)
                    setUser(authService.getMe(token));
                await loadAllOffers();
            } catch (err) {
                console.error(err);
            }
        }
        fetchData();
    }, []);

    const loadAllOffers = async () => {
        setLoading(true);
        setCurrentOffers(await offerService.getAllOffers());
        setLoading(false);
    };

    const loadPendingOffers = async () => {
        setLoading(true);
        setCurrentOffers(await offerService.getPendingOffers());
        setLoading(false);
    };

    const loadAcceptedOffers = async () => {
        setLoading(true);
        setCurrentOffers(await offerService.getAcceptedOffers());
        setLoading(false);
    };

    const loadRejectedOffers = async () => {
        setLoading(true);
        setCurrentOffers(await offerService.getRejectedOffers());
        setLoading(false);
    };

    const handleChange = (e) => {
        console.log(e.target.value);

        switch (e.target.value) {
            case "PENDING":
                loadPendingOffers();
                break;
            case "ACCEPTED":
                loadAcceptedOffers();
                break;
            case "REJECTED":
                loadRejectedOffers();
                break;
            case "STATUS":
                loadAllOffers();
                break;
        }
    }

    return (
        <div className="space-y-6">
            <select onChange={handleChange}>
                {
                    offerStatuses.map((offerStatus) => (
                        <option
                            key={offerStatus}
                            value={offerStatus}
                        >
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