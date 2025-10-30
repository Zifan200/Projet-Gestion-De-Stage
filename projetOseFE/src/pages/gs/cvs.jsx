import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "../../components/ui/header.jsx";
import { Table } from "../../components/ui/table.jsx";
import useGeStore from "../../stores/geStore.js";
import { toast } from "sonner";
import PdfViewer from "../../components/CvViewer.jsx";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
} from "../../components/ui/popover.jsx";
import { ReasonModal } from "../../components/ui/reason-modal.jsx";
import { EyeOpenIcon, DownloadIcon, CheckIcon, Cross2Icon } from "@radix-ui/react-icons";

export const GsManageCvs = () => {
  const { t } = useTranslation("gs_dashboard_manage_cvs");
  const { cvs, loadAllsStudentCvs, approveCv, rejectCv, downloadCv } =
    useGeStore();

  const [previewId, setPreviewId] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedCv, setSelectedCv] = useState(null);

  useEffect(() => {
    loadAllsStudentCvs();
  }, []);

  const sortedAndFilteredCvs = useMemo(() => {
    const order = { PENDING: 1, ACCEPTED: 2, REJECTED: 3 };
    const filtered = filterStatus
      ? cvs.filter((cv) => cv.status === filterStatus)
      : cvs;
    return [...filtered].sort((a, b) => order[a.status] - order[b.status]);
  }, [cvs, filterStatus]);

  const handlePreview = (cv) => {
    if (cv.fileType === "application/pdf") setPreviewId(cv.id);
    else handleDownload(cv);
  };

  const handleDownload = async (cv) => {
    try {
      await downloadCv(cv.id, { preview: false, fileName: cv.fileName });
      toast.success(t("toast.downloadSuccess", { fileName: cv.fileName }));
    } catch {
      toast.error(t("toast.downloadError"));
    }
  };

  const handleAccept = async (cv) => {
    try {
      await approveCv(cv.id);
      toast.success(t("toast.accepted", { fileName: cv.fileName }));
    } catch {
      toast.error(t("toast.acceptError"));
    }
  };

  const handleReject = (cv) => {
    setSelectedCv(cv);
    setShowReasonModal(true);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return statusColors[status?.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  const rows = sortedAndFilteredCvs.map((cv) => (
    <tr key={cv.id} className="border-t border-gray-200 text-gray-700 text-sm">
      <td className="px-4 py-3">
        {cv.firstName && cv.lastName
          ? `${cv.firstName} ${cv.lastName}`
          : t("unknownStudent")}
      </td>
      <td className="px-4 py-3">{cv.fileName}</td>
      <td className="px-4 py-3">
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(cv.status)}`}
        >
          {t(`status.${cv.status.toLowerCase()}`)}
        </span>
      </td>
      <td className="px-4 py-3">{Math.round((cv.fileSize || 0) / 1024)} KB</td>
      <td className="px-4 py-3">
        {new Date(cv.uploadedAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePreview(cv)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              cv.fileType === "application/pdf"
                ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            {cv.fileType === "application/pdf" ? (
              <>
                <EyeOpenIcon className="w-4 h-4" />
                <span>{t("actions.preview")}</span>
              </>
            ) : (
              <>
                <DownloadIcon className="w-4 h-4" />
                <span>{t("actions.download")}</span>
              </>
            )}
          </button>
          {cv.status === "PENDING" && (
            <>
              <button
                onClick={() => handleAccept(cv)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              >
                <CheckIcon className="w-4 h-4" />
                <span>{t("actions.accept")}</span>
              </button>
              <button
                onClick={() => handleReject(cv)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-red-100 text-red-700 hover:bg-red-200"
              >
                <Cross2Icon className="w-4 h-4" />
                <span>{t("actions.reject")}</span>
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  ));

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

      {/* Table */}
      <Table
        headers={[
          t("table.student"),
          t("table.fileName"),
          t("table.status"),
          t("table.size"),
          t("table.date"),
          t("table.actions"),
        ]}
        rows={rows}
        emptyMessage={t("empty")}
      />

      {/* PDF Preview */}
      {previewId && (
        <div className="mt-4">
          <div className="flex justify-end mb-2">
            <button
              onClick={() => setPreviewId(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              <Cross2Icon className="w-4 h-4" />
              <span>{t("menu.close")}</span>
            </button>
          </div>
          <PdfViewer cvId={previewId} role="gs" />
        </div>
      )}

      {/* Reason Modal */}
      <ReasonModal
        open={showReasonModal}
        onClose={() => setShowReasonModal(false)}
        onSubmit={async (reason) => {
          if (!reason.trim()) {
            toast.error(t("toast.missingReason"));
            return;
          }
          try {
            await rejectCv(selectedCv.id, reason);
            toast.error(t("toast.rejected", { fileName: selectedCv.fileName }));
            setShowReasonModal(false);
          } catch {
            toast.error(t("toast.rejectError"));
          }
        }}
      />
    </div>
  );
};
