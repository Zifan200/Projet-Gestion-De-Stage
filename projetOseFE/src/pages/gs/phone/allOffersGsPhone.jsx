import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Table } from "../../../components/ui/table.jsx";
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "../../../components/ui/popover.jsx";
import { EyeOpenIcon, DownloadIcon } from "@radix-ui/react-icons";
import { useOfferStore } from "../../../stores/offerStore.js";
import useAuthStore from "../../../stores/authStore.js";
import { toast } from "sonner";

export const AllOffersGsPhone = () => {
    const { t } = useTranslation("gs_dashboard_all_internships");
    const user = useAuthStore((s) => s.user);
    const { offers, pendingOffers, acceptedOffers, rejectedOffers, loadAllOffersSummary, loadPendingOffers, loadAcceptedOffers, loadRejectedOffers } = useOfferStore();

    const offerStatuses = {
        ALL: t("filter.all"),
        PENDING: t("status.pending"),
        ACCEPTED: t("status.accepted"),
        REJECTED: t("status.rejected"),
    };

    const [currentOfferStatus, setCurrentOfferStatus] = useState(offerStatuses.ALL);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear().toString());
    const [currentOffers, setCurrentOffers] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            await loadAllOffersSummary();
            await loadPendingOffers();
            await loadAcceptedOffers();
            await loadRejectedOffers();
        };
        loadData();
    }, []);

    useEffect(() => {
        applyFilter();
    }, [currentOfferStatus, currentYear, offers, pendingOffers, acceptedOffers, rejectedOffers]);

    const applyFilter = () => {
        let list = [];
        switch (currentOfferStatus) {
            case offerStatuses.PENDING:
                list = pendingOffers;
                break;
            case offerStatuses.ACCEPTED:
                list = acceptedOffers;
                break;
            case offerStatuses.REJECTED:
                list = rejectedOffers;
                break;
            case offerStatuses.ALL:
                list = offers;
                break;
        }

        const filtered = list.filter((o) => {
            if (!o.startDate) return false;
            const year = new Date(o.startDate).getFullYear();
            return year.toString() === currentYear;
        });

        setCurrentOffers(filtered);
    };

    const availableYears = Array.from(
        new Set(offers.filter((o) => o.startDate).map((o) => new Date(o.startDate).getFullYear()))
    ).sort((a, b) => b - a);

    const handleDownload = async (id) => {
        try {
            await useOfferStore.getState().downloadOfferPdf(user.token, id);
            toast.success(t("success.download"));
        } catch {
            toast.error(t("error.download"));
        }
    };

    const tableRows = () =>
        currentOffers.map((offer) => (
            <tr key={offer.id} className="border-t border-gray-200 text-gray-700 text-sm">
                <td className="px-4 py-3">{offer.title}</td>
                <td className="px-4 py-3">{new Date(offer.expirationDate).toLocaleDateString()}</td>
                <td className="px-4 py-3 flex items-center gap-2">
                    <button onClick={() => toast.info("Preview non implémenté")} className="p-2 bg-indigo-100 text-indigo-700 rounded">
                        <EyeOpenIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDownload(offer.id)} className="p-2 bg-green-100 text-green-700 rounded">
                        <DownloadIcon className="w-4 h-4" />
                    </button>
                </td>
            </tr>
        ));

    return (
        <div className="space-y-4 mt-8">
            <h1 className="text-xl font-semibold">{t("title")}</h1>

            {/* Filtres */}
            <div className="flex gap-4">
                {/* Status Filter */}
                <Popover>
                    {({ open, setOpen, triggerRef, contentRef }) => (
                        <>
                            <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
                <span className="px-3 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                  {t("filter.status")}: {currentOfferStatus}
                </span>
                            </PopoverTrigger>
                            <PopoverContent open={open} contentRef={contentRef}>
                                <div className="flex flex-col gap-2 min-w-[120px]">
                                    {Object.values(offerStatuses).map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => {
                                                setCurrentOfferStatus(status);
                                                setOpen(false);
                                            }}
                                            className={`px-2 py-1 rounded text-left ${
                                                currentOfferStatus === status ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"
                                            }`}
                                        >
                                            {status}
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

                {/* Year Filter */}
                <Popover>
                    {({ open, setOpen, triggerRef, contentRef }) => (
                        <>
                            <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
                <span className="px-3 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                  {t("filter.year")}: {currentYear}
                </span>
                            </PopoverTrigger>
                            <PopoverContent open={open} contentRef={contentRef}>
                                <div className="flex flex-col gap-2 min-w-[120px] max-h-[250px] overflow-y-auto">
                                    {availableYears.map((year) => (
                                        <button
                                            key={year}
                                            onClick={() => {
                                                setCurrentYear(year.toString());
                                                setOpen(false);
                                            }}
                                            className={`px-2 py-1 rounded text-left ${
                                                currentYear === year.toString() ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"
                                            }`}
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

            {/* Tableau */}
            <Table
                headers={[t("table.offerTitle"), t("table.deadline"), t("actions.view")]}
                rows={tableRows()}
                emptyMessage={t("table.noOffers")}
            />
        </div>
    );
};
