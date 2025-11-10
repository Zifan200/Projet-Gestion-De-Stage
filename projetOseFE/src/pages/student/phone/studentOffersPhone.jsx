import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useAuthStore from "../../../stores/authStore.js";
import { useOfferStore } from "../../../stores/offerStore.js";
import { useCvStore } from "../../../stores/cvStore.js";
import { useStudentStore } from "../../../stores/studentStore.js";
import { toast } from "sonner";
import { DataTable } from "../../../components/ui/data-table.jsx";
import { Modal } from "../../../components/ui/modal.jsx";
import { EyeOpenIcon, DownloadIcon } from "@radix-ui/react-icons";

export const StudentOffersPhone = () => {
    const { t } = useTranslation("student_dashboard_offers");
    const navigate = useNavigate();

    const [selectedOffer, setSelectedOffer] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCv, setSelectedCv] = useState(null);

    const user = useAuthStore((s) => s.user);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const { offers, loadOffersSummary, viewOffer, downloadOfferPdf } = useOfferStore();
    const { cvs, loadCvs, applyCvStore } = useCvStore();
    const { applications, loadAllApplications } = useStudentStore();

    useEffect(() => {
        if (!isAuthenticated || !user) {
            navigate("/");
        } else if (user.role === "STUDENT") {
            loadOffersSummary();
            loadCvs();
            loadAllApplications();
        }
    }, [isAuthenticated, user, navigate, loadOffersSummary, loadCvs, loadAllApplications]);

    if (!isAuthenticated || !user) return null;

    const handleViewOffer = async (offerId) => {
        try {
            await viewOffer(user.token, offerId);
            const { selectedOffer, isModalOpen } = useOfferStore.getState();
            setSelectedOffer(selectedOffer);
            setIsModalOpen(isModalOpen);
        } catch {
            toast.error(t("errors.viewOffer"));
        }
    };

    const handleDownload = async (offerId) => {
        try {
            await downloadOfferPdf(user.token, offerId);
            toast.success(t("actions.download"));
        } catch {
            toast.error(t("errors.viewOffer"));
        }
    };

    const handleApply = async () => {
        if (!selectedCv) {
            toast.warning(t("errors.selectCv"));
            return;
        }
        try {
            await applyCvStore(selectedOffer.id, selectedCv.id);
            toast.success(t("success.applyOffer"));
            setIsModalOpen(false);
            setSelectedOffer(null);
            setSelectedCv(null);
            loadAllApplications();
        } catch {
            toast.error(t("errors.applyOffer"));
        }
    };

    const currentYear = (new Date().getFullYear() + 1).toString();

    const filteredOffers = useMemo(() => {
        return offers
            .filter((offer) => offer.session?.toLowerCase() === "hiver")
            .filter(
                (offer) =>
                    offer.startDate &&
                    new Date(offer.startDate).getFullYear().toString() === currentYear
            )
            .filter(
                (offer) => !applications.find((a) => a.internshipOfferId === offer.id)
            );
    }, [offers, applications]);

    const columns = [
        { key: "title", label: t("table.title") },
        { key: "expirationDate", label: t("table.deadline") },
        {
            key: "actions",
            label: t("table.action"),
            actions: [
                { key: "view", label: <EyeOpenIcon className="w-5 h-5" /> },
                { key: "download", label: <DownloadIcon className="w-5 h-5" /> },
            ],
        },
    ];

    const tableData = filteredOffers.map((offer) => ({
        ...offer,
        expirationDate: offer.expirationDate
            ? new Date(offer.expirationDate).toLocaleDateString()
            : "-",
    }));

    const handleAction = (action, offer) => {
        if (action === "view") handleViewOffer(offer.id);
        else if (action === "download") handleDownload(offer.id);
    };

    return (
        <div className="space-y-4 p-4 mt-6">
            {/* Titre principal de la page */}
            <h1 className="text-xl font-bold text-gray-800">{t("title")}</h1>

            <DataTable columns={columns} data={tableData} onAction={handleAction} />

            <Modal
                open={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedOffer(null);
                    setSelectedCv(null);
                }}
                title={selectedOffer?.title}
                size="default"
                footer={
                    <>
                        <button
                            onClick={() => {
                                setIsModalOpen(false);
                                setSelectedOffer(null);
                                setSelectedCv(null);
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                            {t("modal.close")}
                        </button>
                        <button
                            onClick={handleApply}
                            disabled={!selectedCv}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                selectedCv
                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                        >
                            {t("modal.apply")}
                        </button>
                    </>
                }
            >
                {selectedOffer && (
                    <div className="space-y-4">
                        {/* Ligne 1 : companyEmail + targetedProgramme */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-1">{t("modal.companyEmail")}</h3>
                                <p className="text-gray-600">{selectedOffer.employerEmail}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-1">{t("modal.targetedProgramme")}</h3>
                                <p className="text-gray-600">{selectedOffer.targetedProgramme}</p>
                            </div>
                        </div>

                        {/* Ligne 2 : publishedDate + deadline */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-1">{t("modal.publishedDate")}</h3>
                                <p className="text-gray-600">{selectedOffer.publishedDate ? new Date(selectedOffer.publishedDate).toLocaleDateString() : "-"}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-1">{t("modal.deadline")}</h3>
                                <p className="text-gray-600">{selectedOffer.expirationDate ? new Date(selectedOffer.expirationDate).toLocaleDateString() : "-"}</p>
                            </div>
                        </div>

                        {/* Description */}
                        {selectedOffer.description && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-1">{t("modal.description")}</h3>
                                <p className="text-gray-600 whitespace-pre-wrap">{selectedOffer.description}</p>
                            </div>
                        )}

                        {/* CV Select */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t("modal.selectCv")}</label>
                            <select
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                value={selectedCv?.id || ""}
                                onChange={(e) =>
                                    setSelectedCv(cvs.find((cv) => cv.id.toString() === e.target.value))
                                }
                            >
                                <option value="">-- {t("modal.chooseCv")} --</option>
                                {cvs.filter((cv) => cv.status === "ACCEPTED").map((cv) => (
                                    <option key={cv.id} value={cv.id}>
                                        {cv.name || cv.fileName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
