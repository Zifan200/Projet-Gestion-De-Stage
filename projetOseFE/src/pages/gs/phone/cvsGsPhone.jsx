import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import useGeStore from "../../../stores/geStore.js";
import { Table } from "../../../components/ui/table.jsx";
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "../../../components/ui/popover.jsx";
import { EyeOpenIcon, DownloadIcon, CheckIcon, Cross2Icon } from "@radix-ui/react-icons";

export const CvsGsPhone = () => {
    const { t } = useTranslation("gs_dashboard_manage_cvs");
    const { cvs, loadAllsStudentCvs, approveCv, rejectCv, downloadCv } = useGeStore();

    const [filterStatus, setFilterStatus] = useState(null);

    useEffect(() => {
        loadAllsStudentCvs();
    }, []);

    const sortedAndFilteredCvs = useMemo(() => {
        const order = { PENDING: 1, ACCEPTED: 2, REJECTED: 3 };
        const filtered = filterStatus
            ? cvs.filter((cv) => cv.status === filterStatus)
            : cvs;
        return [...filtered].sort((a, b) => order[a.status] - order[b.status]);
    }, [cvs, filterStatus]);

    const handlePreview = (cv) => {
        if (cv.fileType === "application/pdf") {
            // Ajouter la logique de preview si besoin
        } else handleDownload(cv);
    };

    const handleDownload = async (cv) => {
        await downloadCv(cv.id, { preview: false, fileName: cv.fileName });
    };

    const handleAccept = async (cv) => {
        await approveCv(cv.id);
    };

    const handleReject = async (cv) => {
        await rejectCv(cv.id, "No reason provided"); // simplifié
    };

    const rows = sortedAndFilteredCvs.map((cv) => (
        <tr key={cv.id} className="border-t border-gray-200 text-gray-700 text-sm">
            <td className="px-4 py-3">
                {cv.firstName && cv.lastName ? `${cv.firstName} ${cv.lastName}` : t("unknownStudent")}
            </td>
            <td className="px-4 py-3">{new Date(cv.uploadedAt).toLocaleDateString()}</td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <button onClick={() => handlePreview(cv)} className="p-2 bg-indigo-100 text-indigo-700 rounded">
                        <EyeOpenIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDownload(cv)} className="p-2 bg-green-100 text-green-700 rounded">
                        <DownloadIcon className="w-4 h-4" />
                    </button>
                    {cv.status === "PENDING" && (
                        <>
                            <button onClick={() => handleAccept(cv)} className="p-2 bg-emerald-100 text-emerald-700 rounded">
                                <CheckIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleReject(cv)} className="p-2 bg-red-100 text-red-700 rounded">
                                <Cross2Icon className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
            </td>
        </tr>
    ));

    return (
        <div className="space-y-4 mt-8">
            <h1 className="text-xl font-semibold">{t("title")}</h1>

            {/* Filtre */}
            <Popover>
                {({ open, setOpen, triggerRef, contentRef }) => (
                    <>
                        <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
                            <span className="px-3 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                                {filterStatus ? t(`status.${filterStatus.toLowerCase()}`) : t("filter.all")}
                            </span>
                        </PopoverTrigger>

                        <PopoverContent open={open} contentRef={contentRef}>
                            <div className="flex flex-col gap-2 min-w-[120px]">
                                {["PENDING", "ACCEPTED", "REJECTED"].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => {
                                            setFilterStatus(status);
                                            setOpen(false);
                                        }}
                                        className={`px-2 py-1 rounded text-left ${filterStatus === status ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`}
                                    >
                                        {t(`status.${status.toLowerCase()}`)}
                                    </button>
                                ))}
                                <button
                                    onClick={() => {
                                        setFilterStatus(null);
                                        setOpen(false);
                                    }}
                                    className="px-2 py-1 rounded text-left hover:bg-gray-100"
                                >
                                    {t("filter.all")}
                                </button>
                                <PopoverClose setOpen={setOpen}>
                                    <span className="text-sm text-gray-600">{t("menu.close")}</span>
                                </PopoverClose>
                            </div>
                        </PopoverContent>
                    </>
                )}
            </Popover>

            {/* Tableau simplifié */}
            <Table
                headers={[t("table.student"), t("table.date"), t("table.actions")]}
                rows={rows}
                emptyMessage={t("empty")}
            />
        </div>
    );
};
