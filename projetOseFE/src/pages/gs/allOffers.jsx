allOffers.jsx

import {useTranslation} from "react-i18next";
import {Table} from "../../components/ui/table.jsx";
import {Header} from "../../components/ui/header.jsx";
import React, {useEffect, useState} from "react";
import {useOfferStore} from "../../stores/offerStore.js";
import useAuthStore from "../../stores/authStore.js";
import {Button} from "../../components/ui/button.jsx";
import {toast} from "sonner";

export const AllOffers = () => {
    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const [ selectedOffer, setSelectedOffer ] = useState(null);
    const [ isModalOpen, setIsModalOpen ] = useState(false);
    const [ currentOffers, setCurrentOffers ] = useState([]);

    const offerStatuses = {
        ALL: t("offer.filter.status.all"),
        PENDING: t("offer.filter.status.pending"),
        ACCEPTED: t("offer.filter.status.accepted"),
        REJECTED: t("offer.filter.status.rejected"),
    };

    const [currentOfferStatus, setCurrentOfferStatus] = useState(offerStatuses.ALL);
    const [currentProgram, setCurrentProgram] = useState(t("offer.filter.program.all"));

    const {
        offers, loadAllOffersSummary,
        acceptedOffers, loadAcceptedOffers,
        rejectedOffers, loadRejectedOffers,
        pendingOffers, loadPendingOffers,
        programs, loadPrograms,
        loadOffersByProgram,
        viewOffer, loading,
        updateOfferStatus
    } = useOfferStore();


    useEffect(() => {
        loadPrograms();
        loadAllOffersSummary();
        loadPendingOffers();
        loadAcceptedOffers();
        loadRejectedOffers();
    }, [currentOffers, loadAllOffersSummary]);

    useEffect(() => {
        handleFilterChange();
        console.log("selectedOffer", selectedOffer)
        console.log(acceptedOffers)

    }, [currentOfferStatus, currentProgram, isModalOpen, selectedOffer]);

    const handleFilterChange = async () => {
        if (currentOfferStatus === offerStatuses.PENDING) {
            loadPendingOffers()
            filterByStatus(pendingOffers);
        }
        if (currentOfferStatus === offerStatuses.ACCEPTED) {
            loadAcceptedOffers()
            filterByStatus(acceptedOffers);
        }
        if (currentOfferStatus === offerStatuses.REJECTED) {
            loadRejectedOffers()
            filterByStatus(rejectedOffers);

        }
        if (currentOfferStatus === offerStatuses.ALL) {
            if (currentProgram === t("offer.filter.program.all")) {
                loadAllOffersSummary();
                setCurrentOffers(offers);
            }
            else {
                const data = await loadOffersByProgram(user.token, currentProgram);
                setCurrentOffers(data);
            }
        }
    };

    const filterByStatus = (offerList) => {
        let filteredOffers =
            currentProgram === t("offer.filter.program.all") ? offerList :
                offerList.filter(
                    (offer) => offer.targetedProgramme === currentProgram
                );
        setCurrentOffers(filteredOffers);
    };

    const openOffer = async (offerId) => {
        try {
            await viewOffer(user.token, offerId);
            const { selectedOffer, isModalOpen } = useOfferStore.getState();
            setSelectedOffer(selectedOffer);
            setIsModalOpen(isModalOpen);
        } catch (err) {
            console.error(err);
            toast.error(t("offer.errors.loadOffer"));
        }
    };

    const handleAccept = async () => {
        try {
            const updatedOffer = await updateOfferStatus(user.token, selectedOffer.id, "ACCEPTED", "");
            toast.success(t("offer.modal.accepted"));
            setIsModalOpen(false);

            loadAcceptedOffers();
            loadAllOffersSummary();
            setCurrentOffers(acceptedOffers);
        } catch (err) {
            console.error(err);
            toast.error(t("offer.errors.updateStatus"));
        }
    };

    const handleReject = async () => {
        try {
            await updateOfferStatus(user.token, selectedOffer.id, "REJECTED", "Rejected by admin");
            toast.info(t("offer.modal.rejected"));
            setIsModalOpen(false);

            loadRejectedOffers();
            loadAllOffersSummary();
            setCurrentOffers(rejectedOffers);
        } catch (err) {
            console.error(err);
            toast.error(t("offer.errors.updateStatus"));
        }
    };

    const tableRows = () => {
        return currentOffers.map((offer) => (
            <tr key={offer.id} className="border-t border-gray-300">
                <td className="px-4 py-2">{offer.title}</td>
                <td className="px-4 py-2">{offer.enterpriseName}</td>
                <td className="px-4 py-2">{offer.targetedProgramme}</td>
                <td className="px-4 py-2">{offer.status}</td>
                <td className="px-4 py-2">
                    {new Date(offer.expirationDate).toLocaleDateString()}
                </td>
                <td>
                    <Button
                        label={t("offer.actions.view")}
                        className="w-1/2"
                        onClick={() => openOffer(offer.id)}
                    />
                </td>
            </tr>
        ));
    };


    return (
        <div className="space-y-6">
            {/* Programmes */}
            <select
                className="me-18"
                value={currentProgram}
                onChange={(e) => setCurrentProgram(e.target.value)}
            >
                <option value={t("offer.filter.program.all")}>
                    {t("offer.filter.program.all")}
                </option>
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
                    Object.values(offerStatuses).map((offerStatus) => (
                        <option key={offerStatus} value={offerStatus}>
                            {offerStatus}
                        </option>
                    ))
                }
            </select>

            {
                loading ?
                    <p>{t("offer.table.loading")}</p> :
                    <>
                        <Header
                            title={t("menu.allOffers")}
                        />
                        <Table
                            headers={[
                                t("offer.table.offerTitle"),
                                t("offer.table.enterprise"),
                                t("offer.table.program"),
                                t("offer.table.status"),
                                t("offer.table.deadline"),
                                t("offer.actions.view")
                            ]}
                            rows={tableRows()}
                            emptyMessage={t("offer.table.noOffers")}
                        />
                    </>
            }

            {/* Modal */}
            {isModalOpen && selectedOffer && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-3/4 max-w-lg">
                        <h2 className="text-xl font-semibold mb-4">{selectedOffer.title}</h2>
                        <p>
                            <strong>{t("offer.modal.companyEmail")}: </strong>
                            {selectedOffer.employerEmail}
                        </p>
                        <p>
                            <strong>{t("offer.modal.targetedProgramme")}: </strong>
                            {selectedOffer.targetedProgramme}
                        </p>
                        <p>
                            <strong>{t("offer.modal.publishedDate")}: </strong>
                            {
                                selectedOffer.publishedDate ?
                                    new Date(selectedOffer.publishedDate).toLocaleDateString() : "-"
                            }
                        </p>
                        <p>
                            <strong>{t("offer.modal.deadline")}: </strong>
                            {
                                selectedOffer.expirationDate ?
                                    new Date(selectedOffer.expirationDate).toLocaleDateString() : "-"
                            }
                        </p>
                        <p>
                            <strong>{t("offer.modal.description")}: </strong>
                            {selectedOffer.description}
                        </p>
                        <p>
                            <strong>{t("offer.modal.status")}: </strong>
                            {selectedOffer.status}
                        </p>

                        {/* Boutons */}
                        <div className="flex justify-between mt-6">
                            <div className="flex space-x-2">
                                <button
                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                    onClick={handleAccept}
                                >
                                    {t("offer.modal.accept")}
                                </button>
                                <button
                                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                    onClick={handleReject}
                                >
                                    {t("offer.modal.reject")}
                                </button>
                            </div>

                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedOffer(null);
                                }}
                            >
                                {t("offer.modal.close")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};