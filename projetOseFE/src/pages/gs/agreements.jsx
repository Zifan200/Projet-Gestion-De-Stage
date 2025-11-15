import { useTranslation } from "react-i18next";
import React, { useEffect, useMemo, useState } from "react";
import { Header } from "../../components/ui/header.jsx";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "../../components/ui/popover.jsx";
import {DownloadIcon, EyeOpenIcon, FileTextIcon} from "@radix-ui/react-icons";
import { useInternshipAgreementStore } from "../../stores/internshipAgreementStore.js";
import {ContactIcon, PencilLineIcon, PlusIcon} from "lucide-react";
import {toast} from "sonner";
import {TableActionButton} from "../../components/ui/tableActionButton.jsx";
import {Table} from "../../components/ui/table.jsx";
import useAuthStore from "../../stores/authStore.js";
import useGeStore from "../../stores/geStore.js";
import {Modal} from "../../components/ui/modal.jsx";

export const GsInternshipAgreements = () => {
    const user = useAuthStore((s) => s.user);
    const { t } = useTranslation("internship_agreements");
    const { applications, loadAllInternshipApplications, loading } = useGeStore();
    // const { applications, fetchAllAvailableApplications, loading } = useInternshipAgreementStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const currentYear = new Date().getFullYear().toString();
    const [filterSession, setFilterSession] = useState("Hiver");
    const [filterYear, setFilterYear] = useState(currentYear);

    useEffect(() => {
        loadAllInternshipApplications();
    }, [loadAllInternshipApplications]);

    /*useEffect(() => {
        fetchAllAvailableApplications();
    }, [fetchAllAvailableApplications]);*/

    const handleAction = (action, app) => {
        try {
            switch (action) {
                // case "create":
                //     createInternshipAgreement(app);
                //     break;
                case "view":
                    setSelectedApplication(app);
                    setIsModalOpen(true);
                    break;
                // case "download":
                //     downloadCvForEmployer(app.selectedCvFileData, app.selectedCvFileName);
                //     break;
                default:
                    break;
            }
        } catch (err) {
            toast.error(err.message || t("errors.downloadCv"));
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

    const tableRows = () => sortedAndFilteredApplications.map((app) => (
        <tr key={app.id} className="select-none pt-4 w-fit border-t border-gray-200 text-gray-700 text-sm">
            <td className="px-4 py-3">{app.internshipOfferTitle}</td>
            <td className="px-4 py-3">{app.employerEnterpriseName}</td>
            <td className="px-4 py-3">{app.studentFirstName} {app.studentLastName}</td>
            <td className="px-4 py-3 flex gap-2">
                <TableActionButton
                    icon={EyeOpenIcon} label={t("table.actionView")}
                    bg_color={"indigo-100"} text_color={"indigo-700"}
                    onClick={() => { setSelectedApplication(app); setIsModalOpen(true); }}
                />
                { !app.claimed &&
                    <TableActionButton
                        icon={PlusIcon}
                        label={t("table.createAgreement")}
                        bg_color={"amber-100"} text_color={"amber-700"}
                        //onClick={() => { setSelectedApplication(app); setIsModalOpen(true); setModalType("convocation"); }}
                    />
                }
                { app.claimed && app.claimed_by === user.id &&
                 <>
                     <TableActionButton
                         icon={PencilLineIcon}
                         label={t("table.sign")}
                         bg_color={"amber-100"} text_color={"amber-700"}
                         //onClick={() => { setSelectedApplication(app); setIsModalOpen(true); setModalType("convocation"); }}
                     />
                     <TableActionButton
                         icon={DownloadIcon} label={t("table.download")}
                         bg_color={"green-100"} text_color={"green-700"}
                         //onClick={() => downloadCvForEmployer(app.selectedCvFileData, app.selectedCvFileName)}
                     />
                 </>
                }
            </td>
        </tr>
    ));

    const sortedAndFilteredApplications = useMemo(() => {
        return applications?.filter(app => app.session === "Hiver")
            .filter(app => app.etudiantStatus === "CONFIRMED_BY_STUDENT" && app.postInterviewStatus === "ACCEPTED")
            .filter(app => {
                if (!app.startDate) return false;
                const year = new Date(app.startDate).getFullYear();
                return filterYear === "All" || year.toString() === filterYear.toString();
            })
            .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    }, [applications, filterYear]);

    const availableYears = Array.from(
        new Set(
            applications?.filter(app => app.startDate).map(app => new Date(app.startDate).getFullYear())
        )
    ).sort((a, b) => b - a);

    return (
        <div className="space-y-6">
            <Header title={t("title")}/>

            {/* Filtre */}
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
            {loading ? <p>{t("table.loading")}</p> :
                <Table
                    headers={[
                        t("table.offerTitle"),
                        t("table.company"),
                        t("table.studentName"),
                        t("table.action"),
                    ]}
                    rows={tableRows()}
                    emptyMessage={t("table.noApplications")}
                />
            }

            { selectedApplication && (
                <Modal
                    open={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedApplication(null);
                    }}
                    title={selectedApplication.internshipOfferTitle}
                    size="default"
                    footer={
                        <>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedApplication(null);
                                }}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
                                transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                                {t("modal.close")}
                            </button>
                        </>
                    }
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    {t("modal.company")}
                                </h3>
                                <p className="text-gray-600">{selectedApplication.employerEnterpriseName}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    {t("modal.companyEmail")}
                                </h3>
                                <p className="text-gray-600">{selectedApplication.employerEmail}</p>
                            </div>
                        </div>

                        {/* Description + Salaire */}
                        <div className="grid grid-cols-2 gap-4">
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

                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    {t("modal.salary")}
                                </h3>
                                <p className="text-gray-600">
                                    {localStorage.key("lang") === "fr"
                                        ? selectedApplication.salary.toLocaleString("fr-CA", {
                                            style: "currency",
                                            currency: "CAD",
                                        })
                                        : selectedApplication.salary.toLocaleString("en-CA", {
                                            style: "currency",
                                            currency: "CAD",
                                        })}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    {t("modal.startDate")}
                                </h3>
                                <p className="text-gray-600">
                                    {new Date(selectedApplication.startDate).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    {t("modal.semester")}
                                </h3>
                                <p className="text-gray-600">
                                    {(selectedApplication.session.toUpperCase() !== "AUTOMNE" &&
                                        selectedApplication.session.toUpperCase() !== "HIVER") ?
                                        t("modal.noSemester") :
                                        t(`modal.${selectedApplication.session.toLowerCase()}`)}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    {t("modal.studentName")}
                                </h3>
                                <p className="text-gray-600">
                                    {selectedApplication.studentFirstName} {selectedApplication.studentLastName}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    {t("modal.studentEmail")}
                                </h3>
                                <p className="text-gray-600">{selectedApplication.studentEmail}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    {t("modal.appliedAt")}
                                </h3>
                                <p className="text-gray-600">
                                    {new Date(selectedApplication.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};