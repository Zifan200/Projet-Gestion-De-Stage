import {useTranslation} from "react-i18next";
import {Table} from "../../components/ui/table.jsx";
import {Header} from "../../components/ui/header.jsx";
import React, {useEffect, useState} from "react";
import {useOfferStore} from "../../stores/offerStore.js";
import useAuthStore from "../../stores/authStore.js";
import {Button} from "../../components/ui/button.jsx";
import {toast} from "sonner";
import {useGeStore} from "../../stores/geStore.js";

export const AllOffers = () => {
    const {t} = useTranslation();
    const user = useAuthStore((s) => s.user);

    const [selectedOffer, setSelectedOffer] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentOffers, setCurrentOffers] = useState([]);
    const [rejectReason, setRejectReason] = useState("");

    const offerStatuses = {
        ALL: t("offer.filter.all"),
        PENDING: t("offer.status.pending"),
        ACCEPTED: t("offer.status.accepted"),
        REJECTED: t("offer.status.rejected"),
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
        updateOfferStatus,
        downloadOfferPdf
    } = useOfferStore();

    const {
        students,
        error,
        loadAllApplicationsFromInternshipOffer,
    } = useGeStore();

    // --- Charger le store au montage ---
    useEffect(() => {
        const loadAllData = async () => {
            await loadPrograms();
            await loadAllOffersSummary();
            await loadPendingOffers();
            await loadAcceptedOffers();
            await loadRejectedOffers();
        };
        loadAllData();
    }, []);

    // --- Mettre à jour currentOffers chaque fois que filtre change ou store change ---
    useEffect(() => {
        applyCurrentFilter();
    }, [currentOfferStatus, currentProgram, offers, pendingOffers, acceptedOffers, rejectedOffers]);

    // --- Fonction qui applique le filtre actuel ---
    const applyCurrentFilter = () => {
        let listToFilter = [];
        switch (currentOfferStatus) {
            case offerStatuses.PENDING:
                listToFilter = pendingOffers;
                break;
            case offerStatuses.ACCEPTED:
                listToFilter = acceptedOffers;
                break;
            case offerStatuses.REJECTED:
                listToFilter = rejectedOffers;
                break;
            case offerStatuses.ALL:
                listToFilter = offers;
                break;
        }

        let filtered = listToFilter;
        if (currentProgram !== t("offer.filter.program.all")) {
            filtered = listToFilter.filter(o => o.targetedProgramme === currentProgram);
        }
        setCurrentOffers(filtered);
    };

    // --- Ouvrir le modal d'une offre ---
    const openOffer = async (offerId) => {
        try {
            await viewOffer(user.token, offerId);
            const {selectedOffer, isModalOpen} = useOfferStore.getState();
            setSelectedOffer(selectedOffer);
            setIsModalOpen(isModalOpen);
        } catch (err) {
            console.error(err);
            toast.error(t("offer.errors.loadOffer"));
        }
    };

    // --- Accepter une offre ---
    const handleAccept = async () => {
        try {
            await updateOfferStatus(user.token, selectedOffer.id, "ACCEPTED", "");
            toast.success(t("offer.modal.accepted"));
            setIsModalOpen(false);
            setSelectedOffer(null);

            // Recharge le store
            await loadAllOffersSummary();
            await loadPendingOffers();
            await loadAcceptedOffers();
            await loadRejectedOffers();

        } catch (err) {
            console.error(err);
            toast.error(t("offer.errors.updateStatus"));
        }
    };

    // --- Rejeter une offre ---
    const handleReject = async () => {
        if (!rejectReason.trim()) return toast.error(t("offer.modal.reasonRequired"));

        try {
            await updateOfferStatus(user.token, selectedOffer.id, "REJECTED", rejectReason);
            toast.success(t("offer.modal.reject"));
            setIsModalOpen(false);
            setSelectedOffer(null);
            setRejectReason("");

            await loadAllOffersSummary();
            await loadPendingOffers();
            await loadAcceptedOffers();
            await loadRejectedOffers();
        } catch (err) {
            console.error(err);
            toast.error(t("offer.errors.rejectFailed"));
        }
    };

    const handleDownload = async (id) => {
        try {
            await downloadOfferPdf(user.token, id);
            toast.success(t("offer.success.download"));
        } catch {
            toast.error(t("offer.error.download"));
        }
    };

    // --- Rows pour le tableau ---
    const tableRows = () => currentOffers.map((offer) => (
        <tr key={offer.id} className="border-t border-gray-300">
            <td className="px-4 py-2">{offer.title}</td>
            <td className="px-4 py-2">{offer.enterpriseName}</td>
            <td className="px-4 py-2">{offer.targetedProgramme}</td>
            <td className="px-4 py-2">{offer.status}</td>
            <td className="px-4 py-2">{new Date(offer.expirationDate).toLocaleDateString()}</td>
            <td>
                <Button
                    label={t("offer.actions.view")}
                    className="w-1/2"
                    onClick={() => openOffer(offer.id)}
                />
                <Button
                    onClick={() => handleDownload(offer.id)}
                    label={t("offer.actions.download")}
                    className="w-1/2 bg-amber-200 hover:bg-amber-50"
                />
            </td>
        </tr>
    ));

    function choseOfferStatus() {
        return <>
            {/* Rejet */}
            <div className="mt-4">
                <label className="block font-medium mb-1">{t("offer.modal.rejectReason")}</label>
                <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder={t("offer.modal.reasonPlaceholder")}
                    className="w-full border rounded p-2"
                    rows={3}
                />
            </div>

            <div className="flex justify-between mt-6">
                <div className="flex space-x-2">
                    <button
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        onClick={handleAccept}
                    >
                        {t("offer.modal.accept")}
                    </button>

                    <button
                        className={`px-4 py-2 rounded text-white ${rejectReason.trim() ? "bg-yellow-500 hover:bg-yellow-600" : "bg-gray-400 cursor-not-allowed"}`}
                        disabled={!rejectReason.trim()}
                        onClick={handleReject}
                    >
                        {t("offer.actions.reject")}
                    </button>
                </div>
            </div>
        </>;
    }

    function viewApplicants(){
        return <>
            <div className="bg-amber-700">
                <p>hola</p>
            </div>
        </>
    }

    return (
        <div className="space-y-6">
            {/* Filtrage programmes */}
            <select value={currentProgram} onChange={e => setCurrentProgram(e.target.value)}>
                <option value={t("offer.filter.program.all")}>{t("offer.filter.program.all")}</option>
                {programs.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            {/* Filtrage status */}
            <select value={currentOfferStatus} onChange={e => setCurrentOfferStatus(e.target.value)}>
                {Object.values(offerStatuses).map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {loading ? <p>{t("offer.table.loading")}</p> :
                <>
                    <Header title={t("menu.allOffers")}/>
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
                        <p><strong>{t("offer.modal.companyEmail")}: </strong>{selectedOffer.employerEmail}</p>
                        <p><strong>{t("offer.modal.targetedProgramme")}: </strong>{selectedOffer.targetedProgramme}</p>
                        <p>
                            <strong>{t("offer.modal.publishedDate")}: </strong>{selectedOffer.publishedDate ? new Date(selectedOffer.publishedDate).toLocaleDateString() : "-"}
                        </p>
                        <p>
                            <strong>{t("offer.modal.deadline")}: </strong>{selectedOffer.expirationDate ? new Date(selectedOffer.expirationDate).toLocaleDateString() : "-"}
                        </p>
                        <p><strong>{t("offer.modal.description")}: </strong>{selectedOffer.description}</p>
                        <p><strong>{t("offer.modal.status")}: </strong>{selectedOffer.status}</p>


                        {(currentOfferStatus.toUpperCase() === offerStatuses.PENDING.toUpperCase()) && choseOfferStatus()}
                        {(selectedOffer.status.toUpperCase() === offerStatuses.ACCEPTED.toUpperCase()) && viewApplicants()}

                        <div className="flex w-auto justify-between mt-6 justify-end">
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedOffer(null);
                                    setRejectReason("");
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
