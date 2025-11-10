import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useEmployerStore } from "../../../stores/employerStore.js";
import { useCvStore } from "../../../stores/cvStore.js";
import useAuthStore from "../../../stores/authStore.js";
import { Table } from "../../../components/ui/table.jsx";
import { TableActionButton } from "../../../components/ui/tableActionButton.jsx";
import { FileTextIcon, DownloadIcon } from "@radix-ui/react-icons";
import { ContactIcon } from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "../../../components/ui/popover.jsx";

export const InternshipApplicationsPhone = () => {
    const { t } = useTranslation("internship_applications");
    const user = useAuthStore((s) => s.user);
    const { applications, fetchApplications, convocations } = useEmployerStore();

    const previewCvForEmployer = useCvStore((s) => s.previewCvForEmployer);
    const downloadCvForEmployer = useCvStore((s) => s.downloadCvForEmployer);
    const previewUrl = useCvStore((s) => s.previewUrl);
    const previewType = useCvStore((s) => s.previewType);
    const closePreview = useCvStore((s) => s.closePreview);

    const [loading, setLoading] = useState(true);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());

    useEffect(() => {
        const loadApplications = async () => {
            try {
                await fetchApplications();
            } catch (err) {
                toast.error(t("errors.loadApplications"));
            } finally {
                setLoading(false);
            }
        };
        loadApplications();
    }, [fetchApplications, t]);

    const availableYears = useMemo(() => {
        return Array.from(
            new Set(applications.map((app) => new Date(app.startDate).getFullYear()))
        ).sort((a, b) => b - a);
    }, [applications]);

    const filteredApplications = useMemo(() => {
        return applications.filter(
            (app) =>
                filterYear === "All" ||
                new Date(app.startDate).getFullYear().toString() === filterYear
        );
    }, [applications, filterYear]);

    const isOfferedInterview = (application) => {
        if (!Array.isArray(convocations)) return false;
        return convocations.some((conv) => conv?.internshipApplicationId === application.id);
    };

    const getConvocationDate = (application) => {
        const conv = convocations.find((c) => c?.internshipApplicationId === application.id);
        return conv ? new Date(conv.convocationDate).toLocaleString() : "";
    };

    const tableRows = () =>
        filteredApplications.map((app) => (
            <tr key={app.id} className="select-none border-t border-gray-200 text-gray-700 text-sm">
                <td className="px-2 py-2">{app.internshipOfferTitle}</td>
                <td className="px-2 py-2">{app.studentFirstName} {app.studentLastName}</td>
                <td className="px-2 py-2 flex gap-1 flex-wrap">
                    <TableActionButton
                        icon={FileTextIcon}
                        label={t("table.preview")}
                        bg_color="indigo-100"
                        text_color="indigo-700"
                        onClick={() => {
                            setSelectedApplication(app);
                            previewCvForEmployer(app.selectedCvFileData, app.selectedCvFileName);
                        }}
                    />
                    <TableActionButton
                        icon={DownloadIcon}
                        label={t("table.download")}
                        bg_color="green-100"
                        text_color="green-700"
                        onClick={() => downloadCvForEmployer(app.selectedCvFileData, app.selectedCvFileName)}
                    />
                    <TableActionButton
                        icon={ContactIcon}
                        label={!isOfferedInterview(app) ? t("table.convocation") : getConvocationDate(app)}
                        bg_color="amber-100"
                        text_color="amber-700"
                        interactive={!isOfferedInterview(app)}
                        inactive_text_color="blue-500"
                        onClick={() => {
                            if (!isOfferedInterview(app)) {
                                toast.info(t("table.convocationPending"));
                            }
                        }}
                    />
                </td>
            </tr>
        ));

    return (
        <div className="w-full max-w-[430px] mx-auto p-2 pt-6 space-y-4">
            <h1 className="text-xl font-semibold mb-4">{t("title")}</h1>

            {/* Filtrage par année */}
            <div className="flex items-center gap-2 mb-2">
                <Popover>
                    {({ open, setOpen, triggerRef, contentRef }) => (
                        <>
                            <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
                                <span className="px-3 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                                    {t("filter.year")}: {filterYear}
                                </span>
                            </PopoverTrigger>
                            <PopoverContent open={open} contentRef={contentRef}>
                                <div
                                    className="flex flex-col gap-2 min-w-[150px] max-h-[200px] overflow-y-auto items-center">
                                    {availableYears.map((year) => (
                                        <button
                                            key={year}
                                            onClick={() => {
                                                setFilterYear(year.toString());
                                                setOpen(false);
                                            }}
                                            className={`px-3 py-1 rounded text-left ${filterYear === year.toString() ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`}
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

            {loading ? (
                <p>{t("table.loading")}</p>
            ) : (
                <div className="overflow-x-auto">
                    <Table
                        headers={[t("table.offerTitle"), t("table.studentName"), t("table.action")]}
                        rows={tableRows()}
                        emptyMessage={t("table.noApplications")}
                    />
                </div>
            )}

            {/* Preview CV modal responsive */}
            {previewUrl && selectedApplication && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
                    <div className="bg-white rounded-lg w-full max-w-[400px] max-h-[80vh] overflow-auto p-4 relative">
                        <h2 className="text-lg font-semibold mb-2">
                            {selectedApplication.studentFirstName} {selectedApplication.studentLastName} - {t("previewCv")}
                        </h2>
                        <button
                            className="absolute top-2 right-2 text-white bg-red-500 rounded px-2 py-1 hover:bg-red-600"
                            onClick={() => { closePreview(); setSelectedApplication(null); }}
                        >
                            X
                        </button>
                        {previewType === "pdf" ? (
                            <iframe src={previewUrl} className="w-full h-[60vh] sm:h-[80vh] border" title="Preview CV" />
                        ) : (
                            <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                {t("openCv")}
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
