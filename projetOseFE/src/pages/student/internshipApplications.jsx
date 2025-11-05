import { useTranslation } from "react-i18next";
import { useStudentStore } from "../../stores/studentStore.js";
import React, { useEffect, useMemo, useState } from "react";
import useAuthStore from "../../stores/authStore.js";
import { useNavigate } from "react-router-dom";
import { Header } from "../../components/ui/header.jsx";
import { useOfferStore } from "../../stores/offerStore.js";
import { toast } from "sonner";
import { DataTable } from "../../components/ui/data-table.jsx";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "../../components/ui/popover.jsx";
import { DownloadIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { Modal } from "../../components/ui/modal.jsx";

export const StudentApplications = () => {
    const { t } = useTranslation("student_dashboard_applications");
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const { applications, loadAllApplications, loadApplicationsByStatus, loading} = useStudentStore();
    const { downloadOfferPdf } = useOfferStore();

    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterEmployerDecision, setFilterEmployerDecision] = useState(null);
    const [filterMyDecision, setFilterMyDecision] = useState(null);
    const [filterSession, setFilterSession] = useState("All");
    const [filterYear, setFilterYear] = useState("All");
    const [modalMode, setModalMode] = useState("details");

    const availableYears = useMemo(() => {
        return Array.from(
            new Set(
                applications
                    .filter((app) => app.createdAt)
                    .map((app) => new Date(app.createdAt).getFullYear())
            )
        ).sort((a, b) => b - a);
    }, [applications]);

    useEffect(() => {
        if (user == null || !isAuthenticated)
            navigate("/");
        else {
            const getData = async () => {
                await loadAllApplications();
            };
            getData();
        }
    }, []);

    const handleAction = (action, app) => {
        try {
            switch (action) {
                case "view":
                    setSelectedApplication(app);
                    setIsModalOpen(true);
                    break;
                case "download":
                    handleDownloadApplication(app.internshipOfferId)
                    break;
                default:
                    break;
            }
        } catch (err) {
            toast.error(err.message || t("errors.downloadCv"));
        }
    };

    const columns = [
        { key: "internshipOfferTitle", label: t("table.offerTitle") },
        { key: "appliedAt", label: t("table.appliedAt") },
        { key: "status", label: t("table.employerDecision") },
        { key: "etudiantStatus", label: t("table.myDecision") },
        {
            key: "actions",
            label: t("table.action"),
            actions: [
                {
                    key: "view",
                    label: (
                        <> <EyeOpenIcon className="w-4 h-4" /> <span>{t("table.actionView")}</span>
                        </>
                    ),
                },
                {
                    key: "download",
                    label: (
                        <> <DownloadIcon className="w-4 h-4" /> <span>{t("table.download")}</span>
                        </>
                    ),
                },
            ],
        },
    ];

    const filteredApplications = useMemo(() => {
        return applications
            .filter((app) =>
                filterEmployerDecision ? app.status === filterEmployerDecision : true
            )
            .filter((app) =>
                filterMyDecision ? app.etudiantStatus === filterMyDecision : true
            )
            .filter((app) =>
                (app.status.toLowerCase() === "accepted" && app.etudiantStatus !== null) ||
                (app.status.toLowerCase() !== "accepted" && app.etudiantStatus === null)
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
    }, [applications, filterEmployerDecision, filterMyDecision, filterSession, filterYear]);

    const tableData = filteredApplications.map((app) => ({
        ...app,
        appliedAt: new Date(app.createdAt).toLocaleDateString(),
        rawStatus: app.status?.toLowerCase(),
        status: t(`status.${app.status?.toLowerCase()}`),
        etudiantStatus: app.etudiantStatus ? t(`status.${app.etudiantStatus?.toLowerCase()}`) : "N/A" ,
    }));

    const handleDownloadApplication = async (offerId) => {
        try {
            await downloadOfferPdf(user.token, offerId);
            toast.success(t("success.downloadOffer"));
        } catch (err) {
            toast.error(t("errors.downloadOffer"));
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            { loading ? <p>Chargement...</p> :
                <>
                    <Header title={t("title")}/>

                    {/* Filtres */}
                    <div className="flex items-center gap-4">
                        {/* Décision de l'employeur */}
                        <Popover>
                            {({ open, setOpen, triggerRef, contentRef }) => (
                                <>
                                    <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
                                        <span
                                            className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md
                                            shadow-sm cursor-pointer hover:bg-zinc-200 transition"
                                        >
                                          {t("filter.employerDecision")}: {" "}
                                            { filterEmployerDecision === "All" || filterEmployerDecision === null ?
                                                t("filter.allDecisions") :
                                                t(`status.${filterEmployerDecision.toLowerCase()}`)
                                            }
                                        </span>
                                    </PopoverTrigger>
                                    <PopoverContent open={open} contentRef={contentRef}>
                                        <div className="flex flex-col gap-2 min-w-[150px]">
                                            {["PENDING", "ACCEPTED", "REJECTED"].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => {
                                                        setFilterEmployerDecision(status);
                                                        setOpen(false);
                                                    }}
                                                    className={`px-3 py-1 rounded text-left ${
                                                        filterEmployerDecision === status
                                                            ? "bg-blue-100 font-semibold"
                                                            : "hover:bg-gray-100"
                                                    }`}
                                                >
                                                    {t(`status.${status.toLowerCase()}`)}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    setFilterEmployerDecision(null);
                                                    setOpen(false);
                                                }}
                                                className="px-3 py-1 rounded text-left hover:bg-gray-100"
                                            >
                                                {t("filter.allDecisions")}
                                            </button>
                                            <PopoverClose setOpen={setOpen}>
                                                <span className="text-sm text-gray-600">{t("menu.close")}</span>
                                            </PopoverClose>
                                        </div>
                                    </PopoverContent>
                                </>
                            )}
                        </Popover>

                        {/* Ma décision */}
                        <Popover>
                            {({ open, setOpen, triggerRef, contentRef }) => (
                                <>
                                    <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
                                        <span
                                            className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md
                                            shadow-sm cursor-pointer hover:bg-zinc-200 transition"
                                        >
                                          {t("filter.myDecision")}: {" "}
                                            { filterMyDecision === "All" || filterMyDecision === null ?
                                                t("filter.allDecisions") :
                                                t(`status.${filterMyDecision.toLowerCase()}`)
                                            }
                                        </span>
                                    </PopoverTrigger>
                                    <PopoverContent open={open} contentRef={contentRef}>
                                        <div className="flex flex-col gap-2 min-w-[150px]">
                                            {["CONFIRMED_BY_STUDENT", "REJECTED_BY_STUDENT"].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => {
                                                        setFilterMyDecision(status);
                                                        setOpen(false);
                                                    }}
                                                    className={`px-3 py-1 rounded text-left ${
                                                        filterEmployerDecision === status
                                                            ? "bg-blue-100 font-semibold"
                                                            : "hover:bg-gray-100"
                                                    }`}
                                                >
                                                    {t(`status.${status.toLowerCase()}`)}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    setFilterMyDecision(null);
                                                    setOpen(false);
                                                }}
                                                className="px-3 py-1 rounded text-left hover:bg-gray-100"
                                            >
                                                {t("filter.allDecisions")}
                                            </button>
                                            <PopoverClose setOpen={setOpen}>
                                                <span className="text-sm text-gray-600">{t("menu.close")}</span>
                                            </PopoverClose>
                                        </div>
                                    </PopoverContent>
                                </>
                            )}
                        </Popover>

                        {/* Session */}
                        <Popover>
                            {({ open, setOpen, triggerRef, contentRef }) => (
                                <>
                                    <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
                                        <span
                                            className="px-4 py-1 border border-zinc-400 bg-zinc-100
                                            rounded-md shadow-sm cursor-pointer
                                            hover:bg-zinc-200 transition"
                                        >
                                          {t("filter.session")}:{" "}
                                            {filterSession === "All"
                                                ? t("session.all")
                                                : t(`session.${filterSession.toLowerCase()}`)}
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
                                                        filterSession === session
                                                            ? "bg-blue-100 font-semibold"
                                                            : "hover:bg-gray-100"
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

                        {/* Année */}
                        <Popover>
                            {({ open, setOpen, triggerRef, contentRef }) => (
                                <>
                                    <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
            <span
                className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer
                hover:bg-zinc-200 transition"
            >
              {t("filter.year")}:{" "}
                {filterYear === "All" ? t("session.AllYears") : filterYear}
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
                                                        filterYear === year.toString()
                                                            ? "bg-blue-100 font-semibold"
                                                            : "hover:bg-gray-100"
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

                    {/* Table des postulations */}
                    <DataTable columns={columns} data={tableData} onAction={handleAction} />
                </>
            }

            {/* Vue détaillée pour les postulations */}
            <Modal
                open={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setModalMode("details");
                }}
                title={modalMode === "details" ? t("modal.title") : t("reasonModal.title")}
                size="default"
                footer={
                    modalMode === "details" && (
                        <>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setModalMode("details");
                                }}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
                                transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                                <span>{t("modal.close")}</span>
                            </button>
                        </>
                    )
                }
            >
                {selectedApplication && modalMode === "details" && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    {t("modal.offerTitle")}
                                </h3>
                                <p className="text-gray-600">{selectedApplication.internshipOfferTitle}</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    {t("modal.employer")}
                                </h3>
                                <p className="text-gray-600">{selectedApplication.employerEmail}</p>
                            </div>
                        </div>

                        {selectedApplication.internshipOfferDescription && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    {t("modal.description")}
                                </h3>
                                <p className="text-gray-600 whitespace-pre-wrap">
                                    {selectedApplication.internshipOfferDescription}
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            {selectedApplication.startDate && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                        {t("modal.startDate")}
                                    </h3>
                                    <p className="text-gray-600">
                                        {new Date(selectedApplication.startDate).toLocaleDateString()}
                                    </p>
                                </div>
                            )}

                            {selectedApplication.session && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                        {t("modal.session")}
                                    </h3>
                                    <p className="text-gray-600">{selectedApplication.session}</p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.status")}</h3>
                                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                                    {t(`status.${selectedApplication.status.toLowerCase()}`)}
                                </span>
                            </div>
                        </div>

                        {selectedApplication.createdAt && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    {t("modal.applicationDate")}
                                </h3>
                                <p className="text-gray-600">
                                    {new Date(selectedApplication.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};
