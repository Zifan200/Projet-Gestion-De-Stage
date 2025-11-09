import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useEmployerStore } from "../../stores/employerStore.js";
import { useCvStore } from "../../stores/cvStore.js";
import useAuthStore from "../../stores/authStore.js";
import { Modal } from "../../components/ui/modal.jsx";
import { DataTable } from "../../components/ui/data-table.jsx";
import { Header } from "../../components/ui/header.jsx";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverClose,
} from "../../components/ui/popover.jsx";
import {
    EyeOpenIcon,
    DownloadIcon,
    FileTextIcon,
    Cross2Icon,
    CheckIcon,
} from "@radix-ui/react-icons";

import {PhoneCallIcon} from "lucide-react";
import {convocationSchema} from "../../models/convocation.js";
import {authService} from "../../services/authService.js";

export const InternshipApplications = () => {
    const { t } = useTranslation("internship_applications");
    const {
        applications,
        fetchApplications,
        approveApplication,
        rejectApplication,
    } = useEmployerStore();
    const {
        previewUrl,
        previewType,
        previewCvForEmployer,
        downloadCvForEmployer,
        closePreview,
    } = useCvStore();
    const user = useAuthStore((s) => s.user);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const currentSession = currentMonth >= 1 && currentMonth <= 6 ? "Hiver" : "Automne";

    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("details");
    const [rejectReason, setRejectReason] = useState("");
    const [filterStatus, setFilterStatus] = useState(null);
    const [filterSession, setFilterSession] = useState("Hiver");
    const [filterYear, setFilterYear] = useState(currentYear.toString());
    const {createConvocation: sendConvocation} = useEmployerStore();
    const [modalType, setModalType] = useState(null);
    const [dateConvocation, setDateConvocation] = useState("");
    const [modeConvocation, setModeConvocation] = useState("");
    const [location, setLocation] = useState("");
    const [link, setLink] = useState("");
    const [timeConvocation, setTimeConvocation] = useState("09:00");

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    // Extraire les années disponibles à partir des candidatures
    const availableYears = useMemo(() => {
        return Array.from(
            new Set(
                applications
                    .filter((app) => app.createdAt)
                    .map((app) => new Date(app.createdAt).getFullYear()),
            ),
        ).sort((a, b) => b - a);
    }, [applications]);

    // Gestion acceptation
    const handleApproveApplication = async (application) => {
        try {
            await approveApplication(user.token, application.id);
            toast.success(t("success.accepted"));
        } catch {
            toast.error(t("errors.accept"));
        }
    };

    // Gestion rejet
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

// Gestion actions (vue, téléchargement, etc.)
    const handleAction = (action, app) => {

        if (action === "convocation" && app.status !== "ACCEPTED") {
            return toast.error(t("errors.convocations"))
        }

        try {
            switch (action) {
                case "view":
                    setSelectedApplication(app);
                    setIsModalOpen(true);
                    break;
                case "preview":
                    previewCvForEmployer(app.selectedCvFileData, app.selectedCvFileName);
                    break;
                case "download":
                    downloadCvForEmployer(app.selectedCvFileData, app.selectedCvFileName);
                    break;
                case "convocation" :
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

    // Colonnes du tableau
    const columns = [
        { key: "internshipOfferTitle", label: t("table.offerTitle") },
        { key: "studentName", label: t("table.studentName") },
        { key: "studentEmail", label: t("table.studentEmail") },
        {
            key: "status",
            label: t("table.status"),
            format: (status) => t(`status.${status?.toLowerCase()}`),
        },
        {
            key: "actions",
            label: t("table.action"),
            actions: [
                {
                    key: "view",
                    label: (
                        <>
                            {" "}
                            <EyeOpenIcon className="w-4 h-4" />{" "}
                            <span>{t("table.actionView")}</span>
                        </>
                    ),
                },
                {
                    key: "preview",
                    label: (
                        <>
                            {" "}
                            <FileTextIcon className="w-4 h-4" />{" "}
                            <span>{t("table.preview")}</span>
                        </>
                    ),
                },
                {
                    key: "download",
                    label: (
                        <>
                            {" "}
                            <DownloadIcon className="w-4 h-4" />{" "}
                            <span>{t("table.download")}</span>
                        </>
                    ),
                },
                {
                    key: "convocation",
                    label: (
                        <>
                            <PhoneCallIcon className="w-4 h-4"/>
                            <span>{t("table.convocation")}</span>
                        </>
                    )
                }
            ],
        },
    ];

    // Filtrage + tri
    const filteredApplications = useMemo(() => {
        return applications
            .filter((app) => (filterStatus ? app.status === filterStatus : true))
            .filter((app) => app.session === filterSession)
            .filter(
                (app) =>
                    app.createdAt &&
                    new Date(app.createdAt).getFullYear().toString() === filterYear
            )
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [applications, filterStatus, filterSession, filterYear]);

    const tableData = filteredApplications.map((app) => ({
        ...app,
        studentName: `${app.studentFirstName} ${app.studentLastName}`,
        rawStatus: app.status?.toLowerCase(),
    }));

    return (
        <div className="space-y-6">
            <Header title={t("title")} />
            {/* Filtres */}
            <div className="flex items-center gap-4">
                {/* Statut */}
                <Popover>
                    {({ open, setOpen, triggerRef, contentRef }) => (
                        <>
                            <PopoverTrigger
                                open={open}
                                setOpen={setOpen}
                                triggerRef={triggerRef}
                            >
                <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                  {t("filter.status")}: {filterStatus ? t(`status.${filterStatus.toLowerCase()}`) : t("filter.all")}
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
                    <span className="text-sm text-gray-600">
                      {t("menu.close")}
                    </span>
                                    </PopoverClose>
                                </div>
                            </PopoverContent>
                        </>
                    )}
                </Popover>

                {/* Annee */}
                {/*<Popover>
                    {({ open, setOpen, triggerRef, contentRef }) => (
                        <>
                            <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
        <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
          {t("filter.session")}: {t(`session.${filterSession.toLowerCase()}`)}
        </span>
                            </PopoverTrigger>
                            <PopoverContent open={open} contentRef={contentRef}>
                                <div className="flex flex-col gap-2 min-w-[150px] items-center">
                                    {["Automne", "Hiver"].map((session) => (
                                        <button
                                            key={session}
                                            onClick={() => {
                                                setFilterSession(session);
                                                setOpen(false);
                                            }}
                                            className={`px-4 py-2 rounded text-center w-full ${
                                                filterSession === session
                                                    ? "bg-blue-100 font-semibold"
                                                    : "hover:bg-gray-100"
                                            }`}
                                        >
                                            {t(`session.${session.toLowerCase()}`)}
                                        </button>
                                    ))}
                                    <PopoverClose setOpen={setOpen}>
                                        <span className="text-sm text-gray-600">{t("menu.close")}</span>
                                    </PopoverClose>
                                </div>
                            </PopoverContent>
                        </>
                    )}
                </Popover>*/}


                {/* Session */}
                <Popover>
                    {({ open, setOpen, triggerRef, contentRef }) => (
                        <>
                            <PopoverTrigger
                                open={open}
                                setOpen={setOpen}
                                triggerRef={triggerRef}
                            >
        <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
          {t("filter.year")}: {filterYear}
        </span>
                            </PopoverTrigger>
                            <PopoverContent open={open} contentRef={contentRef}>
                                <div
                                    className="flex flex-col gap-2 min-w-[150px] max-h-[300px] overflow-y-auto items-center">
                                    {availableYears.map((year) => (
                                        <button
                                            key={year}
                                            onClick={() => {
                                                setFilterYear(year.toString());
                                                setOpen(false);
                                            }}
                                            className={`px-3 py-1 rounded text-left ${
                                                filterYear === year.toString()
                                                    ? "bg-blue-100 font-semibold"
                                                    : "hover:bg-gray-100"
                                            }`}
                                        >
                                            {year}
                                        </button>
                                    ))}
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

            </div>

            {/* Tableau */}
            <DataTable columns={columns} data={tableData} onAction={handleAction} />

            {/* Aperçu du CV */}
            {previewUrl && (
                <div className="mt-6 p-4 border-t border-gray-300 bg-gray-50 rounded">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-semibold">{t("previewCv")}</h3>
                        <button
                            className="flex items-center gap-2 px-3 py-2 text-white bg-red-500 rounded hover:bg-red-600"
                            onClick={closePreview}
                        >
                            <Cross2Icon className="w-4 h-4" />
                            {t("closeCvPreview")}
                        </button>
                    </div>
                    {previewType === "pdf" ? (
                        <iframe
                            src={previewUrl}
                            className="w-full h-[600px] border"
                            title="Preview CV"
                        />
                    ) : (
                        <a
                            href={previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                        >
                            Ouvrir le CV
                        </a>
                    )}
                </div>
            )}

            {selectedApplication && isModalOpen && modalType !== "convocation" && (
                <Modal
                    open={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setModalMode("details");
                        setRejectReason("");
                        setSelectedApplication(null);
                    }}
                    title={
                        modalMode === "details"
                            ? selectedApplication
                                ? `${selectedApplication.studentFirstName} ${selectedApplication.studentLastName}`
                                : ""
                            : t("reasonModal.title")
                    }
                    size="default"
                    footer={
                        modalMode === "details" ? (
                            <>
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setModalMode("details");
                                        setSelectedApplication(null);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                                >
                                    <span>{t("modal.close")}</span>
                                </button>
                                {selectedApplication?.status === "PENDING" && (
                                    <>
                                        <button
                                            onClick={() => setModalMode("reject")}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-red-100 text-red-700 hover:bg-red-200"
                                        >
                                            <Cross2Icon className="w-4 h-4" />
                                            <span>{t("table.reject")}</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleApproveApplication(selectedApplication);
                                                setIsModalOpen(false);
                                                setModalMode("details");
                                                setSelectedApplication(null);
                                            }}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                        >
                                            <CheckIcon className="w-4 h-4" />
                                            <span>{t("table.accept")}</span>
                                        </button>
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        setModalMode("details");
                                        setRejectReason("");
                                    }}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                                >
                                    <span>{t("reasonModal.cancel")}</span>
                                </button>
                                <button
                                    onClick={() => {
                                        if (!rejectReason.trim()) {
                                            toast.error(t("reasonModal.errorEmpty"));
                                            return;
                                        }
                                        handleRejectApplication(rejectReason);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-red-100 text-red-700 hover:bg-red-200"
                                >
                                    <span>{t("reasonModal.confirm")}</span>
                                </button>
                            </>
                        )
                    }
                >
                    {modalMode === "details" && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                        {t("modal.email")}
                                    </h3>
                                    <p className="text-gray-600">
                                        {selectedApplication.studentEmail}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                        {t("modal.cv")}
                                    </h3>
                                    <p className="text-gray-600">
                                        {selectedApplication.selectedCvFileName || t("table.noCv")}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                        {t("modal.offerTitle")}
                                    </h3>
                                    <p className="text-gray-600">
                                        {selectedApplication.internshipOfferTitle}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                        {t("modal.status")}
                                    </h3>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                            selectedApplication.status === "ACCEPTED"
                                                ? "bg-green-100 text-green-800"
                                                : selectedApplication.status === "REJECTED"
                                                    ? "bg-red-100 text-red-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                        }`}
                                    >
                            {t(`status.${selectedApplication.status?.toLowerCase()}`)}
                        </span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    {t("modal.appliedAt")}
                                </h3>
                                <p className="text-gray-600">
                                    {new Date(selectedApplication.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    )}

                    {modalMode === "reject" && (
                        <div className="space-y-4">
                            <p className="text-gray-600">{t("reasonModal.description")}</p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t("reasonModal.label")}
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder={t("reasonModal.placeholder")}
                                    className="w-full min-h-[150px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                            </div>
                        </div>
                    )}
                </Modal>
            )}

            {modalType === "convocation" && isModalOpen && selectedApplication && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-3/4 max-w-lg">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <PhoneCallIcon className="w-5 h-5 text-blue-500"/>
                            {t("convocations.title")}
                            {selectedApplication.studentFirstName}{" "}
                            {selectedApplication.studentLastName}
                        </h2>

                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();

                                try {
                                    const token = localStorage.getItem("token");
                                    if (!token) {
                                        toast.error(t(errors.noToken));
                                        return;
                                    }

                                    const employerData = await authService.getMe(token);
                                    if (!employerData?.email) {
                                        toast.error(t("errors.noAccessibleEmployerData"));
                                        return;
                                    }

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
                                    toast.success(t("convocations.success"));
                                    await sendConvocation(formData)
                                    setIsModalOpen(false);
                                    setSelectedApplication(null);
                                    setModalType(null);

                                } catch (error) {
                                    toast.error(error.message || t("convocation.unknown"));
                                }
                            }}
                            className="flex flex-col gap-4"
                        >
                            <div className="flex flex-col">
                                <label className="text-sm font-medium mb-1">
                                    {t("convocations.date")}
                                </label>
                                <input
                                    type="date"
                                    min={new Date().toString().split("T")[0]}
                                    value={dateConvocation}
                                    onChange={(e) => setDateConvocation(e.target.value)}
                                    className="border border-gray-300 rounded p-2"
                                    required
                                />
                            </div>

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

                            <div className="flex flex-col">
                                <label className="text-sm font-medium mb-1">
                                    {t("convocations.type")}
                                </label>
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
                                    <option value="placeholder" >{t("convocations.select")}</option>
                                    <option value="online">{t("convocations.online")}</option>
                                    <option value="in-person">{t("convocations.inPerson")}</option>
                                </select>
                            </div>

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
    )
}
