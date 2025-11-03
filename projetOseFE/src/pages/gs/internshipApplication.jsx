import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
    Cross2Icon,
} from "@radix-ui/react-icons";

import useGeStore from "../../stores/geStore.js";

export const InternshipApplicationsGE = () => {
    const { t } = useTranslation("internship_applications");

    const { applications = [], loadAllInternshipApplications } = useGeStore();

    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState(null);
    const [filterSession, setFilterSession] = useState("All");
    const [filterYear, setFilterYear] = useState("All");

    useEffect(() => {
        loadAllInternshipApplications();
        console.log("Applications récupérées :", applications);
    }, [loadAllInternshipApplications]);

    const handleAction = (action, app) => {
        switch (action) {
            case "view":
                setSelectedApplication(app);
                setIsModalOpen(true);
                break;
            case "download":
                alert(`Téléchargement CV: ${app.selectedCvFileName}`);
                break;
            default:
                break;
        }
    };
    const getStatusColor = (status) => {
        const statusColors = {
            pending: "bg-yellow-100 text-yellow-800",
            confirmed_by_student: "bg-green-100 text-green-800",
            rejected_by_student: "bg-red-100 text-red-800"
        };
        return statusColors[status?.toLowerCase()] || "bg-gray-100 text-gray-700";
    };


    const columns = [
        { key: "internshipOfferTitle", label: t("table.offerTitle") },
        { key: "studentName", label: t("table.studentName") },
        { key: "studentEmail", label: t("table.studentEmail") },
        { key: "selectedCvFileName", label: t("table.cv") },
        { key: "etudiantStatus", label: t("table.studentChoice") }, // <-- ici
        {
            key: "actions",
            label: t("table.action"),
            actions: [
                {
                    key: "view",
                    label: (
                        <>
                            <EyeOpenIcon className="w-4 h-4" />
                            <span>{t("table.actionView")}</span>
                        </>
                    ),
                },
                {
                    key: "download",
                    label: (
                        <>
                            <DownloadIcon className="w-4 h-4" />
                            <span>{t("table.download")}</span>
                        </>
                    ),
                },
            ],
        },
    ];

    const sortedAndFilteredApplications = useMemo(() => {
        let filtered = applications;
        if (filterStatus) filtered = filtered.filter((app) => app.status === filterStatus);
        if (filterSession !== "All") filtered = filtered.filter((app) => app.session === filterSession);
        if (filterYear !== "All") filtered = filtered.filter((app) => app.year === filterYear);
        return [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [applications, filterStatus, filterSession, filterYear]);

    const tableData = sortedAndFilteredApplications.map((app) => ({
        ...app,
        studentName: `${app.studentFirstName} ${app.studentLastName}`,
        rawEtudiantStatus: app.etudiantStatus?.toLowerCase(),
        etudiantStatus: app.etudiantStatus
            ? (
                <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(app.etudiantStatus)}`}
                >
              {t(`status.${app.etudiantStatus.toLowerCase()}`)}
            </span>
            )
            : (
                <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor("pending")}`}
                >
              {t("status.pending")}
            </span>
            ),
    }));



    const availableYears = Array.from(new Set(applications.map((app) => app.year))).sort((a, b) => b - a);

    return (
        <div className="space-y-6">
            <Header title={t("title")} />

            {/* Filters */}
            <div className="flex items-center gap-4">
                {/* Status Filter */}
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

                {/* Session Filter */}
                <Popover>
                    {({ open, setOpen, triggerRef, contentRef }) => (
                        <>
                            <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
                            <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                                {t("filter.session")}: {filterSession !== "All" ? filterSession : t("session.all")}
                            </span>
                            </PopoverTrigger>
                            <PopoverContent open={open} contentRef={contentRef}>
                                <div className="flex flex-col gap-2 min-w-[150px]">
                                    {["Automne", "Hiver"].map((session) => (
                                        <button
                                            key={session}
                                            onClick={() => { setFilterSession(session); setOpen(false); }}
                                            className={`px-3 py-1 rounded text-left ${filterSession === session ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`}
                                        >
                                            {session}
                                        </button>
                                    ))}
                                    <button onClick={() => { setFilterSession("All"); setOpen(false); }} className="px-3 py-1 rounded text-left hover:bg-gray-100">
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

                {/* Year Filter */}
                <Popover>
                    {({ open, setOpen, triggerRef, contentRef }) => (
                        <>
                            <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
                            <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                                {t("filter.year")}: {filterYear !== "All" ? filterYear : t("session.AllYears")}
                            </span>
                            </PopoverTrigger>
                            <PopoverContent open={open} contentRef={contentRef}>
                                <div className="flex flex-col gap-2 min-w-[150px]">
                                    {availableYears.map((year) => (
                                        <button
                                            key={year}
                                            onClick={() => { setFilterYear(year); setOpen(false); }}
                                            className={`px-3 py-1 rounded text-left ${filterYear === year ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`}
                                        >
                                            {year}
                                        </button>
                                    ))}
                                    <button onClick={() => { setFilterYear("All"); setOpen(false); }} className="px-3 py-1 rounded text-left hover:bg-gray-100">
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

            <DataTable columns={columns} data={tableData} onAction={handleAction} />

            {/* Modal Preview */}
            {isModalOpen && selectedApplication && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-3/4 max-w-lg">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <EyeOpenIcon className="w-5 h-5 text-blue-500" />
                            {selectedApplication.studentFirstName} {selectedApplication.studentLastName}
                        </h2>
                        <p><strong>{t("modal.email")}:</strong> {selectedApplication.studentEmail}</p>
                        <p><strong>{t("modal.cv")}:</strong> {selectedApplication.selectedCvFileName || t("table.noCv")}</p>
                        <p><strong>{t("modal.offerTitle")}:</strong> {selectedApplication.internshipOfferTitle}</p>
                        <p><strong>{t("modal.status")}:</strong> {t(`status.${selectedApplication.status?.toLowerCase()}`)}</p>
                        <p><strong>{t("modal.appliedAt")}:</strong> {new Date(selectedApplication.createdAt).toLocaleDateString()}</p>

                        <div className="mt-6 flex justify-end">
                            <button
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={() => { setIsModalOpen(false); setSelectedApplication(null); }}
                            >
                                <Cross2Icon className="w-4 h-4" /> {t("modal.close")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}