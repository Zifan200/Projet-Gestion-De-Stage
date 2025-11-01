import React, {useEffect, useMemo, useState} from "react";
import { useTranslation } from "react-i18next";
import { useEmployerStore } from "../../stores/employerStore.js";
import { useCvStore } from "../../stores/cvStore.js";
import useAuthStore from "../../stores/authStore.js";
import { toast } from "sonner";
import {ReasonModal} from "../../components/ui/reason-modal.jsx";
import {Button} from "../../components/ui/button.jsx";
import {Header} from "../../components/ui/header.jsx";
import {Popover, PopoverClose, PopoverContent, PopoverTrigger} from "../../components/ui/popover.jsx";
import {Table} from "../../components/ui/table.jsx";

export const InternshipApplications = () => {
    const { t } = useTranslation();
    const { applications, fetchApplications, approveApplication, rejectApplication } = useEmployerStore();
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
    const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);

    const statuses = {
        PENDING: t("internshipApplications.status.pending"),
        ACCEPTED: t("internshipApplications.status.accepted"),
        REJECTED: t("internshipApplications.status.rejected"),
        ALL: t("internshipApplications.filter.all"),
    };
    const ALL_INDEX = 3;
    const PENDING_INDEX = 0;
    const [currentStatus, setCurrentStatus] = useState(Object.entries(statuses)[PENDING_INDEX][0]);

    useEffect(() => {
        fetchApplications();
    }, []);

    const filteredApplications = useMemo(() => {
        const filtered = currentStatus === Object.entries(statuses)[ALL_INDEX][0] ?
            applications : applications.filter((a) => a.status === currentStatus);
        return [...filtered];
    }, [currentStatus, applications]);

    const handleViewApplication = (application) => {
        setSelectedApplication(application);
        setIsModalOpen(true);
    };

    const handleApproveApplication = (application) => {
        try {
            approveApplication(user.token, application.id);
            toast.success(t("internshipApplications.toast.approved"));
        } catch {
            toast.error(t("internshipApplications.toast.approveError"));
        }
    };

    const handleRejectApplication = (application) => {
        setSelectedApplication(application);
        setIsReasonModalOpen(true);
    };

    const handlePreviewCv = (application) => {
        try {
            previewCvForEmployer(application.selectedCvFileData, application.selectedCvFileName);
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDownloadCv = (application) => {
        try {
            downloadCvForEmployer(application.selectedCvFileData, application.selectedCvFileName);
        } catch (err) {
            toast.error(t("internshipApplications.errors.downloadCv"));
        }
    };

    const rows = filteredApplications.map((app) => (
        <tr key={app.id} className="border-t border-zinc-300 text-zinc-700 text-base">
            <td className="px-4 py-2">{app.internshipOfferTitle}</td>
            <td className="px-4 py-2">{app.studentFirstName} {app.studentLastName}</td>
            <td className="px-4 py-2">{app.studentEmail}</td>
            <td className="px-4 py-2">
                {app.selectedCvFileName ? (
                    <>
                        <button
                            className="text-blue-600 underline hover:text-blue-800 mr-2"
                            onClick={() => handlePreviewCv(app)}
                        >
                            {app.selectedCvFileName}
                        </button>
                        <button
                            className="text-green-600 underline hover:text-green-800"
                            onClick={() => handleDownloadCv(app)}
                        >
                            {t("internshipApplications.table.download")}
                        </button>
                    </>
                ) : (
                    t("internshipApplications.table.noCv")
                )}
            </td>
            <td className="px-4 py-2">
                {t(`internshipApplications.table.status.${app.status.toLowerCase()}`)}
            </td>
            <td className="px-4 py-2">
                <Button
                    label={t("internshipApplications.actions.view")}
                    onClick={() => handleViewApplication(app)}
                    className={"bg-blue-300 hover:bg-blue-100 rounded-lg"}
                />
                {app.status === "PENDING" &&
                    <>
                        <Button
                            label={t("internshipApplications.actions.approve")}
                            onClick={() => handleApproveApplication(app)}
                            className={"w-1/2 rounded-lg"}
                        />
                        <Button
                            label={t("internshipApplications.actions.reject")}
                            onClick={() => handleRejectApplication(app)}
                            className={"bg-red-300 hover:bg-red-400 w-1/2 rounded-lg"}
                        />
                    </>
                }
            </td>
        </tr>
    ));

    return (
        <div className="space-y-6">
            <Header title={t("internshipApplications.title")}/>

            {/* Filtre */}
            <Popover>
                {({open, setOpen, triggerRef, contentRef}) => (
                    <>
                        <PopoverTrigger
                            open={open}
                            setOpen={setOpen}
                            triggerRef={triggerRef}
                        >
                          <span
                              className="px-4 hover:bg-zinc-200 transition py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer">
                            {t("internshipApplications.filter.filter")}:{" "}
                              {
                                  currentStatus === "ALL" ?
                                  t(`internshipApplications.filter.${Object.entries(statuses)[ALL_INDEX][0].toLowerCase()}`) :
                                  t(`internshipApplications.status.${currentStatus.toLowerCase()}`)
                              }
                          </span>
                        </PopoverTrigger>

                        <PopoverContent open={open} contentRef={contentRef}>
                            <div className="flex flex-col gap-2 min-w-[150px]">
                                {Object.entries(statuses).map((status) => (
                                    <button
                                        key={status[0]}
                                        onClick={() => {
                                            setCurrentStatus(status[0]);
                                            setOpen(false);
                                        }}
                                        className={`px-3 py-1 rounded text-left ${
                                            currentStatus === status[0]
                                                ? "bg-blue-100 font-semibold"
                                                : "hover:bg-gray-100"
                                        }`}
                                    >
                                        {
                                            status[0] === "ALL" ?
                                                t(`internshipApplications.filter.${status[0].toLowerCase()}`) :
                                                t(`internshipApplications.status.${status[0].toLowerCase()}`)
                                        }
                                    </button>
                                ))}
                                <PopoverClose setOpen={setOpen}>
                                  <span className="text-sm text-gray-600">
                                    {t("menu.close")}
                                  </span>
                                </PopoverClose>
                            </div>
                        </PopoverContent>
                    </>
                )}
            </Popover>

            {/* Table des candidatures */}
            <Table
                headers={[
                    t("internshipApplications.table.offerTitle"),
                    t("internshipApplications.table.studentName"),
                    t("internshipApplications.table.studentEmail"),
                    t("internshipApplications.table.cv"),
                    t("internshipApplications.table.statusTitle"),
                    t("internshipApplications.table.action")
                ]}
                rows={rows}
                emptyMessage={t("internshipApplications.table.noApplications")}
            />

            {/* Preview CV */}
            {previewUrl && (
                <div className="mt-6 p-4 border-t border-gray-300 bg-gray-50 rounded">
                    <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-semibold">{t("internshipApplications.previewCv")}</h3>
                        <button
                            className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
                            onClick={closePreview}
                        >
                            {t("internshipApplications.closeCvPreview")}
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

            {/* Modal détails candidature */}
            {isModalOpen && selectedApplication && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-3/4 max-w-lg">
                        <h2 className="text-xl font-semibold mb-4">
                            {selectedApplication.studentFirstName} {selectedApplication.studentLastName}
                        </h2>
                        <p>
                            <strong>{t("internshipApplications.modal.email") || "Email"}: </strong>
                            {selectedApplication.studentEmail}
                        </p>
                        <p>
                            <strong>{t("internshipApplications.modal.cv") || "CV"}: </strong>
                            {selectedApplication.selectedCvFileName || "Aucun CV"}
                        </p>
                        <p>
                            <strong>{t("internshipApplications.modal.offerTitle") || "Offre"}: </strong>
                            {selectedApplication.internshipOfferTitle}
                        </p>
                        <p>
                            <strong>{t("internshipApplications.modal.appliedAt") || "Postulé le"}: </strong>
                            {new Date(selectedApplication.createdAt).toLocaleDateString()}
                        </p>
                        <p>
                            <strong>{t("internshipApplications.modal.statusTitle") || "Statut"}: </strong>
                            {t(`internshipApplications.modal.status.${selectedApplication.status.toLowerCase()}`)}
                        </p>
                        {selectedApplication.status === "REJECTED" &&
                            <p>
                                <strong>{t("internshipApplications.modal.reason") || "Raison"}: </strong>
                                {selectedApplication.reason}
                            </p>
                        }

                        <div className="mt-6 flex justify-end">
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedApplication(null);
                                }}
                            >
                                {t("internshipApplications.modal.close") || "Fermer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal refus de candidature */}
            <ReasonModal
                open={isReasonModalOpen}
                onClose={() => setIsReasonModalOpen(false)}
                description={t("internshipApplications.rejectModal.description")}
                onSubmit={async (reason) => {
                    if (!reason.trim()) {
                        toast.error(t("internshipApplications.toast.missingReason"));
                        return;
                    }
                    try {
                        await rejectApplication(user.token, selectedApplication.id, reason);
                        toast.error(
                            t("internshipApplications.toast.rejected"),
                        );
                        setIsReasonModalOpen(false);
                    } catch {
                        toast.error(t("internshipApplications.toast.rejectError"));
                    }
                }}
            />
        </div>
    );
};