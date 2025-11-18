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
import { Modal } from "../../../components/ui/modal.jsx";
import { Phone } from "lucide-react";


export const InternshipApplicationsPhone = () => {
    const { t } = useTranslation("internship_applications");
    const user = useAuthStore((s) => s.user);
    const { applications, fetchApplications, convocations, createConvocation } = useEmployerStore();

    const previewCvForEmployer = useCvStore((s) => s.previewCvForEmployer);
    const downloadCvForEmployer = useCvStore((s) => s.downloadCvForEmployer);
    const previewUrl = useCvStore((s) => s.previewUrl);
    const previewType = useCvStore((s) => s.previewType);
    const closePreview = useCvStore((s) => s.closePreview);

    const [loading, setLoading] = useState(true);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState("");
    const [modeConvocation, setModeConvocation] = useState("");
    const [dateConvocation, setDateConvocation] = useState("");
    const [timeConvocation, setTimeConvocation] = useState("09:00");
    const [link, setLink] = useState("");
    const [location, setLocation] = useState("");

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

    const handleConvocationSend = async () => {
        if (!selectedApplication) return;
        try {
            await createConvocation({
                internshipApplicationId: selectedApplication.id,
                mode: modeConvocation,
                convocationDate: `${dateConvocation}T${timeConvocation}`,
                link,
                location,
            });
            toast.success(t("success.convocationSent"));
            setIsModalOpen(false);
            setSelectedApplication(null);
            setModeConvocation("");
            setDateConvocation("");
            setTimeConvocation("09:00");
            setLink("");
            setLocation("");
        } catch {
            toast.error(t("errors.sendConvocation"));
        }
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
                                setModalType("convocation");
                                setSelectedApplication(app);
                                setIsModalOpen(true);
                            } else {
                                toast.info(getConvocationDate(app));
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
                                <div className="flex flex-col gap-2 min-w-[150px] max-h-[200px] overflow-y-auto items-center">
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

            {modalType === "convocation" && isModalOpen && selectedApplication && (
                <Modal
                    open={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedApplication(null);
                        setModalType("");
                        setModeConvocation("");
                        setDateConvocation("");
                        setTimeConvocation("09:00");
                        setLink("");
                        setLocation("");
                    }}
                    title={
                        <div className="flex items-center gap-2">
                            <Phone className="w-5 h-5 text-blue-500" />
                            <span>{t("modal.convocationTitle")} {selectedApplication.studentFirstName} {selectedApplication.studentLastName}</span>
                        </div>
                    }
                    size="default"
                    footer={
                        <div className="flex justify-end gap-2">
                            {/* Bouton Send en bleu foncé moyen */}
                            <button
                                onClick={handleConvocationSend}
                                disabled={!dateConvocation || !timeConvocation}
                                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    dateConvocation && timeConvocation
                                        ? "bg-blue-600 text-white hover:bg-blue-500"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                            >
                                <Phone className="w-4 h-4 text-white" />
                                {t("modal.sendConvocation")}
                            </button>

                            {/* Bouton Close en rouge foncé moyen avec X blanc */}
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-red-500 text-white hover:bg-red-700"
                            >
                                <span className="font-bold text-white">X</span>
                                {t("menu.close")}
                            </button>
                        </div>
                    }


                >
                    <div className="space-y-4">
                        {/* Row 1 : Date + Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t("modal.date")}</label>
                                <input
                                    type="date"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    value={dateConvocation}
                                    onChange={(e) => setDateConvocation(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t("modal.time")}</label>
                                <input
                                    type="time"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    value={timeConvocation}
                                    onChange={(e) => setTimeConvocation(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Row 2 : Mode + Link/Location */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t("modal.mode")}</label>
                                <select
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    value={modeConvocation}
                                    onChange={(e) => setModeConvocation(e.target.value)}
                                >
                                    <option value="">{t("modal.selectMode")}</option>
                                    <option value="online">{t("modal.online")}</option>
                                    <option value="inPerson">{t("modal.inPerson")}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t("modal.linkOrLocation")}</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    value={modeConvocation === "online" ? link : location}
                                    onChange={(e) => modeConvocation === "online" ? setLink(e.target.value) : setLocation(e.target.value)}
                                    placeholder={modeConvocation === "online" ? t("modal.enterLink") : t("modal.enterLocation")}
                                />
                            </div>
                        </div>
                    </div>
                </Modal>
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
