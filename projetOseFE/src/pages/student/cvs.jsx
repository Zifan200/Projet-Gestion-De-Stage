import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "../../components/ui/header.jsx";
import { Table } from "../../components/ui/table.jsx";
import { useCvStore } from "../../stores/cvStore.js";
import { toast } from "sonner";
import PdfViewer from "../../components/CvViewer.jsx";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
} from "../../components/ui/popover.jsx";
import { EyeOpenIcon, DownloadIcon, TrashIcon } from "@radix-ui/react-icons";
import useAuthStore from "../../stores/authStore.js";

export const StudentCVs = () => {
  const { t } = useTranslation("student_dashboard_cvs");

  const { cvs, loadCvs, uploadCv, downloadCv, deleteCv } = useCvStore();
  const user = useAuthStore((s) => s.user);
  const [previewId, setPreviewId] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);

  useEffect(() => {
    if (user?.role === "STUDENT") {
      loadCvs();
    }
  }, [user]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const alreadyExists = cvs.some(
      (cv) =>
        cv.fileName.trim().toLowerCase() === file.name.trim().toLowerCase(),
    );

    if (alreadyExists) {
      toast.error(t("errors.fileExists", { fileName: file.name }));
      e.target.value = "";
      return;
    }

    try {
      await uploadCv(file);
      toast.success(t("success.uploadCv", { fileName: file.name }));
    } catch {
      toast.error(t("errors.uploadCv"));
    }
  };

  const handlePreview = (cv) => {
    if (cv.fileType === "application/pdf") {
      setPreviewId(cv.id);
    } else {
      toast.error(t("errors.previewNotSupported"));
    }
  };

  const getFriendlyType = (mime) => {
    switch (mime) {
      case "application/pdf":
        return "PDF (.pdf)";
      case "application/msword":
        return "Word 97-2003 (.doc)";
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return "Word (.docx)";
      default:
        return mime || "Inconnu";
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return statusColors[status?.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  const sortedAndFilteredCvs = useMemo(() => {
    const filtered = filterStatus
      ? cvs.filter((cv) => cv.status === filterStatus)
      : cvs;
    return [...filtered].sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  }, [cvs, filterStatus]);

  const rows = sortedAndFilteredCvs.map((cv) => (
    <tr key={cv.id} className="border-t border-gray-200 text-gray-700 text-sm">
      <td className="px-4 py-3">{cv.fileName}</td>
      <td className="px-4 py-3">{getFriendlyType(cv.fileType)}</td>
      <td className="px-4 py-3">{Math.round((cv.fileSize || 0) / 1024)} KB</td>
      <td className="px-4 py-3">
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(cv.status)}`}
        >
          {t(`status.${cv.status?.toLowerCase()}`)}
        </span>
      </td>
      <td className="px-4 py-3">
        {new Date(cv.uploadedAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePreview(cv)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
          >
            <EyeOpenIcon className="w-4 h-4" />
            <span>{t("actions.preview")}</span>
          </button>
          <button
            onClick={() => downloadCv(cv.id, cv.fileName)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-green-100 text-green-700 hover:bg-green-200"
          >
            <DownloadIcon className="w-4 h-4" />
            <span>{t("actions.download")}</span>
          </button>
          <button
            onClick={() => deleteCv(cv.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-red-100 text-red-700 hover:bg-red-200"
          >
            <TrashIcon className="w-4 h-4" />
            <span>{t("actions.delete")}</span>
          </button>
        </div>
      </td>
    </tr>
  ));

  return (
    <div className="space-y-6">
      <Header
        title={t("myCvs")}
        actionLabel={t("addCv")}
        onAction={() => document.getElementById("cv-upload").click()}
      />
      <input
        id="cv-upload"
        type="file"
        className="hidden"
        onChange={handleUpload}
      />

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

      <Table
        headers={[
          t("table.fileName"),
          t("table.type"),
          t("table.size"),
          t("table.status"),
          t("table.date"),
          t("table.actions"),
        ]}
        rows={rows}
        emptyMessage={t("noCvs")}
      />

      {previewId && (
        <div className="mt-4">
          <div className="flex justify-end mb-2">
            <button
              onClick={() => setPreviewId(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              <span>{t("actions.close")}</span>
            </button>
          </div>
          <PdfViewer cvId={previewId} role="student" />
        </div>
      )}
    </div>
  );
};
