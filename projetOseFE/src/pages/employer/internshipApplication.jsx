import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useEmployerStore } from "../../stores/employerStore.js";
import { useCvStore } from "../../stores/cvStore.js";
import useAuthStore from "../../stores/authStore.js";
import { ReasonModal } from "../../components/ui/reason-modal.jsx";
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
    FileTextIcon,
    Cross2Icon,
    CheckIcon,
} from "@radix-ui/react-icons";

export const InternshipApplications = () => {
    const { t } = useTranslation("internship_applications");
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
    const [filterStatus, setFilterStatus] = useState(null);

    const handleApproveApplication = (application) => {
        try {
            approveApplication(user.token, application.id);
            toast.success(t("success.accepted"));
        } catch {
            toast.error(t("errors.accept"));
        }
    };

    const handleRejectApplication = (application) => {
        setSelectedApplication(application);
        setIsReasonModalOpen(true);
    };

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleAction = (action, app) => {
    try {
      switch (action) {
        case "view":
          setSelectedApplication(app);
          setIsModalOpen(true);
          break;
        case "preview":
          previewCvForEmployer(app.selectedCvFileData, app.selectedCvFileName);
          break;
        case "download":
          downloadCvForEmployer(app.selectedCvFileData, app.selectedCvFileName);
          break;
        case "accept":
          handleApproveApplication(app);
          break;
        case "reject":
          handleRejectApplication(app);
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
    { key: "studentName", label: t("table.studentName") },
    { key: "studentEmail", label: t("table.studentEmail") },
    { key: "status", label: t("table.status") },
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
          key: "preview",
          label: (
            <>
              <FileTextIcon className="w-4 h-4" />
              <span>{t("table.preview")}</span>
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
        {
            key: "accept",
            label: (
                <>
                    <CheckIcon className="w-4 h-4" />
                    <span>{t("table.accept")}</span>
                </>
            ),
        },
        {
            key: "reject",
            label: (
                <>
                    <Cross2Icon className="w-4 h-4" />
                    <span>{t("table.reject")}</span>
                </>
            ),
        },
      ],
    },
  ];

    const sortedAndFilteredApplications = useMemo(() => {
        const filtered = filterStatus
            ? applications.filter((app) => app.status === filterStatus)
            : applications;
        return [...filtered].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
    }, [applications, filterStatus]);

    const tableData = sortedAndFilteredApplications.map((app) => ({
        ...app,
        studentName: `${app.studentFirstName} ${app.studentLastName}`,
        rawStatus: app.status?.toLowerCase(),
        status: t(`status.${app.status?.toLowerCase()}`),
    }));

    return (
        <div className="space-y-6">
            <Header title={t("title")} />

            {/* Filter */}
            <Popover>
                {({ open, setOpen, triggerRef, contentRef }) => (
                    <>
                        <PopoverTrigger
                            open={open}
                            setOpen={setOpen}
                            triggerRef={triggerRef}
                        >
              <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                {t("filter.status")}:{" "}
                  {filterStatus
                      ? t(`status.${filterStatus.toLowerCase()}`)
                      : t("filter.all")}
              </span>
                        </PopoverTrigger>
                        <PopoverContent open={open} contentRef={contentRef}>
                            <div className="flex flex-col gap-2 min-w-[150px]">
                                {["PENDING", "ACCEPTED", "REJECTED"].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => {
                                            setFilterStatus(status);
                                            setOpen(false);
                                        }}
                                        className={`px-3 py-1 rounded text-left ${
                                            filterStatus === status
                                                ? "bg-blue-100 font-semibold"
                                                : "hover:bg-gray-100"
                                        }`}
                                    >
                                        {t(`status.${status.toLowerCase()}`)}
                                    </button>
                                ))}
                                <button
                                    onClick={() => {
                                        setFilterStatus(null);
                                        setOpen(false);
                                    }}
                                    className="px-3 py-1 rounded text-left hover:bg-gray-100"
                                >
                                    {t("filter.all")}
                                </button>
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

            <DataTable columns={columns} data={tableData} onAction={handleAction} />

            {/* CV Preview */}
            {previewUrl && (
                <div className="mt-6 p-4 border-t border-gray-300 bg-gray-50 rounded">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-semibold">{t("previewCv")}</h3>
                        <button
                            className="flex items-center gap-2 px-3 py-2 text-white bg-red-500 rounded hover:bg-red-600"
                            onClick={closePreview}
                        >
                            <Cross2Icon className="w-4 h-4" />
                            {t("closeCvPreview")}
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
                            <strong>{t("modal.email")}: </strong>
                            {selectedApplication.studentEmail}
                        </p>
                        <p>
                            <strong>{t("modal.offerTitle")}: </strong>
                            {selectedApplication.internshipOfferTitle}
                        </p>
                        <p>
                            <strong>{t("modal.appliedAt")}: </strong>
                            {new Date(selectedApplication.createdAt).toLocaleDateString()}
                        </p>
                        <p>
                            <strong>{t("modal.status")}: </strong>
                            {t(selectedApplication.status)}
                        </p>
                        {selectedApplication.status === t("status.rejected") &&
                            <p>
                                <strong>{t("modal.reason")}: </strong>
                                {selectedApplication.reason}
                            </p>
                        }

                        <div className="mt-6 flex justify-end">
                            <button
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedApplication(null);
                                }}
                            >
                                <Cross2Icon className="w-4 h-4"/>
                                {t("modal.close")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal refus de candidature */}
            <ReasonModal
                open={isReasonModalOpen}
                onClose={() => setIsReasonModalOpen(false)}
                description={t("reasonModal.description")}
                onSubmit={async (reason) => {
                    try {
                        await rejectApplication(user.token, selectedApplication.id, reason);
                        toast.error(
                            t("success.rejected"),
                        );
                        setIsReasonModalOpen(false);
                    } catch {
                        toast.error(t("errors.reject"));
                    }
                }}
            />
        </div>
  );
};