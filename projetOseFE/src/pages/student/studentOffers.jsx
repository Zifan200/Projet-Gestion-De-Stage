import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useAuthStore from "../../stores/authStore.js";
import { useOfferStore } from "../../stores/offerStore.js";
import { useCvStore } from "../../stores/cvStore.js";
import { useStudentStore } from "../../stores/studentStore.js";
import { useRecommendationStore } from "../../stores/recommendationStore.js";
import { toast } from "sonner";
import { DataTable } from "../../components/ui/data-table.jsx";
import { Header } from "../../components/ui/header.jsx";
import { Modal } from "../../components/ui/modal.jsx";
import { EyeOpenIcon, DownloadIcon } from "@radix-ui/react-icons";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
} from "../../components/ui/popover.jsx";

export const StudentOffers = () => {
    const { t } = useTranslation("student_dashboard_offers");
    const navigate = useNavigate();

    const [selectedOffer, setSelectedOffer] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCv, setSelectedCv] = useState(null);
    const [filterPriority, setFilterPriority] = useState(null);
    const [showBackgrounds, setShowBackgrounds] = useState(true);

    const user = useAuthStore((s) => s.user);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const { offers, loadOffersSummary, viewOffer, downloadOfferPdf } = useOfferStore();
    const { cvs, loadCvs, applyCvStore } = useCvStore();
    const { applications, loadAllApplications } = useStudentStore();
    const { studentRecommendations, loadRecommendationsForStudent } = useRecommendationStore();

    useEffect(() => {
        if (!isAuthenticated || !user) {
            navigate("/");
        } else if (user.role === "STUDENT") {
            loadOffersSummary();
            loadCvs();
            loadAllApplications();
            if (user.id) {
                loadRecommendationsForStudent(user.token, user.id);
            }
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

    const getPriorityOrder = (priority) => {
        switch (priority) {
            case "GOLD":
                return 1;
            case "SILVER":
                return 2;
            case "BRONZE":
                return 3;
            case "BLUE":
                return 2;
            case "GREEN":
                return 3;
            default:
                return 4;
        }
    };

    const getRowClassName = (offer) => {
        if (!offer.priorityCode) return "hover:bg-gray-50";

        switch (offer.priorityCode) {
            case "GOLD":
                return "bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 border-l-4 border-amber-400";
            case "SILVER":
                return "bg-gray-50 hover:bg-gray-100 border-l-4 border-gray-400";
            case "BRONZE":
                return "bg-orange-50 hover:bg-orange-100 border-l-4 border-orange-400";
            default:
                return "hover:bg-gray-50";
        }
    };

    const filteredOffers = useMemo(() => {
        const filtered = offers
            .filter((offer) => offer.session?.toLowerCase() === "hiver")
            .filter(
                (offer) =>
                    offer.startDate &&
                    new Date(offer.startDate).getFullYear().toString() === currentYear
            )
            .filter(
                (offer) => !applications.find((a) => a.internshipOfferId === offer.id)
            )
            .map((offer) => {
                const recommendation = studentRecommendations.find(
                    (rec) => rec.offerId === offer.id
                );
                return {
                    ...offer,
                    priorityCode: recommendation?.priorityCode || null,
                };
            })
            .filter((offer) => {
                if (!filterPriority) return true;
                return offer.priorityCode === filterPriority;
            });

        return filtered.sort((a, b) =>
            getPriorityOrder(a.priorityCode) - getPriorityOrder(b.priorityCode)
        );
    }, [offers, applications, studentRecommendations, filterPriority]);

    const getPriorityBadgeClass = (priority) => {
        switch (priority) {
            case "BRONZE":
                return "bg-orange-100 text-orange-800";
            case "SILVER":
                return "bg-gray-100 text-gray-800";
            case "GOLD":
                return "bg-amber-100 text-amber-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const columns = [
        { key: "title", label: t("table.title") },
        { key: "enterpriseName", label: t("table.company") },
        ...(!showBackgrounds ? [{
            key: "priority",
            label: t("table.priority"),
            render: (offer) => {
                if (!offer.priorityCode) return (
                    <span className="text-gray-400 text-xs italic">-</span>
                );
                return (
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityBadgeClass(offer.priorityCode)}`}>
                        {t(`priority.${offer.priorityCode.toLowerCase()}`)}
                    </span>
                );
            }
        }] : []),
        { key: "expirationDate", label: t("table.deadline") },
        {
            key: "actions",
            label: t("table.action"),
            actions: [
                {
                    key: "view",
                    label: (
                        <>
                            <EyeOpenIcon className="w-4 h-4" />
                            <span>{t("actions.apply")}</span>
                        </>
                    ),
                },
                {
                    key: "download",
                    label: (
                        <>
                            <DownloadIcon className="w-4 h-4" />
                            <span>{t("actions.download")}</span>
                        </>
                    ),
                },
            ],
        },
    ];

    const tableData = filteredOffers.map((offer) => ({
        ...offer,
        expirationDate: offer.expirationDate
            ? new Date(offer.expirationDate).toLocaleDateString()
            : "-",
    }));

    return (
        <div className="space-y-6">
            <Header title={t("title")} />

            {/* Filtres et contrôles */}
            <div className="flex items-center gap-3">
                <Popover>
                    {({ open, setOpen, triggerRef, contentRef }) => (
                        <>
                            <PopoverTrigger
                                open={open}
                                setOpen={setOpen}
                                triggerRef={triggerRef}
                            >
                                <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                                    {t("filter.priority")}:{" "}
                                    {filterPriority ? t(`priority.${filterPriority.toLowerCase()}`) : t("filter.all")}
                                </span>
                            </PopoverTrigger>

                            <PopoverContent open={open} contentRef={contentRef}>
                                <div className="flex flex-col gap-2 min-w-[150px]">
                                    {["GOLD", "SILVER", "BRONZE"].map((priority) => (
                                        <button
                                            key={priority}
                                            onClick={() => {
                                                setFilterPriority(priority);
                                                setOpen(false);
                                            }}
                                            className={`px-3 py-1 rounded text-left ${
                                                filterPriority === priority
                                                    ? "bg-blue-100 font-semibold"
                                                    : "hover:bg-gray-100"
                                            }`}
                                        >
                                            {t(`priority.${priority.toLowerCase()}`)}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => {
                                            setFilterPriority(null);
                                            setOpen(false);
                                        }}
                                        className="px-3 py-1 rounded text-left hover:bg-gray-100"
                                    >
                                        {t("filter.all")}
                                    </button>
                                    <PopoverClose setOpen={setOpen}>
                                        <span className="text-sm text-gray-600">
                                            {t("menu.close")}
                                        </span>
                                    </PopoverClose>
                                </div>
                            </PopoverContent>
                        </>
                    )}
                </Popover>

                <button
                    onClick={() => setShowBackgrounds(!showBackgrounds)}
                    className={`px-4 py-1 rounded-md shadow-sm transition ${
                        showBackgrounds
                            ? "bg-blue-500 text-white hover:bg-blue-600"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                    {showBackgrounds ? t("filter.hideBackgrounds") : t("filter.showBackgrounds")}
                </button>
            </div>

            <DataTable
                columns={columns}
                data={tableData}
                onAction={(action, offer) => {
                    if (action === "view") handleViewOffer(offer.id);
                    if (action === "download") handleDownload(offer.id);
                }}
                getRowClassName={showBackgrounds ? getRowClassName : undefined}
            />

            {selectedOffer && (
                <Modal
                    open={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedOffer(null);
                        setSelectedCv(null);
                    }}
                    title={selectedOffer.title}
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
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    {t("modal.companyEmail")}
                                </h3>
                                <p className="text-gray-600">{selectedOffer.employerEmail}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    {t("modal.targetedProgramme")}
                                </h3>
                                <p className="text-gray-600">
                                    {selectedOffer.targetedProgramme}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    {t("modal.publishedDate")}
                                </h3>
                                <p className="text-gray-600">
                                    {selectedOffer.publishedDate
                                        ? new Date(selectedOffer.publishedDate).toLocaleDateString()
                                        : "-"}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    {t("modal.deadline")}
                                </h3>
                                <p className="text-gray-600">
                                    {selectedOffer.expirationDate
                                        ? new Date(
                                            selectedOffer.expirationDate
                                        ).toLocaleDateString()
                                        : "-"}
                                </p>
                            </div>
                        </div>

                        {/* Description + Salaire */}
                        <div className="grid grid-cols-2 gap-4">
                            {selectedOffer.description && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                        {t("modal.description")}
                                    </h3>
                                    <p className="text-gray-600 whitespace-pre-wrap">
                                        {selectedOffer.description}
                                    </p>
                                </div>
                            )}

                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    {t("modal.salary")}
                                </h3>
                                <p className="text-gray-600">
                                    {localStorage.key("lang") === "fr"
                                        ? selectedOffer.salary.toLocaleString("fr-CA", {
                                            style: "currency",
                                            currency: "CAD",
                                        })
                                        : selectedOffer.salary.toLocaleString("en-CA", {
                                            style: "currency",
                                            currency: "CAD",
                                        })}
                                </p>
                            </div>
                        </div>

                        {/* Sélection du CV */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t("modal.selectCv")}
                            </label>
                            <select
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                value={selectedCv?.id || ""}
                                onChange={(e) =>
                                    setSelectedCv(
                                        cvs.find((cv) => cv.id.toString() === e.target.value)
                                    )
                                }
                            >
                                <option value="">-- {t("modal.chooseCv")} --</option>
                                {cvs
                                    .filter((cv) => cv.status === "ACCEPTED")
                                    .map((cv) => (
                                        <option key={cv.id} value={cv.id}>
                                            {cv.name || cv.fileName}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};
