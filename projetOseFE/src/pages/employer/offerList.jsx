import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "../../components/ui/header.jsx";
import { Table } from "../../components/ui/table.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useOfferStore } from "../../stores/offerStore.js";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverClose,
} from "../../components/ui/popover.jsx";
import useAuthStore from "../../stores/authStore.js";

// Simple Modal Component
const Modal = ({ open, onClose, title, children }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800 text-lg"
                    >
                        ✕
                    </button>
                </div>
                <div className="text-gray-800">{children}</div>
            </div>
        </div>
    );
};

export const OfferList = () => {
    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const { offers, loadOffers, downloadOfferPdf } = useOfferStore();
    const navigate = useNavigate();

    const [filterStatus, setFilterStatus] = useState(null);
    const [sortKey, setSortKey] = useState("date");
    const [filterSession, setFilterSession] = useState("All");
    const [selectedOffer, setSelectedOffer] = useState(null);

    useEffect(() => {
        loadOffers(user.token).catch(() => {
            toast.error(t("offer.error.load"));
        });
    }, []);

    const handleDownload = async (id) => {
        try {
            await downloadOfferPdf(user.token, id);
            toast.success(t("offer.success.download"));
        } catch {
            toast.error(t("offer.error.download"));
        }
    };

    const sortedAndFilteredOffers = useMemo(() => {
        let filtered = offers;

        if (filterSession && filterSession !== "All") {
            filtered = filtered.filter((o) => o.session === filterSession);
        }

        console.log("Offres filtrées par session :", filterSession, filtered);

        return filtered;
    }, [offers, filterSession]);




    const rows = sortedAndFilteredOffers.map((offer) => (
        <tr key={offer.id} className="border-t border-gray-300">
            <td className="px-4 py-2">{offer.title}</td>
            <td className="px-4 py-2">{offer.enterpriseName}</td>
            <td className="px-4 py-2">{offer.targetedProgramme}</td>
            <td className="px-4 py-2">
                {new Date(offer.expirationDate).toLocaleDateString()}
            </td>
            <td className="px-4 py-2">{t(`offer.status.${offer.status?.toLowerCase()}`)}</td>
            <td className="px-4 py-2 text-center">{offer.applicationCount}</td>
            <td className="px-4 py-2 flex space-x-2">
                <Button
                    onClick={() => setSelectedOffer(offer)}
                    label={t("offer.actions.view")}
                    className="bg-blue-300 hover:bg-blue-100 rounded-lg"
                />
                <Button
                    onClick={() => handleDownload(offer.id)}
                    label={t("offer.actions.download")}
                    className="bg-amber-200 hover:bg-amber-50 rounded-lg"
                />
            </td>
        </tr>
    ));

    return (
        <div className="space-y-6">
            <Header
                title={t("offer.table.title")}
                actionLabel={t("offer.actions.create_another")}
                onAction={() => navigate("/dashboard/employer/add-intership")}
            />

            <div className="flex items-center gap-4 mb-4 w-full">
                {/* Filter by status */}
                <Popover>
                    {({ open, setOpen, triggerRef, contentRef }) => (
                        <>
                            <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
                                <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                                    {t("offer.filter.status")}:{" "}
                                    {filterStatus
                                        ? t(`offer.status.${filterStatus.toLowerCase()}`)
                                        : t("offer.filter.all")}
                                </span>
                            </PopoverTrigger>
                            <PopoverContent open={open} contentRef={contentRef}>
                                <div className="flex flex-col gap-2 min-w-[150px]">
                                    {["ACCEPTED", "REJECTED", "PENDING"].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => {
                                                setFilterStatus(status);
                                                setOpen(false);
                                            }}
                                            className={`px-3 py-1 rounded text-left ${
                                                filterStatus === status ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"
                                            }`}
                                        >
                                            {t(`offer.status.${status.toLowerCase()}`)}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => {
                                            setFilterStatus(null);
                                            setOpen(false);
                                        }}
                                        className="px-3 py-1 rounded text-left hover:bg-gray-100"
                                    >
                                        {t("offer.filter.all")}
                                    </button>
                                    <PopoverClose setOpen={setOpen}>
                                        <span className="text-sm text-gray-600">{t("menu.close")}</span>
                                    </PopoverClose>
                                </div>
                            </PopoverContent>
                        </>
                    )}
                </Popover>

                {/* Sort */}
                <Popover>
                    {({ open, setOpen, triggerRef, contentRef }) => (
                        <>
                            <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
                                <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                                    {t("offer.sort.by")}:{" "}
                                    {sortKey === "date" ? t("offer.sort.date") : t("offer.sort.applications")}
                                </span>
                            </PopoverTrigger>
                            <PopoverContent open={open} contentRef={contentRef}>
                                <div className="flex flex-col gap-2 min-w-[150px]">
                                    <button
                                        onClick={() => {
                                            setSortKey("date");
                                            setOpen(false);
                                        }}
                                        className={`px-3 py-1 rounded text-left ${
                                            sortKey === "date" ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"
                                        }`}
                                    >
                                        {t("offer.sort.date")}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSortKey("applications");
                                            setOpen(false);
                                        }}
                                        className={`px-3 py-1 rounded text-left ${
                                            sortKey === "applications" ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"
                                        }`}
                                    >
                                        {t("offer.sort.applications")}
                                    </button>
                                    <PopoverClose setOpen={setOpen}>
                                        <span className="text-sm text-gray-600">{t("menu.close")}</span>
                                    </PopoverClose>
                                </div>
                            </PopoverContent>
                        </>
                    )}
                </Popover>

                {/* Filter by session */}
                <div className="ml-auto flex items-center gap-2">
                    <label className="text-sm font-medium">{t("offer.filter.session")}:</label>
                    <select
                        className="rounded border border-zinc-300 p-1"
                        value={filterSession}
                        onChange={(e) => setFilterSession(e.target.value)}
                    >
                        <option value="All">{t("offer.session.all")}</option>
                        <option value="Automne">{t("offer.session.autumn")}</option>
                        <option value="Hiver">{t("offer.session.winter")}</option>
                    </select>
                </div>
            </div>

            <Table
                headers={[
                    t("offer.table.offerTitle"),
                    t("offer.table.enterprise"),
                    t("offer.table.program"),
                    t("offer.table.deadline"),
                    t("offer.table.status"),
                    t("offer.table.applications"),
                    t("offer.table.actions"),
                ]}
                rows={rows}
                emptyMessage={t("offer.table.noOffers")}
            />

            <Modal
                open={!!selectedOffer}
                onClose={() => setSelectedOffer(null)}
                title={selectedOffer?.title}
            >
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <span className="font-semibold">{t("offer.table.enterprise")}:</span>
                        <span>{selectedOffer?.enterpriseName}</span>
                    </div>

                    <div className="flex gap-2">
                        <span className="font-semibold">{t("offer.table.program")}:</span>
                        <span>{selectedOffer?.targetedProgramme}</span>
                    </div>

                    <div className="flex gap-2">
                        <span className="font-semibold">{t("offer.table.deadline")}:</span>
                        <span>{new Date(selectedOffer?.expirationDate).toLocaleDateString()}</span>
                    </div>

                    <div className="flex gap-2">
                        <span className="font-semibold">{t("offer.table.status")}:</span>
                        <span>{t(`offer.status.${selectedOffer?.status?.toLowerCase()}`)}</span>
                    </div>

                    {selectedOffer?.reason && selectedOffer.reason.trim() !== "" && (
                        <div className="flex gap-2">
                            <span className="font-semibold">{t("offer.table.reason")}:</span>
                            <span>{selectedOffer.reason}</span>
                        </div>
                    )}

                    <div className="flex flex-col gap-1">
                        <span className="font-semibold">{t("offer.table.description")}:</span>
                        <p className="text-gray-800">{selectedOffer?.description || t("offer.noDescription")}</p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
