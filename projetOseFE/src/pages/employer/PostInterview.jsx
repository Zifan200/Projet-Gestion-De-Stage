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
    EyeOpenIcon,
    DownloadIcon,
    FileTextIcon,
    Cross2Icon,
    CheckIcon,
} from "@radix-ui/react-icons";
import { PhoneCallIcon } from "lucide-react";

import { convocationSchema } from "../../models/convocation.js";
import { authService } from "../../services/authService.js";

export const PostInterview = () => {
    const { t } = useTranslation("internship_applications");
    const {
        applications,
        fetchApplications,
        approveApplication,
        rejectApplication,
        createConvocation: sendConvocation,
    } = useEmployerStore();
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
    const [modalMode, setModalMode] = useState("details");
    const [modalType, setModalType] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [filterStatus, setFilterStatus] = useState(null);
    const [filterSession, setFilterSession] = useState("All");
    const [filterYear, setFilterYear] = useState("All");
    const [dateConvocation, setDateConvocation] = useState("");
    const [modeConvocation, setModeConvocation] = useState("");
    const [location, setLocation] = useState("");
    const [link, setLink] = useState("");
    const [timeConvocation, setTimeConvocation] = useState("09:00");

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    // Extraire les années disponibles
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

    // Gestion actions
    // Gestion actions (vue, téléchargement, etc.)
    const handleAction = (action, app) => {
        console.log("👉 Action déclenchée :", action, app); // pour debug

        try {
            switch (action) {
                case "view":
                    console.log("🟢 Bouton VIEW cliqué !");
                    setSelectedApplication(app);
                    setIsModalOpen(true);
                    setModalType(null);
                    break;

                case "preview":
                    console.log("📄 Prévisualisation du CV");
                    previewCvForEmployer(app.selectedCvFileData, app.selectedCvFileName);
                    break;

                case "download":
                    console.log("⬇️ Téléchargement du CV");
                    downloadCvForEmployer(app.selectedCvFileData, app.selectedCvFileName);
                    break;

                case "convocation":
                    console.log("📞 Convocation du candidat");
                    setSelectedApplication(app);
                    setIsModalOpen(true);
                    setModalType("convocation");
                    break;

                default:
                    console.warn("⚠️ Action inconnue :", action);
                    break;
            }
        } catch (err) {
            console.error("❌ Erreur dans handleAction :", err);
            toast.error(t("errors.action"));
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
                            <EyeOpenIcon className="w-4 h-4" /> {t("table.actionView")}
                        </>
                    ),
                },
                {
                    key: "preview",
                    label: (
                        <>
                            <FileTextIcon className="w-4 h-4" /> {t("table.preview")}
                        </>
                    ),
                },
                {
                    key: "download",
                    label: (
                        <>
                            <DownloadIcon className="w-4 h-4" /> {t("table.download")}
                        </>
                    ),
                },
                {
                    key: "convocation",
                    label: (
                        <>
                            <PhoneCallIcon className="w-4 h-4" /> {t("table.convocation")}
                        </>
                    ),
                },
            ],
        },
    ];

    // Filtrage + tri
    const filteredApplications = useMemo(() => {
        return applications
            .filter((app) => (filterStatus ? app.status === filterStatus : true))
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
    }));

    // --- Rendu principal ---
    return (
        <div className="space-y-6">
            <Header title={t("title")} />

            {/* Filtres */}
            {/* (Your filter popovers here — unchanged from your version) */}

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

            {/* Modal de détails ("View") */}
            {isModalOpen && modalType === null && selectedApplication && (
                <Modal
                    title={t("details.title")}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedApplication(null);
                    }}
                >
                    <div className="space-y-4">
                        <p>
                            <strong>{t("details.offerTitle")}:</strong>{" "}
                            {selectedApplication.internshipOfferTitle}
                        </p>
                        <p>
                            <strong>{t("details.studentName")}:</strong>{" "}
                            {selectedApplication.studentFirstName}{" "}
                            {selectedApplication.studentLastName}
                        </p>
                        <p>
                            <strong>{t("details.studentEmail")}:</strong>{" "}
                            {selectedApplication.studentEmail}
                        </p>
                        <p>
                            <strong>{t("details.status")}:</strong>{" "}
                            {t(`status.${selectedApplication.status.toLowerCase()}`)}
                        </p>
                        <p>
                            <strong>{t("details.session")}:</strong>{" "}
                            {selectedApplication.session || "-"}
                        </p>
                        <p>
                            <strong>{t("details.createdAt")}:</strong>{" "}
                            {new Date(selectedApplication.createdAt).toLocaleDateString()}
                        </p>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => handleApproveApplication(selectedApplication)}
                                className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                <CheckIcon className="w-4 h-4" /> {t("buttons.accept")}
                            </button>

                            <button
                                onClick={() => {
                                    setModalMode("reject");
                                    setModalType("reject");
                                }}
                                className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                <Cross2Icon className="w-4 h-4" /> {t("buttons.reject")}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
            {/* Modal de rejet ("Reject") */}
            {isModalOpen && modalType === "reject" && selectedApplication && (
                <Modal
                    title={t("reject.title")}
                    onClose={() => {
                        setIsModalOpen(false);
                        setModalMode("details");
                        setModalType(null);
                        setRejectReason("");
                    }}
                >
                    <div className="space-y-4">
                        <p>
                            {t("reject.confirmMessage", {
                                student: `${selectedApplication.studentFirstName} ${selectedApplication.studentLastName}`,
                            })}
                        </p>

                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder={t("reject.placeholder")}
                            className="w-full border border-gray-300 rounded-lg p-2 min-h-[100px]"
                        />

                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => {
                                    setModalType(null);
                                    setModalMode("details");
                                }}
                                className="px-3 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                {t("buttons.back")}
                            </button>

                            <button
                                onClick={() => handleRejectApplication(rejectReason)}
                                className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                disabled={!rejectReason.trim()}
                            >
                                <Cross2Icon className="w-4 h-4" /> {t("buttons.confirmReject")}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}


        </div>

    );
};
