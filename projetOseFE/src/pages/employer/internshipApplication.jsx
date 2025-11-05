import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useEmployerStore } from "../../stores/employerStore.js";
import { useCvStore } from "../../stores/cvStore.js";
import useAuthStore from "../../stores/authStore.js";
import { ReasonModal } from "../../components/ui/reason-modal.jsx";
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
    const {t} = useTranslation("internship_applications");
    const {applications, fetchApplications, approveApplication, rejectApplication} =
        useEmployerStore();
    const {
        previewUrl,
        previewType,
        previewCvForEmployer,
        downloadCvForEmployer,
        closePreview,
    } = useCvStore();
    const user = useAuthStore((s) => s.user);

    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState(null);
    const [filterSession, setFilterSession] = useState("All");
    const [filterYear, setFilterYear] = useState("All");
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
                    .map((app) => new Date(app.createdAt).getFullYear())
            )
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
    const handleRejectApplication = (application) => {
        setSelectedApplication(application);
        setIsReasonModalOpen(true);
    };

// Gestion actions (vue, téléchargement, etc.)
    const handleAction = (action, app) => {
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
        {key: "internshipOfferTitle", label: t("table.offerTitle")},
        {key: "studentName", label: t("table.studentName")},
        {key: "studentEmail", label: t("table.studentEmail")},
        {key: "status", label: t("table.status")},
        {
            key: "actions",
            label: t("table.action"),
            actions: [
                {
                    key: "view",
                    label: (
                        <> <EyeOpenIcon className="w-4 h-4"/> <span>{t("table.actionView")}</span>
                        </>
                    ),
                },
                {
                    key: "preview",
                    label: (
                        <> <FileTextIcon className="w-4 h-4"/> <span>{t("table.preview")}</span>
                        </>
                    ),
                },
                {
                    key: "download",
                    label: (
                        <> <DownloadIcon className="w-4 h-4"/> <span>{t("table.download")}</span>
                        </>
                    ),
                },
                {
                    key: "accept",
                    label: (
                        <> <CheckIcon className="w-4 h-4"/> <span>{t("table.accept")}</span>
                        </>
                    ),
                },
                {
                    key: "reject",
                    label: (
                        <> <Cross2Icon className="w-4 h-4"/> <span>{t("table.reject")}</span>
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
            .filter((app) =>
                filterStatus ? app.status === filterStatus : true
            )
            .filter((app) =>
                filterSession === "All" ? true : app.session === filterSession
            )
            .filter((app) =>
                filterYear === "All"
                    ? true
                    : app.createdAt &&
                    new Date(app.createdAt).getFullYear().toString() === filterYear
            )
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [applications, filterStatus, filterSession, filterYear]);

    const tableData = filteredApplications.map((app) => ({
        ...app,
        studentName: `${app.studentFirstName} ${app.studentLastName}`,
        rawStatus: app.status?.toLowerCase(),
        status: t(`status.${app.status?.toLowerCase()}`),
    }));

    return (
        <div className="space-y-6">
            <Header title={t("title")}/>
            {/* Filtres */}
            <div className="flex items-center gap-4">
                {/* Statut */}
                <Popover>
                    {({open, setOpen, triggerRef, contentRef}) => (
                        <>
                            <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
              <span
                  className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                {t("filter.status")}: {filterStatus || t("filter.all")}
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
                                                filterStatus === status ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"
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

                {/* Session Popover */}
                <Popover>
                    {({open, setOpen, triggerRef, contentRef}) => (
                        <>
                            <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
              <span
                  className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                {t("filter.session")}: {filterSession === "All" ? t("session.all") : t(`session.${filterSession.toLowerCase()}`)}
              </span>
                            </PopoverTrigger>
                            <PopoverContent open={open} contentRef={contentRef}>
                                <div className="flex flex-col gap-2 min-w-[150px]">
                                    {["Automne", "Hiver"].map((session) => (
                                        <button
                                            key={session}
                                            onClick={() => {
                                                setFilterSession(session);
                                                setOpen(false);
                                            }}
                                            className={`px-3 py-1 rounded text-left ${
                                                filterSession === session ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"
                                            }`}
                                        >
                                            {t(`session.${session.toLowerCase()}`)}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => {
                                            setFilterSession("All");
                                            setOpen(false);
                                        }}
                                        className="px-3 py-1 rounded text-left hover:bg-gray-100"
                                    >
                                        {t("session.all")}
                                    </button>
                                    <PopoverClose setOpen={setOpen}>
                                        <span className="text-sm text-gray-600">{t("menu.close")}</span>
                                    </PopoverClose>
                                </div>
                            </PopoverContent>
                        </>
                    )}
                </Popover>

                {/* Année Popover */}
                <Popover>
                    {({open, setOpen, triggerRef, contentRef}) => (
                        <>
                            <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
              <span
                  className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                {t("filter.year")}: {filterYear === "All" ? t("session.AllYears") : filterYear}
              </span>
                            </PopoverTrigger>
                            <PopoverContent open={open} contentRef={contentRef}>
                                <div className="flex flex-col gap-2 min-w-[150px] max-h-[300px] overflow-y-auto">
                                    {availableYears.map((year) => (
                                        <button
                                            key={year}
                                            onClick={() => {
                                                setFilterYear(year.toString());
                                                setOpen(false);
                                            }}
                                            className={`px-3 py-1 rounded text-left ${
                                                filterYear === year.toString() ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"
                                            }`}
                                        >
                                            {year}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => {
                                            setFilterYear("All");
                                            setOpen(false);
                                        }}
                                        className="px-3 py-1 rounded text-left hover:bg-gray-100"
                                    >
                                        {t("session.AllYears")}
                                    </button>
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
            <DataTable columns={columns} data={tableData} onAction={handleAction}/>

            {/* Aperçu CV */}
            {previewUrl && (
                <div className="mt-6 p-4 border-t border-gray-300 bg-gray-50 rounded">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-semibold">{t("previewCv")}</h3>
                        <button
                            className="flex items-center gap-2 px-3 py-2 text-white bg-red-500 rounded hover:bg-red-600"
                            onClick={closePreview}
                        >
                            <Cross2Icon className="w-4 h-4"/>
                            {t("closeCvPreview")}
                        </button>
                    </div>
                    {previewType === "pdf" ? (
                        <iframe src={previewUrl} className="w-full h-[600px] border" title="Preview CV"/>
                    ) : (
                        <a href={previewUrl} target="_blank" rel="noopener noreferrer"
                           className="text-blue-600 underline">
                            Ouvrir le CV
                        </a>
                    )}
                </div>
            )}

            {/* Modal View */}
            {modalType === "view" && isModalOpen && selectedApplication && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-3/4 max-w-lg">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <EyeOpenIcon className="w-5 h-5 text-blue-500"/>
                            {selectedApplication.studentFirstName} {selectedApplication.studentLastName}
                        </h2>
                        <p><strong>{t("modal.email")}:</strong> {selectedApplication.studentEmail}</p>
                        <p><strong>{t("modal.cv")}:</strong> {selectedApplication.selectedCvFileName || t("table.noCv")}
                        </p>
                        <p><strong>{t("modal.offerTitle")}:</strong> {selectedApplication.internshipOfferTitle}</p>
                        <p>
                            <strong>{t("modal.status")}:</strong> {t(`status.${selectedApplication.status?.toLowerCase()}`)}
                        </p>
                        <p>
                            <strong>{t("modal.appliedAt")}:</strong> {new Date(selectedApplication.createdAt).toLocaleDateString()}
                        </p>
                        <div className="mt-6 flex justify-end">
                            <button
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedApplication(null);
                                }}
                            >
                                <Cross2Icon className="w-4 h-4"/>
                                {t("modal.close")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Convocation */}
            {modalType === "convocation" && isModalOpen && selectedApplication && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-3/4 max-w-lg">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <PhoneCallIcon className="w-5 h-5 text-blue-500"/>
                            {"Formulaire de convocation pour "}
                            {selectedApplication.studentFirstName}{" "}
                            {selectedApplication.studentLastName}
                        </h2>

                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();

                                try {
                                    const token = localStorage.getItem("token");
                                    if (!token) {
                                        toast.error("Aucun token trouvé, veuillez vous reconnecter.");
                                        return;
                                    }

                                    const employerData = await authService.getMe(token);
                                    if (!employerData?.email) {
                                        toast.error("Impossible de récupérer l'email de l'employeur.");
                                        return;
                                    }

                                    const dateTimeConvocation = new Date(`${dateConvocation}T${timeConvocation}`).toISOString();

                                    const formData = {
                                        studentEmail: selectedApplication.studentEmail,
                                        employerEmail: employerData.email,
                                        convocationDate: dateTimeConvocation,
                                        location,
                                        link,
                                        internshipApplicationId: selectedApplication.id
                                    };

                                    console.log("FormData envoyé à Zod :", formData);
                                    const result = convocationSchema.safeParse(formData);
                                    console.log("Résultat du safeParse :", result);

                                    if (!result.success) {
                                        toast.error(result.error.errors[0]?.message || "Erreur dans le formulaire.");
                                        return;
                                    }

                                    await sendConvocation(formData)
                                    toast.success("Convocation envoyée avec succès !");
                                    setIsModalOpen(false);
                                    setSelectedApplication(null);

                                } catch (error) {
                                    console.error("Erreur lors de l'envoi de la convocation :", error);
                                    toast.error(error.message || "Erreur inconnue");
                                }
                            }}

                            className="flex flex-col gap-4"
                        >
                            <div className="flex flex-col">
                                <label className="text-sm font-medium mb-1">
                                    Date de convocation
                                </label>
                                <input
                                    type="date"
                                    min={new Date().toISOString().split("T")[0]}
                                    value={dateConvocation}
                                    onChange={(e) => setDateConvocation(e.target.value)}
                                    className="border border-gray-300 rounded p-2"
                                    required
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-sm font-medium mb-1">Heure de convocation</label>
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
                                    Type de convocation
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
                                    <option value="placeholder" >-- Sélectionner --</option>
                                    <option value="online">En ligne</option>
                                    <option value="in-person">En présentiel</option>
                                </select>
                            </div>

                            {modeConvocation === "online" && (
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium mb-1">Lien de réunion</label>
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
                                    <label className="text-sm font-medium mb-1">Lieu</label>
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
                                    Envoyer la convocation
                                </button>

                                <button
                                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setSelectedApplication(null);
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

            <ReasonModal
                open={isReasonModalOpen}
                onClose={() => setIsReasonModalOpen(false)}
                description={t("reasonModal.description")}
                onSubmit={async (reason) => {
                    try {
                        await rejectApplication(user.token, selectedApplication.id, reason);
                        toast.error(t("success.rejected"));
                        setIsReasonModalOpen(false);
                    } catch {
                        toast.error(t("errors.reject"));
                    }
                }}
            />
        </div>
    );
};



