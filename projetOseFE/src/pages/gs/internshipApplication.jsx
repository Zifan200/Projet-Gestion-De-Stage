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

import useGeStore from "../../stores/geStore.js";

export const InternshipApplicationsGE = () => {
    const { t } = useTranslation("internship_applications");
    const { applications = [], loadAllInternshipApplications } = useGeStore();
    const [filterStatus, setFilterStatus] = useState(null);
    const currentYear = new Date().getFullYear().toString();
    const [filterSession, setFilterSession] = useState("Hiver"); // session = Hiver
    const [filterYear, setFilterYear] = useState(currentYear);

    useEffect(() => {
        loadAllInternshipApplications();
        console.log("Applications récupérées :", applications);
    }, [loadAllInternshipApplications]);

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
        {
            key: "etudiantStatus",
            label: t("table.studentChoice"),
            format: (status) => t(`status.${status?.toLowerCase()}`)
        }
    ];

    const sortedAndFilteredApplications = useMemo(() => {
        return applications
            .filter(app => app.etudiantStatus)
            .filter(app => app.session === "Hiver")
            .filter(app => {
                if (!app.startDate) return false;
                const year = new Date(app.startDate).getFullYear();
                // filtrage dynamique selon filterYear (peut être "All")
                return filterYear === "All" || year.toString() === filterYear.toString();
            })
            .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    }, [applications, filterYear]);

    const tableData = sortedAndFilteredApplications.map((app) => ({
        ...app,
        studentName: `${app.studentFirstName} ${app.studentLastName}`,
        rawStatus: app.etudiantStatus?.toLowerCase(),
    }));

    const availableYears = Array.from(
        new Set(
            applications
                .filter(app => app.startDate)
                .map(app => new Date(app.startDate).getFullYear())
        )
    ).sort((a, b) => b - a);

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
                                <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md
                                    shadow-sm cursor-pointer hover:bg-zinc-200 transition"
                                >
                                    {t("filter.status")}:{" "}
                                    {filterStatus ? t(`status.${filterStatus.toLowerCase()}`) : t("filter.all")}
                                </span>
                            </PopoverTrigger>
                            <PopoverContent open={open} contentRef={contentRef}>
                                <div className="flex flex-col gap-2 min-w-[150px]">
                                    {["confirmed_by_student", "rejected_by_student"].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => { setFilterStatus(status); setOpen(false); }}
                                            className={`px-3 py-1 rounded text-left ${filterStatus === status ? 
                                                "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`}
                                        >
                                            {t(`status.${status}`)}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => { setFilterStatus(null); setOpen(false); }}
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

                {/* Year Filter */}
                <Popover>
                    {({ open, setOpen, triggerRef, contentRef }) => (
                        <>
                            <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
                                <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md
                                    shadow-sm cursor-pointer hover:bg-zinc-200 transition"
                                >
                                    { t("filter.year")}:{" "}
                                        {filterYear !== "All" ? filterYear : t("session.AllYears")
                                    }
                                </span>
                            </PopoverTrigger>
                            <PopoverContent open={open} contentRef={contentRef}>
                                <div
                                    className="flex flex-col gap-2 min-w-[150px] max-h-[300px]
                                    overflow-y-auto items-center"
                                >
                                    {availableYears.map((year) => (
                                        <button
                                            key={year}
                                            onClick={() => {
                                                setFilterYear(year);
                                                setOpen(false);
                                            }}
                                            className={`px-3 py-1 rounded text-left ${filterYear === year ? 
                                                "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`}
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

            {/* Table */}
            <DataTable columns={columns} data={tableData} />
        </div>
    );
};