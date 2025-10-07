import {useTranslation} from "react-i18next";
import {Table} from "../../components/ui/table.jsx";
import {Header} from "../../components/ui/header.jsx";
import React, {useEffect, useState} from "react";
import {useOfferStore} from "../../stores/offerStore.js";
import useAuthStore from "../../stores/authStore.js";

const offerStatuses = [
    "STATUS",
    "PENDING",
    "ACCEPTED",
    "REJECTED"
];

export const AllOffers = () => {
    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);

    const [ currentOffers, setCurrentOffers ] = useState([]);
    const [ currentOfferStatus, setCurrentOfferStatus ] = useState("STATUS");
    const [ currentProgram, setCurrentProgram ] = useState("All programs");

    const {
        offers, loadAllOffers,
        acceptedOffers, loadAcceptedOffers,
        rejectedOffers, loadRejectedOffers,
        pendingOffers, loadPendingOffers,
        offersByProgram,
        loadOffersByProgram,
        programs, loadPrograms,
        loading
    } = useOfferStore();

    useEffect(() => {
        loadPrograms();
        loadAllOffers();
        loadPendingOffers();
        loadAcceptedOffers();
        loadRejectedOffers();
    }, []);


    useEffect(() => {
        handleOfferStatusChange()
    }, [currentOfferStatus]);


    useEffect(() => {
        handleProgramNameOnChange();
    }, [currentProgram]);

    const handleProgramNameOnChange = async () => {
        console.log("currentProgram", currentProgram);

        if (currentProgram !== "All programs") {
            const res = await fetch(`http://localhost:8080/api/v1/internship-offers/filter-by-program?program=${currentProgram}`, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                }
            });
            const data = await res.json();
            setCurrentOffers(data);

            console.log("offersByProgram", offersByProgram);
        }
        else {
            await loadAllOffers();
            setCurrentOffers(offers);
        }
    };


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
            {/* Programmes */}
            <select
                value={currentProgram}
                onChange={(e) => setCurrentProgram(e.target.value)}
            >
                <option value="All programs">All programs</option>
                {
                    programs.map((programName) => (
                        <option key={programName} value={programName}>
                            {programName}
                        </option>
                    ))
                }
            </select>

            {/* Statuts */}
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

            {
                loading ? <p>Chargement...</p> :
                    <>
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
                    </>
            }
        </div>
    );
}