import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useEmployerStore } from "../../stores/employerStore.js";
import { useCvStore } from "../../stores/cvStore.js";
import useAuthStore from "../../stores/authStore.js";
import { Table } from "../../components/ui/table.jsx";
import { TableActionButton } from "../../components/ui/tableActionButton.jsx";
import { Modal } from "../../components/ui/modal.jsx";
import { Header } from "../../components/ui/header.jsx";
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "../../components/ui/popover.jsx";
import {
    EyeOpenIcon,
    DownloadIcon,
    FileTextIcon,
    Cross2Icon,
    CheckIcon,
} from "@radix-ui/react-icons";
import { PhoneCallIcon, ContactIcon } from "lucide-react";
import { convocationSchema } from "../../models/convocation.js";
import { authService } from "../../services/authService.js";

export const InternshipApplications = () => {
    const { t } = useTranslation("internship_applications");
    const user = useAuthStore((s) => s.user);

    const {
        applications,
        fetchApplications,
        approveApplication,
        rejectApplication,
        fetchListConvocation,
        convocations,
        loading,
        createConvocation: sendConvocation
    } = useEmployerStore();

    const {
        previewUrl,
        previewType,
        previewCvForEmployer,
        downloadCvForEmployer,
        closePreview
    } = useCvStore();

    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("details");
    const [modalType, setModalType] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [filterStatus, setFilterStatus] = useState(null);
    const [filterSession, setFilterSession] = useState("Hiver");
    const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
    const [modeConvocation, setModeConvocation] = useState("");
    const [dateConvocation, setDateConvocation] = useState("");
    const [timeConvocation, setTimeConvocation] = useState("09:00");
    const [link, setLink] = useState("");
    const [location, setLocation] = useState("");

    useEffect(() => {
        const loadAllData = async () => {
            await fetchApplications();
            await fetchListConvocation();
        };
        loadAllData();
    }, [fetchApplications, fetchListConvocation]);

    const availableYears = useMemo(() => {
        return Array.from(
            new Set(
                applications
                    .filter((app) => app.startDate)
                    .map((app) => new Date(app.startDate).getFullYear())
            )
        ).sort((a, b) => b - a);
    }, [applications]);

    const handleApproveApplication = async (application) => {
        try {
            await approveApplication(user.token, application.id);
            toast.success(t("success.accepted"));
        } catch {
            toast.error(t("errors.accept"));
        }
    };

    const handleRejectApplication = async (reason) => {
        try {
            await rejectApplication(user.token, selectedApplication.id, reason);
            toast.success(t("success.rejected"));
            setIsModalOpen(false);
            setModalMode("details");
            setRejectReason("");
            setSelectedApplication(null);
        } catch {
            toast.error(t("errors.reject"));
        }
    };

    const handleAction = (action, app) => {
        if (action === "convocation" && app.status !== "ACCEPTED") {
            return toast.error(t("errors.convocations"));
        }
        try {
            switch (action) {
                case "preview":
                    previewCvForEmployer(app.selectedCvFileData, app.selectedCvFileName);
                    break;
                case "download":
                    downloadCvForEmployer(app.selectedCvFileData, app.selectedCvFileName);
                    break;
                case "convocation":
                    setSelectedApplication(app);
                    setIsModalOpen(true);
                    setModalType("convocation");
                    break;
                case "accept":
                    handleApproveApplication(app);
                    break;
                case "reject":
                    handleRejectApplication(app);
                    break;
                default:
                    break;
            }
        } catch (err) {
            toast.error(err.message || t("errors.downloadCv"));
        }
    };

    function isOfferedInterview(application) {
        if (!Array.isArray(convocations)) return false;
        return convocations.some((conv) => conv?.internshipApplicationId === application.id);
    }

    function getConvocationDate(application) {
        if (!Array.isArray(convocations) || convocations.length === 0) return "";
        const convocation = convocations.find((c) => c?.internshipApplicationId === application.id);
        return convocation ? new Date(convocation.convocationDate).toLocaleString() : "";
    }

    const filteredApplications = useMemo(() => {
        return applications
            .filter((app) => (filterStatus ? app.status === filterStatus : true))
            .filter((app) => (filterSession === "All" ? true : app.session === filterSession))
            .filter((app) => (filterYear === "All" ? true : new Date(app.startDate).getFullYear().toString() === filterYear))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [applications, filterStatus, filterSession, filterYear]);

    const tableRows = () => filteredApplications.map((app) => (
        <tr key={app.id} className="select-none pt-4 w-fit border-t border-gray-200 text-gray-700 text-sm">
            <td className="px-4 py-3">{app.internshipOfferTitle}</td>
            <td className="px-4 py-3">{app.studentFirstName} {app.studentLastName}</td>
            <td className="px-4 py-3">{app.studentEmail}</td>
            <td className="px-4 py-3">{new Date(app.createdAt).toLocaleDateString()} {new Date(app.createdAt).toLocaleTimeString()}</td>
            <td className="px-4 py-3 flex gap-2">
                <TableActionButton
                    icon={FileTextIcon} label={t("table.preview")}
                    bg_color={"indigo-100"} text_color={"indigo-700"}
                    onClick={() => previewCvForEmployer(app.selectedCvFileData, app.selectedCvFileName)}
                />
                <TableActionButton
                    icon={DownloadIcon} label={t("table.download")}
                    bg_color={"green-100"} text_color={"green-700"}
                    onClick={() => downloadCvForEmployer(app.selectedCvFileData, app.selectedCvFileName)}
                />
                <TableActionButton
                    icon={ContactIcon}
                    label={!isOfferedInterview(app) ? t("table.convocation") : getConvocationDate(app)}
                    bg_color={"amber-100"} text_color={"amber-700"}
                    onClick={() => { setSelectedApplication(app); setIsModalOpen(true); setModalType("convocation"); }}
                    interactive={!isOfferedInterview(app)}
                    inactive_text_color={"blue-500"}
                />
            </td>
        </tr>
    ));

    return (
        <div className="space-y-6">
            <Header title={t("title")} />

            {/* Filtres */}
            <div className="flex items-center gap-4">
                <Popover>
                    {({ open, setOpen, triggerRef, contentRef }) => (
                        <>
                            <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
                <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                  {t("filter.status")}: {filterStatus ? t(`status.${filterStatus.toLowerCase()}`) : t("filter.all")}
                </span>
                            </PopoverTrigger>
                            <PopoverContent open={open} contentRef={contentRef}>
                                <div className="flex flex-col gap-2 min-w-[150px]">
                                    {["PENDING", "ACCEPTED", "REJECTED"].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => { setFilterStatus(status); setOpen(false); }}
                                            className={`px-3 py-1 rounded text-left ${filterStatus === status ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`}
                                        >
                                            {t(`status.${status.toLowerCase()}`)}
                                        </button>
                                    ))}
                                    <button onClick={() => { setFilterStatus(null); setOpen(false); }} className="px-3 py-1 rounded text-left hover:bg-gray-100">
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

                {/* Année */}
                <Popover>
                    {({ open, setOpen, triggerRef, contentRef }) => (
                        <>
                            <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
                <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                  {t("filter.year")}: {filterYear}
                </span>
                            </PopoverTrigger>
                            <PopoverContent open={open} contentRef={contentRef}>
                                <div className="flex flex-col gap-2 min-w-[150px] max-h-[300px] overflow-y-auto items-center">
                                    {availableYears.map((year) => (
                                        <button
                                            key={year}
                                            onClick={() => { setFilterYear(year.toString()); setOpen(false); }}
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

            {/* Tableau */}
            {loading ? <p>{t("table.loading")}</p> :
                <Table
                    headers={[
                        t("table.offerTitle"),
                        t("table.studentName"),
                        t("table.studentEmail"),
                        t("table.appliedAt"),
                        t("table.action"),
                    ]}
                    rows={tableRows()}
                    emptyMessage={t("table.noApplications")}
                />
            }

            {/* Aperçu CV */}
            {previewUrl && (
                <div className="mt-6 p-4 border-t border-gray-300 bg-gray-50 rounded">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-semibold">{t("previewCv")}</h3>
                        <button className="flex items-center gap-2 px-3 py-2 text-white bg-red-500 rounded hover:bg-red-600" onClick={closePreview}>
                            <Cross2Icon className="w-4 h-4" /> {t("closeCvPreview")}
                        </button>
                    </div>
                    {previewType === "pdf" ? (
                        <iframe src={previewUrl} className="w-full h-[600px] border" title="Preview CV" />
                    ) : (
                        <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                            Ouvrir le CV
                        </a>
                    )}
                </div>

            )}
            {modalType === "convocation" && isModalOpen && selectedApplication && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-3/4 max-w-lg">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <PhoneCallIcon className="w-5 h-5 text-blue-500"/>
                            {t("convocations.title")} : {selectedApplication.studentFirstName} {selectedApplication.studentLastName}
                        </h2>

                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    const token = localStorage.getItem("token");
                                    const employerData = await authService.getMe(token);
                                    const dateTimeConvocation = `${dateConvocation}T${timeConvocation}`;

                                    const formData = {
                                        studentEmail: selectedApplication.studentEmail,
                                        employerEmail: employerData.email,
                                        convocationDate: dateTimeConvocation,
                                        location,
                                        link,
                                        internshipApplicationId: selectedApplication.id
                                    };

                                    const result = convocationSchema.safeParse(formData);
                                    if (!result.success) {
                                        toast.error(result.error.errors[0]?.message || t("errors.form"));
                                        return;
                                    }

                                    await sendConvocation(formData);
                                    toast.success(t("convocations.success"));
                                    setIsModalOpen(false);
                                    setSelectedApplication(null);
                                    setModalType(null);

                                } catch (error) {
                                    toast.error(error.message || t("convocations.unknown"));
                                }
                            }}
                            className="flex flex-col gap-4"
                        >
                            {/* Date */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium mb-1">{t("convocations.date")}</label>
                                <input
                                    type="date"
                                    min={new Date().toISOString().split("T")[0]}
                                    value={dateConvocation}
                                    onChange={(e) => setDateConvocation(e.target.value)}
                                    className="border border-gray-300 rounded p-2"
                                    required
                                />
                            </div>

                            {/* Time */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium mb-1">{t("convocations.time")}</label>
                                <input
                                    type="time"
                                    value={timeConvocation}
                                    onChange={(e) => setTimeConvocation(e.target.value)}
                                    className="border border-gray-300 rounded p-2"
                                    required
                                />
                            </div>

                            {/* Type (online / in-person) */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium mb-1">{t("convocations.type")}</label>
                                <select
                                    value={modeConvocation}
                                    onChange={(e) => {
                                        setModeConvocation(e.target.value);
                                        setLocation("");
                                        setLink("");
                                    }}
                                    className="border border-gray-300 rounded p-2"
                                    required
                                >
                                    <option value="placeholder">{t("convocations.select")}</option>
                                    <option value="online">{t("convocations.online")}</option>
                                    <option value="in-person">{t("convocations.inPerson")}</option>
                                </select>
                            </div>

                            {/* Online link */}
                            {modeConvocation === "online" && (
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium mb-1">{t("convocations.online")}</label>
                                    <input
                                        type="url"
                                        placeholder="https://meet.google.com/..."
                                        value={link}
                                        onChange={(e) => setLink(e.target.value)}
                                        className="border border-gray-300 rounded p-2"
                                        required
                                    />
                                </div>
                            )}

                            {/* In-person location */}
                            {modeConvocation === "in-person" && (
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium mb-1">{t("convocations.address")}</label>
                                    <input
                                        type="text"
                                        placeholder="Ex : 1111 Rue Lapierre"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="border border-gray-300 rounded p-2"
                                        required
                                    />
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex mt-6 justify-end gap-3">
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    <PhoneCallIcon className="w-4 h-4" />
                                    {t("modal.submit")}
                                </button>

                                <button
                                    type="button"
                                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setSelectedApplication(null);
                                        setModalType(null);
                                    }}
                                >
                                    <Cross2Icon className="w-4 h-4" />
                                    {t("modal.close")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};