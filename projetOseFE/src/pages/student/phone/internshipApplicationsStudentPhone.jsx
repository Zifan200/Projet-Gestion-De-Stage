import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import useAuthStore from "../../../stores/authStore.js";
import { useStudentStore } from "../../../stores/studentStore.js";
import { useNavigate } from "react-router-dom";
import { DataTable } from "../../../components/ui/data-table.jsx";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "../../../components/ui/popover.jsx";
import { EyeOpenIcon } from "@radix-ui/react-icons";
import { Modal } from "../../../components/ui/modal.jsx";
import { toast } from "sonner";

export const InternshipApplicationStudentPhone = () => {
    const { t } = useTranslation("student_dashboard_applications");
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const { applications, loadAllApplications, loading } = useStudentStore();

    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // filtres
    const currentYearPlusOne = (new Date().getFullYear() + 1).toString();
    const [filterEmployerDecision, setFilterEmployerDecision] = useState(null);
    const [filterMyDecision, setFilterMyDecision] = useState(null);
    const [filterSession, setFilterSession] = useState("All");
    const [filterYear, setFilterYear] = useState(currentYearPlusOne);

    const availableYears = useMemo(() => {
        return Array.from(
            new Set(applications.filter(app => app.startDate).map(app => new Date(app.startDate).getFullYear()))
        ).sort((a, b) => b - a);
    }, [applications]);

    useEffect(() => {
        if (!user || !isAuthenticated) {
            navigate("/");
        } else {
            loadAllApplications();
        }
    }, []);

    const handleAction = (action, app) => {
        if (action === "view") {
            setSelectedApplication(app);
            setIsModalOpen(true);
        }
    };

    const columns = [
        { key: "internshipOfferTitle", label: t("table.offerTitle") },
        { key: "appliedAt", label: t("table.appliedAt") },
        { key: "actions", label: t("table.action"), actions: [{ key: "view", label: <EyeOpenIcon className="w-4 h-4" /> }] },
    ];

    // logique de filtrage avancée identique au desktop
    const tableData = useMemo(() => {
        return applications
            .filter(app => filterEmployerDecision ? app.status === filterEmployerDecision : true)
            .filter(app => filterMyDecision ? app.etudiantStatus === filterMyDecision : true)
            .filter(app =>
                (app.status?.toLowerCase() === "accepted" && app.etudiantStatus !== null) ||
                (app.status?.toLowerCase() !== "accepted" && app.etudiantStatus === null)
            )
            .filter(app => filterSession === "All" ? true : app.session === filterSession)
            .filter(app => filterYear === "All" ? true : app.startDate && new Date(app.startDate).getFullYear().toString() === filterYear)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(app => ({
                ...app,
                appliedAt: new Date(app.createdAt).toLocaleDateString(),
                status: t(`status.${app.status?.toLowerCase()}`),
                etudiantStatus: app.etudiantStatus ? t(`status.${app.etudiantStatus?.toLowerCase()}`) : t("filter.noDecision")
            }));
    }, [applications, filterEmployerDecision, filterMyDecision, filterSession, filterYear]);

    return (
        <div className="space-y-6 p-4 mt-6">
            <h1 className="text-2xl font-bold text-gray-800">{t("title")}</h1>

            {/* Filtres */}
            <div className="flex flex-wrap gap-3">
                {/* Décision de l'employeur */}
                <Popover>
                    {({ open, setOpen, triggerRef, contentRef }) => (
                        <>
                            <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
                                <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                                    {t("filter.employerDecision")}: {filterEmployerDecision ? t(`status.${filterEmployerDecision.toLowerCase()}`) : t("filter.allDecisions")}
                                </span>
                            </PopoverTrigger>
                            <PopoverContent open={open} contentRef={contentRef}>
                                <div className="flex flex-col gap-2 min-w-[150px]">
                                    {["PENDING", "ACCEPTED", "REJECTED"].map(status => (
                                        <button key={status} onClick={() => { setFilterEmployerDecision(status); setOpen(false); }} className={`px-3 py-1 rounded text-left ${filterEmployerDecision === status ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`}>
                                            {t(`status.${status.toLowerCase()}`)}
                                        </button>
                                    ))}
                                    <button onClick={() => { setFilterEmployerDecision(null); setOpen(false); }} className="px-3 py-1 rounded text-left hover:bg-gray-100">
                                        {t("filter.allDecisions")}
                                    </button>
                                    <PopoverClose setOpen={setOpen}><span className="text-sm text-gray-600">{t("menu.close")}</span></PopoverClose>
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
                                <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                                    {t("filter.myDecision")}: {filterMyDecision ? t(`status.${filterMyDecision.toLowerCase()}`) : t("filter.allDecisions")}
                                </span>
                            </PopoverTrigger>
                            <PopoverContent open={open} contentRef={contentRef}>
                                <div className="flex flex-col gap-2 min-w-[150px]">
                                    {["CONFIRMED_BY_STUDENT", "REJECTED_BY_STUDENT"].map(status => (
                                        <button key={status} onClick={() => { setFilterMyDecision(status); setOpen(false); }} className={`px-3 py-1 rounded text-left ${filterMyDecision === status ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`}>
                                            {t(`status.${status.toLowerCase()}`)}
                                        </button>
                                    ))}
                                    <button onClick={() => { setFilterMyDecision(null); setOpen(false); }} className="px-3 py-1 rounded text-left hover:bg-gray-100">
                                        {t("filter.allDecisions")}
                                    </button>
                                    <PopoverClose setOpen={setOpen}><span className="text-sm text-gray-600">{t("menu.close")}</span></PopoverClose>
                                </div>
                            </PopoverContent>
                        </>
                    )}
                </Popover>
            </div>

            {/* Tableau compact */}
            {loading ? <p>{t("table.loading")}</p> : <DataTable columns={columns} data={tableData} onAction={handleAction} isCompact />}

            {/* Modal détail */}
            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={t("modal.title")} size="default" footer={
                <button onClick={() => setIsModalOpen(false)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200">
                    {t("modal.close")}
                </button>
            }>
                {selectedApplication && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700">{t("modal.offerTitle")}</h3>
                        <p className="text-gray-600">{selectedApplication.internshipOfferTitle}</p>

                        <h3 className="text-lg font-semibold text-gray-700">{t("modal.employer")}</h3>
                        <p className="text-gray-600">{selectedApplication.employerEmail}</p>

                        {selectedApplication.startDate && (
                            <>
                                <h3 className="text-lg font-semibold text-gray-700">{t("modal.startDate")}</h3>
                                <p className="text-gray-600">{new Date(selectedApplication.startDate).toLocaleDateString()}</p>
                            </>
                        )}

                        {selectedApplication.status && (
                            <>
                                <h3 className="text-lg font-semibold text-gray-700">{t("modal.employerDecision")}</h3>
                                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                                    {t(`status.${selectedApplication.status.toLowerCase()}`)}
                                </span>
                            </>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};
