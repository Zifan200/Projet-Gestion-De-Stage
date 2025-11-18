import { useTranslation } from "react-i18next";
import React, { useEffect, useMemo, useState } from "react";
import { Header } from "../../components/ui/header.jsx";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "../../components/ui/popover.jsx";
import { Cross2Icon, DownloadIcon, EyeOpenIcon, FileTextIcon, PlusIcon } from "@radix-ui/react-icons";
import { TableActionButton } from "../../components/ui/tableActionButton.jsx";
import { Table } from "../../components/ui/table.jsx";
import useAuthStore from "../../stores/authStore.js";
import useGeStore from "../../stores/geStore.js";
import { Modal } from "../../components/ui/modal.jsx";
import { useInternshipAgreementStore } from "../../stores/internshipAgreementStore.js";
import PdfViewer from "../../components/CvViewer.jsx";
import PdfViewerEntente from "../../components/PdfViewerEntente.jsx";

export const GsInternshipAgreements = () => {
    const user = useAuthStore((s) => s.user);
    const { t } = useTranslation("internship_agreements");
    const {
        createInternshipAgreement,
        previewAgreement,
        downloadAgreement,
        resetAgreement,
        previewUrl
    } = useInternshipAgreementStore();

    const { applications, loadAllInternshipApplications, loading } = useGeStore();
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
    const [creatingIds, setCreatingIds] = useState(new Set());

    useEffect(() => {
        loadAllInternshipApplications();
    }, [loadAllInternshipApplications]);

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
                { !app.claimed ? (
                    <TableActionButton
                        icon={PlusIcon} label={t("table.createAgreement")}
                        bg_color={"amber-100"} text_color={"amber-700"}
                        onClick={async () => {
                            try {
                                await createInternshipAgreement(user.token, app, user.id, user.role);
                                loadAllInternshipApplications(); // recharge les applications
                            } catch (err) {
                                console.error(err);
                            }
                        }}
                    />
                ) : (
                    <>
                        <TableActionButton
                            icon={FileTextIcon}
                            label={t("table.viewAgreement")}
                            bg_color={"amber-100"}
                            text_color={"amber-700"}
                            onClick={() => {
                                console.log("Preview button clicked for app:", app);
                                previewAgreement(user.token, app.ententeStagePdfId);
                            }}
                        />

                        <TableActionButton
                            icon={DownloadIcon} label={t("table.download")}
                            bg_color={"green-100"} text_color={"green-700"}
                            onClick={() => downloadAgreement(user.token, app.ententeStagePdfId)}
                        />
                    </>
                )}
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

    const availableYears = Array.from(new Set(applications?.filter(app => app.startDate).map(app => new Date(app.startDate).getFullYear()))).sort((a,b) => b - a);

    return (
        <div className="space-y-6">
            <Header title={t("title")}/>

            {/* Filtre année */}
            <div className="flex items-center gap-4">
                <Popover>
                    {({open, setOpen, triggerRef, contentRef}) => (
                        <>
                            <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
                                <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                                    {t("filter.year")}: {filterYear !== "All" ? filterYear : t("session.AllYears")}
                                </span>
                            </PopoverTrigger>
                            <PopoverContent open={open} contentRef={contentRef}>
                                <div className="flex flex-col gap-2 min-w-[150px] max-h-[300px] overflow-y-auto items-center">
                                    {availableYears.map((year) => (
                                        <button
                                            key={year}
                                            onClick={() => { setFilterYear(year); setOpen(false); }}
                                            className={`px-3 py-1 rounded text-left ${filterYear === year ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`}
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

            {/* Modal détails candidature */}
            {selectedApplication && (
                <Modal
                    open={isModalOpen}
                    onClose={() => { setIsModalOpen(false); setSelectedApplication(null); }}
                    title={selectedApplication.internshipOfferTitle}
                    size="default"
                    footer={
                        <button
                            onClick={() => { setIsModalOpen(false); setSelectedApplication(null); }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                            {t("modal.close")}
                        </button>
                    }
                >
                    <div className="space-y-4">
                        {/* Infos étudiant et entreprise ici, inchangé */}
                        <p>{selectedApplication.studentFirstName} {selectedApplication.studentLastName}</p>
                        <p>{selectedApplication.studentEmail}</p>
                        <p>{selectedApplication.employerEnterpriseName}</p>
                        <p>{selectedApplication.employerEmail}</p>
                        <p>{selectedApplication.internshipOfferDescription}</p>
                        <p>{selectedApplication.employerAddress}</p>
                        <p>{new Date(selectedApplication.startDate).toLocaleDateString()}</p>
                        <p>{selectedApplication.session}</p>
                        <p>{selectedApplication.typeHoraire}</p>
                        <p>{selectedApplication.nbHeures}</p>
                        <p>{selectedApplication.salary}</p>
                        <p>{new Date(selectedApplication.createdAt).toLocaleDateString()}</p>
                    </div>
                </Modal>
            )}

            {/* PDF Preview */}
            {previewUrl && (
                <div className="mt-4">
                    <div className="flex justify-end mb-2">
                        <button
                            onClick={resetAgreement}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                            <Cross2Icon className="w-4 h-4" />
                            <span>{t("menu.close")}</span>
                        </button>
                    </div>
                    <PdfViewerEntente previewUrl={previewUrl} />
                </div>
            )}


        </div>
    );
};
