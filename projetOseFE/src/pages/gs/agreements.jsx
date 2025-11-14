import { useTranslation } from "react-i18next";
import React, { useEffect, useMemo, useState } from "react";
import { Header } from "../../components/ui/header.jsx";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "../../components/ui/popover.jsx";
import { DataTable } from "../../components/ui/data-table.jsx";
import { EyeOpenIcon } from "@radix-ui/react-icons";
import { useInternshipAgreementStore } from "../../stores/internshipAgreementStore.js";

export const GsInternshipAgreements = () => {
    const { applications, fetchAllAvailableApplications } = useInternshipAgreementStore();
    const { t } = useTranslation("internship_agreements");

    const currentYear = new Date().getFullYear().toString();
    const [filterSession, setFilterSession] = useState("Hiver");
    const [filterYear, setFilterYear] = useState(currentYear);

    useEffect(() => {
        fetchAllAvailableApplications();
    }, [fetchAllAvailableApplications]);

    console.log(applications)

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
        { key: "employerEnterpriseName", label: t("table.company") },
        { key: "studentName", label: t("table.studentName") },
        {
            key: "actions",
            label: t("table.action"),
            actions: [
                {
                    key: "view",
                    label: (
                        <> <EyeOpenIcon className="w-4 h-4" /> <span>{t("table.createAgreement")}</span> </>
                    ),
                },
            ],
        },
    ];

    const sortedAndFilteredApplications = useMemo(() => {
        return applications?.filter(app => app.session === "Hiver")
            .filter(app => {
                if (!app.startDate) return false;
                const year = new Date(app.startDate).getFullYear();
                return filterYear === "All" || year.toString() === filterYear.toString();
            })
            .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    }, [applications, filterYear]);

    const tableData = sortedAndFilteredApplications?.map((app) => ({
        ...app,
        studentName: `${app.studentFirstName} ${app.studentLastName}`,
        rawStatus: app.etudiantStatus?.toLowerCase(),
    }));

    const availableYears = Array.from(
        new Set(
            applications?.filter(app => app.startDate).map(app => new Date(app.startDate).getFullYear())
        )
    ).sort((a, b) => b - a);

    return (
        <div className="space-y-6">
            <Header title={t("title")}/>

            <div className="flex items-center gap-4">
                <Popover>
                    {({open, setOpen, triggerRef, contentRef}) => (
                        <>
                            <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
                                <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm
                                    cursor-pointer hover:bg-zinc-200 transition"
                                >
                                    {t("filter.year")}: {
                                    filterYear !== "All" ? filterYear : t("session.AllYears")
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
                                            className={
                                                `px-3 py-1 rounded text-left ${filterYear === year ?
                                                    "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`
                                            }
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
            <DataTable columns={columns} data={tableData}/>
        </div>
    );
};