import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useCvStore } from "../../../stores/cvStore.js";
import { toast } from "sonner";
import PdfViewer from "../../../components/CvViewer.jsx";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverClose,
} from "../../../components/ui/popover.jsx";
import { EyeOpenIcon, DownloadIcon, TrashIcon } from "@radix-ui/react-icons";
import useAuthStore from "../../../stores/authStore.js";

export const CvsPhone = () => {
    const { t } = useTranslation("student_dashboard_cvs");
    const { cvs, loadCvs, uploadCv, downloadCv, deleteCv } = useCvStore();
    const user = useAuthStore((s) => s.user);

    const [previewId, setPreviewId] = useState(null);
    const [filterStatus, setFilterStatus] = useState(null);

    useEffect(() => {
        if (user?.role === "STUDENT") {
            loadCvs();
        }
    }, [user]);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const alreadyExists = cvs.some(
            (cv) =>
                cv.fileName.trim().toLowerCase() === file.name.trim().toLowerCase(),
        );

        if (alreadyExists) {
            toast.error(t("errors.fileExists", { fileName: file.name }));
            e.target.value = "";
            return;
        }

        try {
            await uploadCv(file);
            toast.success(t("success.uploadCv", { fileName: file.name }));
        } catch {
            toast.error(t("errors.uploadCv"));
        }
    };

    const handlePreview = (cv) => {
        if (cv.fileType === "application/pdf") {
            setPreviewId(cv.id);
        } else {
            toast.error(t("errors.previewNotSupported"));
        }
    };

    const getFriendlyType = (mime) => {
        switch (mime) {
            case "application/pdf":
                return "PDF (.pdf)";
            case "application/msword":
                return "Word 97-2003 (.doc)";
            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                return "Word (.docx)";
            default:
                return mime || "Inconnu";
        }
    };

    const sortedAndFilteredCvs = useMemo(() => {
        const filtered = filterStatus
            ? cvs.filter((cv) => cv.status === filterStatus)
            : cvs;
        return [...filtered].sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    }, [cvs, filterStatus]);

    return (
        <div className="space-y-4 p-2 mt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{t("myCvs")}</h2>
                <label className="cursor-pointer px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium">
                    {t("addCv")}
                    <input
                        type="file"
                        className="hidden"
                        onChange={handleUpload}
                    />
                </label>
            </div>

            {/* Filter popover - même logique que Desktop */}
            <Popover>
                {({ open, setOpen, triggerRef, contentRef }) => (
                    <>
                        <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
              <span className="px-3 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition text-sm">
                {t("filter.status")}:{" "}
                  {filterStatus
                      ? t(`status.${filterStatus.toLowerCase()}`)
                      : t("filter.all")}
              </span>
                        </PopoverTrigger>
                        <PopoverContent open={open} contentRef={contentRef}>
                            <div className="flex flex-col gap-2 min-w-[150px]">
                                {["PENDING", "ACCEPTED", "REJECTED"].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => {
                                            setFilterStatus(status);
                                            setOpen(false);
                                        }}
                                        className={`px-3 py-1 rounded text-left ${
                                            filterStatus === status
                                                ? "bg-blue-100 font-semibold"
                                                : "hover:bg-gray-100"
                                        }`}
                                    >
                                        {t(`status.${status.toLowerCase()}`)}
                                    </button>
                                ))}
                                <button
                                    onClick={() => {
                                        setFilterStatus(null);
                                        setOpen(false);
                                    }}
                                    className="px-3 py-1 rounded text-left hover:bg-gray-100"
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

            {/* Table simplifiée pour téléphone */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full text-sm text-left text-gray-700">
                    <thead className="bg-gray-50 text-xs uppercase font-medium text-gray-600">
                    <tr>
                        <th className="px-3 py-2">{t("table.type")}</th>
                        <th className="px-3 py-2">{t("table.date")}</th>
                        <th className="px-3 py-2 text-center">{t("table.actions")}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sortedAndFilteredCvs.length > 0 ? (
                        sortedAndFilteredCvs.map((cv) => (
                            <tr key={cv.id} className="border-t border-gray-200">
                                <td className="px-3 py-2 truncate max-w-[120px]">{cv.fileName}</td>
                                <td className="px-3 py-2">
                                    {new Date(cv.uploadedAt).toLocaleDateString()}
                                </td>
                                <td className="px-3 py-2">
                                    <div className="flex justify-center gap-2">
                                        <button
                                            onClick={() => handlePreview(cv)}
                                            className="p-2 rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition"
                                        >
                                            <EyeOpenIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => downloadCv(cv.id, cv.fileName)}
                                            className="p-2 rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition"
                                        >
                                            <DownloadIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteCv(cv.id)}
                                            className="p-2 rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="px-3 py-4 text-center text-gray-500">
                                {t("noCvs")}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {previewId && (
                <div className="mt-3">
                    <div className="flex justify-end mb-2">
                        <button
                            onClick={() => setPreviewId(null)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                            {t("actions.close")}
                        </button>
                    </div>
                    <PdfViewer cvId={previewId} role="student" />
                </div>
            )}
        </div>
    );
};
