import {useTranslation} from "react-i18next";
import {Table} from "../../components/ui/table.jsx";
import {Header} from "../../components/ui/header.jsx";
import React, {useEffect, useState} from "react";
import {authService} from "../../services/authService.js";
import {offerService} from "../../services/offerService.js";

const offerStatuses = [
  "PENDING",
  "ACCEPTED",
  "REFUSED"
];

export const AllOffers = () => {
    const { t } = useTranslation();
    const [user, setUser] = useState(null);
    const [allOffers, setAllOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const token = localStorage.getItem("token");
                if (token)
                    setUser(authService.getMe(token));
                await loadInternshipOffers();
            } catch (err) {
                console.error(err);
            }
        }
        fetchData();
    }, []);

    const loadInternshipOffers = async () => {
        setLoading(true);
        setAllOffers(await offerService.getAllOffers());
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <select>
                <option>All statuses</option>
                {
                    offerStatuses.map((offerStatus) => (
                        <option key={offerStatus}>{offerStatus}</option>
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
                    allOffers.map((offer) => (
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