import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useEmployerStore } from "../../stores/employerStore.js";
import useAuthStore from "../../stores/authStore.js";
import { Table } from "../../components/ui/table.jsx";
import { TableActionButton } from "../../components/ui/tableActionButton.jsx";
import { Header } from "../../components/ui/header.jsx";
import { CheckIcon, Cross2Icon } from "@radix-ui/react-icons";
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "../../components/ui/popover.jsx";
import { ReasonModal } from "../../components/ui/reason-modal.jsx";

export const PostInterview = () => {
    const { t } = useTranslation("employer_dashboard_postInterviews");
    const user = useAuthStore((s) => s.user);

    const {
        applications,
        convocations,
        fetchApplications,
        fetchListConvocation,
        approveApplication,
        rejectApplicationPostInterview,
        loading,
    } = useEmployerStore();

    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("details");
    const [rejectReason, setRejectReason] = useState("");
    const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
    const [localApplications, setLocalApplications] = useState([]);

    // 🔹 Fetch applications et convocations
    useEffect(() => {
        const fetchData = async () => {
            await fetchApplications();
            const token = localStorage.getItem("token");
            await fetchListConvocation(token);
        };
        fetchData();
    }, [fetchApplications, fetchListConvocation]);

    // 🔹 Associer le status de la convocation à chaque application
    const applicationsWithConvocationStatus = useMemo(() => {
        return applications.map((app) => {
            const convocation = convocations.find(c => c.internshipApplicationId === app.id);
            return {
                ...app,
                convocationStatus: convocation?.status || null,
            };
        });
    }, [applications, convocations]);

    // 🔹 Charger les actions persistées depuis localStorage
    useEffect(() => {
        const storedActions = JSON.parse(localStorage.getItem("postInterviewActions") || "[]");

        const merged = applicationsWithConvocationStatus.map(app => {
            const stored = storedActions.find(a => a.id === app.id);
            return { ...app, actionStatus: stored?.actionStatus || null };
        });

        setLocalApplications(merged);
    }, [applicationsWithConvocationStatus]);

    // 🔹 Liste des années disponibles pour le filtre
    const availableYears = useMemo(() => {
        return Array.from(
            new Set(
                applications
                    .filter((app) => app.startDate)
                    .map((app) => new Date(app.startDate).getFullYear())
            )
        ).sort((a, b) => b - a);
    }, [applications]);

    // 🔹 Filtrage des applications selon la convocation et l'année
    const filteredApplications = useMemo(() => {
        return localApplications
            .filter(app => app.convocationStatus === "CONFIRMED_BY_STUDENT")
            .filter(app =>
                filterYear === "All"
                    ? true
                    : new Date(app.startDate).getFullYear().toString() === filterYear
            )
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [localApplications, filterYear]);

    // 🔹 Actions
    const saveActionsToStorage = (apps) => {
        localStorage.setItem("postInterviewActions", JSON.stringify(apps));
    };

    const handleApproveApplication = async (appId) => {
        try {
            await approveApplication(user.token, appId);
            setLocalApplications(prev => {
                const updated = prev.map(app =>
                    app.id === appId ? { ...app, actionStatus: "accepted" } : app
                );
                saveActionsToStorage(updated);
                return updated;
            });
        } catch {
            toast.error(t("errors.accept"));
        }
    };

    const handleRejectApplication = async (reason) => {
        try {
            await rejectApplicationPostInterview(user.token, selectedApplication.id, reason);
            setLocalApplications(prev => {
                const updated = prev.map(app =>
                    app.id === selectedApplication.id ? { ...app, actionStatus: "rejected" } : app
                );
                saveActionsToStorage(updated);
                return updated;
            });
            setIsModalOpen(false);
            setModalMode("details");
            setRejectReason("");
            setSelectedApplication(null);
        } catch {
            toast.error(t("errors.reject"));
        }
    };

    return (
        <div className="space-y-6">
            <Header title={t("title")} />

            {/* Filtre par année */}
            <div className="flex items-center gap-4">
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
            {loading ? (
                <p>{t("table.loading")}</p>
            ) : (
                <Table
                    headers={[
                        t("table.offerTitle"),
                        t("table.studentName"),
                        t("table.studentEmail"),
                        t("table.action"),
                    ]}
                    rows={filteredApplications.map((app) => (
                        <tr
                            key={app.id}
                            className="select-none pt-4 w-fit border-t border-gray-200 text-gray-700 text-sm"
                        >
                            <td className="px-4 py-3">{app.internshipOfferTitle}</td>
                            <td className="px-4 py-3">{app.studentFirstName} {app.studentLastName}</td>
                            <td className="px-4 py-3">{app.studentEmail}</td>
                            <td className="px-4 py-3 flex gap-2">
                                {app.postInterviewStatus ? (
                                    <span className={`font-semibold ${app.postInterviewStatus === "accepted" ? "text-red-700" : "text-green-700"}`}>
                                        {app.postInterviewStatus === "accepted" ? t("table.rejected") : t("table.accepted")}
                                    </span>
                                ) : (
                                    <>
                                        <TableActionButton
                                            icon={CheckIcon}
                                            label={t("table.accept")}
                                            bg_color={"green-100"}
                                            text_color={"green-700"}
                                            onClick={() => handleApproveApplication(app.id)}
                                        />
                                        <TableActionButton
                                            icon={Cross2Icon}
                                            label={t("table.reject")}
                                            bg_color={"red-100"}
                                            text_color={"red-700"}
                                            onClick={() => {
                                                setSelectedApplication(app);
                                                setModalMode("reject");
                                                setIsModalOpen(true);
                                            }}
                                        />
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                    emptyMessage={t("table.noApplications")}
                />
            )}

            {/* Modal de rejet (ReasonModal) */}
            <ReasonModal
                open={isModalOpen && modalMode === "reject"}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedApplication(null);
                    setRejectReason("");
                    setModalMode("details");
                }}
                onSubmit={handleRejectApplication}
                title={t("modal.rejectTitle")}
                description={t("modal.rejectDescription")}
                placeholder={t("modal.rejectReason2")}
                cancelLabel={t("modal.cancel")}
                confirmLabel={t("modal.submitReject")}
                reasonLabel={t("modal.rejectReason")}
                initialValue={rejectReason}
                onChange={(value) => setRejectReason(value)}
            />
        </div>
    );
};
