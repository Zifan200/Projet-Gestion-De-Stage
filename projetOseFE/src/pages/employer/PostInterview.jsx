import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useEmployerStore } from "../../stores/employerStore.js";
import useAuthStore from "../../stores/authStore.js";
import { Table } from "../../components/ui/table.jsx";
import { TableActionButton } from "../../components/ui/tableActionButton.jsx";
import { Modal } from "../../components/ui/modal.jsx";
import { Header } from "../../components/ui/header.jsx";
import { CheckIcon, Cross2Icon } from "@radix-ui/react-icons";
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "../../components/ui/popover.jsx";

export const PostInterview = () => {
    const { t } = useTranslation("employer_dashboard_postInterviews");
    const user = useAuthStore((s) => s.user);

    const {
        applications,
        convocations,
        fetchApplications,
        fetchListConvocation,
        approveApplication,
        rejectApplication,
        loading,
    } = useEmployerStore();

    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("details");
    const [rejectReason, setRejectReason] = useState("");
    const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());

    // 🔹 Fetch applications et convocations
    useEffect(() => {
        const fetchData = async () => {
            await fetchApplications();
            const token = localStorage.getItem("token");
            await fetchListConvocation(token);
        };
        fetchData();
    }, [fetchApplications, fetchListConvocation]);

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

    const handleApproveApplication = async (app) => {
        try {
            await approveApplication(user.token, app.id);
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

    // 🔹 Filtrage des applications selon la convocation et l'année
    const filteredApplications = useMemo(() => {
        return applicationsWithConvocationStatus
            .filter(app => app.convocationStatus === "CONFIRMED_BY_STUDENT")
            .filter(app =>
                filterYear === "All"
                    ? true
                    : new Date(app.startDate).getFullYear().toString() === filterYear
            )
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [applicationsWithConvocationStatus, filterYear]);

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
                                <TableActionButton
                                    icon={CheckIcon}
                                    label={t("table.accept")}
                                    bg_color={"green-100"}
                                    text_color={"green-700"}
                                    onClick={() => handleApproveApplication(app)}
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
                            </td>
                        </tr>
                    ))}
                    emptyMessage={t("table.noApplications")}
                />
            )}

            {/* Modal de refus */}
            {modalMode === "reject" && isModalOpen && selectedApplication && (
                <Modal
                    title={t("modal.rejectTitle")}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedApplication(null);
                        setModalMode("details");
                        setRejectReason("");
                    }}
                >
                    <div className="flex flex-col gap-4">
                        <textarea
                            placeholder={t("modal.rejectReason")}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="border p-2 rounded"
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={() => handleRejectApplication(rejectReason)}
                            >
                                {t("modal.submitReject")}
                            </button>
                            <button
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedApplication(null);
                                    setModalMode("details");
                                    setRejectReason("");
                                }}
                            >
                                {t("modal.cancel")}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};
