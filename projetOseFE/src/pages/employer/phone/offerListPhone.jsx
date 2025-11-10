import {useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useOfferStore} from "../../../stores/offerStore.js";
import useAuthStore from "../../../stores/authStore.js";
import {useTranslation} from "react-i18next";
import {toast} from "sonner";
import {EyeOpenIcon, DownloadIcon} from "@radix-ui/react-icons";
import {Header} from "../../../components/ui/header.jsx";
import {DataTable} from "../../../components/ui/data-table.jsx";
import {Modal} from "../../../components/ui/modal.jsx";
import {Popover, PopoverTrigger, PopoverContent, PopoverClose} from "../../../components/ui/popover.jsx";

export const OfferListPhone = () => {
    const {t} = useTranslation("employer_dashboard_offers");
    const user = useAuthStore((s) => s.user);
    const {offers, loadOffers, downloadOfferPdf} = useOfferStore();
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();

    const [sortKey, setSortKey] = useState("date");
    const [yearFilter, setYearFilter] = useState(currentYear.toString());
    const [filterSession, setFilterSession] = useState(null);
    const [filterStatus, setFilterStatus] = useState(null);
    const [selectedOffer, setSelectedOffer] = useState(null);

    useEffect(() => {
        loadOffers().catch(() => toast.error(t("error.load")));
    }, []);

    const handleDownload = async (id) => {
        try {
            await downloadOfferPdf(user.token, id);
            toast.success(t("success.download"));
        } catch {
            toast.error(t("error.download"));
        }
    };

    const handleAction = (action, offer) => {
        if (action === "view") setSelectedOffer(offer);
        else if (action === "download") handleDownload(offer.id);
    };

    const availableYears = useMemo(() => {
        const years = new Set();
        offers.forEach((offer) => {
            if (offer.startDate) years.add(new Date(offer.startDate).getFullYear());
        });
        return Array.from(years).sort((a, b) => b - a);
    }, [offers]);

    const filteredAndSortedOffers = useMemo(() => {
        return offers
            .filter(o => !filterSession || o.session?.toLowerCase() === filterSession?.toLowerCase())
            .filter(o => !yearFilter || (o.startDate && new Date(o.startDate).getFullYear().toString() === yearFilter))
            .filter(o => !filterStatus || o.status === filterStatus)
            .sort((a, b) => {
                if (sortKey === "date") return new Date(b.expirationDate) - new Date(a.expirationDate);
                return 0;
            });
    }, [offers, sortKey, filterSession, yearFilter, filterStatus]);

    const columns = [
        {key: "title", label: t("table.offerTitle")},
        {key: "expirationDate", label: t("table.deadline")},
        {
            key: "actions",
            label: t("table.actions"),
            actions: [
                {key: "view", label: <EyeOpenIcon className="w-5 h-5"/>},
                {key: "download", label: <DownloadIcon className="w-5 h-5"/>},
            ],
        },
    ];

    const tableData = filteredAndSortedOffers.map((offer) => ({
        ...offer,
        expirationDate: new Date(offer.expirationDate).toLocaleDateString(),
    }));

    return (
        <div className="space-y-6 mt-6">
            <Header
                title={t("title")}
                actionLabel={t("actions.create_another")}
                onAction={() => navigate("/dashboard/employer/add-intership")}
            />

            {/* Filtrage par année */}
            <div className="flex items-center gap-4">
                <Popover>
                    {({open, setOpen, triggerRef, contentRef}) => (
                        <>
                            <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
                                <span
                                    className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                                    {t("filter.year")}: {yearFilter === "all" ? t("session.AllYears") : yearFilter}
                                </span>
                            </PopoverTrigger>
                            <PopoverContent open={open} contentRef={contentRef} className="mt-2">
                                <div
                                    className="flex flex-col gap-2 min-w-[150px] max-h-[300px] overflow-y-auto items-center">
                                    {availableYears.map((year) => (
                                        <button
                                            key={year}
                                            onClick={() => {
                                                setYearFilter(year.toString());
                                                setOpen(false);
                                            }}
                                            className={`px-3 py-1 rounded text-left ${yearFilter === year.toString() ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`}
                                        >
                                            {year}
                                        </button>
                                    ))}
                                    <PopoverClose setOpen={setOpen}>
                                        <span className="text-sm text-gray-600">{t("menu.close")}</span>
                                    </PopoverClose>
                                </div>
                            </PopoverContent>
                        </>
                    )}
                </Popover>
            </div>

            <DataTable
                columns={columns}
                data={tableData}
                onAction={handleAction}
                emptyMessage={t("table.noOffers")}
            />

            <Modal
                open={!!selectedOffer}
                onClose={() => setSelectedOffer(null)}
                title={selectedOffer?.title}
                size="default"
                footer={
                    <button
                        onClick={() => setSelectedOffer(null)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                        <span>{t("actions.close")}</span>
                    </button>
                }
            >
                {selectedOffer && (
                    <div className="space-y-4">
                        {/* Company */}
                        <div className="flex justify-between">
                            <span className="font-semibold text-gray-700">{t("table.enterprise")}</span>
                            <span className="text-gray-600">{selectedOffer.enterpriseName}</span>
                        </div>

                        {/* Program */}
                        <div className="flex justify-between">
                            <span className="font-semibold text-gray-700">{t("table.program")}</span>
                            <span className="text-gray-600">{selectedOffer.targetedProgramme}</span>
                        </div>

                        {/* Status */}
                        <div className="flex justify-between">
                            <span className="font-semibold text-gray-700">{t("table.status")}</span>
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                    selectedOffer.status === "ACCEPTED" ? "bg-green-100 text-green-800" :
                                        selectedOffer.status === "REJECTED" ? "bg-red-100 text-red-800" :
                                            "bg-yellow-100 text-yellow-800"
                                }`}
                            >
    {t(`status.${selectedOffer.status?.toLowerCase()}`)}
  </span>
                        </div>


                        {/* Deadline */}
                        <div className="flex justify-between">
                            <span className="font-semibold text-gray-700">{t("table.deadline")}</span>
                            <span
                                className="text-gray-600">{new Date(selectedOffer.expirationDate).toLocaleDateString()}</span>
                        </div>

                        {/* Reason */}
                        {selectedOffer.reason?.trim() && (
                            <div>
                                <span className="font-semibold text-gray-700">{t("table.reason")}</span>
                                <p className="text-gray-600 whitespace-pre-wrap mt-1">{selectedOffer.reason}</p>
                            </div>
                        )}

                        {/* Description */}
                        {selectedOffer.description && (
                            <div>
                                <span className="font-semibold text-gray-700">{t("table.description")}</span>
                                <p className="text-gray-600 whitespace-pre-wrap mt-1">{selectedOffer.description}</p>
                            </div>
                        )}

                    </div>
                )}
            </Modal>


        </div>
    );
};
