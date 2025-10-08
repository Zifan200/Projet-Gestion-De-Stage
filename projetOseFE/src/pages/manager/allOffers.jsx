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

    const [
        currentOfferStatus,
        setCurrentOfferStatus
    ] = useState(offerStatuses.ALL);
    const [
        currentProgram,
        setCurrentProgram
    ] = useState(t("offer.filter.program.all"));

    const {
        offers, loadAllOffers,
        acceptedOffers, loadAcceptedOffers,
        rejectedOffers, loadRejectedOffers,
        pendingOffers, loadPendingOffers,
        programs, loadPrograms,
        loadOffer, loading
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
        try {
            if (currentProgram !== t("offer.filter.program.all")) {
                const res = await fetch(
                    `http://localhost:8080/api/v1/internship-offers/filter-by-program?program=${currentProgram}`,
                    {
                        headers: {
                            Authorization: `Bearer ${user.token}`,
                        }
                });
                const data = await res.json();
                setCurrentOffers(data);
            }
            else {
                await loadAllOffers();
                setCurrentOffers(offers);
            }
        } catch (err) {
            console.error(err);
            toast.error(t("offer.errors.loadOffers"));
        }
    };

    const handleOfferStatusChange = () => {
        try {
            switch (currentOfferStatus) {
                case offerStatuses.PENDING:
                    loadPendingOffers();
                    setCurrentOffers(pendingOffers);
                    break;
                case offerStatuses.ACCEPTED:
                    loadAcceptedOffers();
                    setCurrentOffers(acceptedOffers);
                    break;
                case offerStatuses.REJECTED:
                    loadRejectedOffers();
                    setCurrentOffers(rejectedOffers);
                    break;
                case offerStatuses.ALL:
                    loadAllOffers();
                    setCurrentOffers(offers);
                    break;
            }
        } catch (err) {
            console.error(err);
            toast.error(t("offer.errors.loadOffers"));
        }
    };

    const openOffer = async (offerId) => {
        try {
            await loadOffer(user.token, offerId);
            const { selectedOffer, isModalOpen } = useOfferStore.getState();
            setSelectedOffer(selectedOffer);
            setIsModalOpen(isModalOpen);
        } catch (err) {
            console.error(err);
            toast.error(t("offer.errors.loadOffer"));
        }
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
                                t("offer.actions.view")
                            ]}
                            rows={
                                currentOffers.map((offer) => (
                                    <tr key={offer.id} className="border-t border-gray-300">
                                        <td className="px-4 py-2">{offer.title}</td>
                                        <td className="px-4 py-2">{offer.enterpriseName}</td>
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
                                ))
                            }
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
                        <button
                            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            onClick={() => {
                                setIsModalOpen(false);
                                setSelectedOffer(null);
                            }}
                        >
                            {t("offer.modal.close")}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}