import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useEmployerStore } from "../../stores/employerStore.js";
import { useCvStore } from "../../stores/cvStore.js";
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
} from "@radix-ui/react-icons";

export const InternshipApplications = () => {
  const { t } = useTranslation("internship_applications");
  const { applications, fetchApplications } = useEmployerStore();
  const {
    previewUrl,
    previewType,
    previewCvForEmployer,
    downloadCvForEmployer,
    closePreview,
  } = useCvStore();

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterSession, setFilterSession] = useState("All");
  const [filterYear, setFilterYear] = useState("All");

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Extract available years from applications
  const availableYears = useMemo(() => {
    return Array.from(
        new Set(
            applications
                .filter((app) => app.createdAt)
                .map((app) => new Date(app.createdAt).getFullYear())
        )
    ).sort((a, b) => b - a);
  }, [applications]);

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
    { key: "selectedCvFileName", label: t("table.cv") },
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
      ],
    },
  ];

  const filteredApplications = useMemo(() => {
    return applications
        .filter((app) =>
            filterStatus ? app.status === filterStatus : true
        )
        .filter((app) =>
            filterSession === "All" ? true : app.session === filterSession
        )
        .filter((app) =>
            filterYear === "All"
                ? true
                : app.createdAt && new Date(app.createdAt).getFullYear().toString() === filterYear
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [applications, filterStatus, filterSession, filterYear]);

  const tableData = filteredApplications.map((app) => ({
    ...app,
    studentName: `${app.studentFirstName} ${app.studentLastName}`,
    rawStatus: app.status?.toLowerCase(),
    status: t(`status.${app.status?.toLowerCase()}`),
  }));

  return (
      <div className="space-y-6">
        <Header title={t("title")} />

        <div className="flex items-center gap-4">
          {/* Status Filter */}
          <Popover>
            {({ open, setOpen, triggerRef, contentRef }) => (
                <>
                  <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
                <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                  {t("filter.status")}: {filterStatus || t("filter.all")}
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
                                  filterStatus === status ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"
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
          {t("filter.session")}: {filterSession === "All" ? t("session.all") : filterSession}
        </span>
                  </PopoverTrigger>
                  <PopoverContent open={open} contentRef={contentRef}>
                    <div className="flex flex-col gap-2 min-w-[150px]">
                      {["fall", "winter"].map((session) => (
                          <button
                              key={session}
                              onClick={() => {
                                setFilterSession(session);
                                setOpen(false);
                              }}
                              className={`px-3 py-1 rounded text-left ${
                                  filterSession === session ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"
                              }`}
                          >
                            {t(`session.${session.toLowerCase()}`)}
                          </button>
                      ))}
                      <button
                          onClick={() => {
                            setFilterSession("All");
                            setOpen(false);
                          }}
                          className="px-3 py-1 rounded text-left hover:bg-gray-100"
                      >
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
          {t("filter.year")}: {filterYear === "All" ? t("session.AllYears") : filterYear}
        </span>
                  </PopoverTrigger>
                  <PopoverContent open={open} contentRef={contentRef}>
                    <div className="flex flex-col gap-2 min-w-[150px] max-h-[300px] overflow-y-auto">
                      {availableYears.map((year) => (
                          <button
                              key={year}
                              onClick={() => {
                                setFilterYear(year.toString());
                                setOpen(false);
                              }}
                              className={`px-3 py-1 rounded text-left ${
                                  filterYear === year.toString() ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"
                              }`}
                          >
                            {year}
                          </button>
                      ))}
                      <button
                          onClick={() => {
                            setFilterYear("All");
                            setOpen(false);
                          }}
                          className="px-3 py-1 rounded text-left hover:bg-gray-100"
                      >
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

        {/* CV Preview */}
        {previewUrl && (
            <div className="mt-6 p-4 border-t border-gray-300 bg-gray-50 rounded">
              {previewType === "pdf" ? (
                  <iframe src={previewUrl} className="w-full h-[600px] border" title="Preview CV" />
              ) : (
                  <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    Ouvrir le CV
                  </a>
              )}
              <button onClick={closePreview} className="mt-2 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                {t("closeCvPreview")}
              </button>
            </div>
        )}

        {/* Modal */}
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
                      onClick={() => {
                        setIsModalOpen(false);
                        setSelectedApplication(null);
                      }}
                  >
                    <Cross2Icon className="w-4 h-4" />
                    {t("modal.close")}
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};
