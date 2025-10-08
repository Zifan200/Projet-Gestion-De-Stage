import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "../../components/ui/header.jsx";
import { Table } from "../../components/ui/table.jsx";
import { Button } from "../../components/ui/button.jsx";
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

export const GsManageCvs = () => {
  const { t } = useTranslation();
  const { cvs, loadAllsStudentCvs, approveCv, rejectCv, downloadCv } =
    useGeStore();

  const [previewId, setPreviewId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("PENDING");
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
      toast.success(
        t("gsManageCvs.toast.downloadSuccess", { fileName: cv.fileName }),
      );
    } catch {
      toast.error(t("gsManageCvs.toast.downloadError"));
    }
  };

  const handleAccept = async (cv) => {
    try {
      await approveCv(cv.id);
      toast.success(t("gsManageCvs.toast.accepted", { fileName: cv.fileName }));
    } catch {
      toast.error(t("gsManageCvs.toast.acceptError"));
    }
  };

  const handleReject = (cv) => {
    setSelectedCv(cv);
    setShowReasonModal(true);
  };

  const rows = sortedAndFilteredCvs.map((cv) => (
    <tr key={cv.id} className="border-t border-gray-300">
      <td className="px-4 py-2">
        {cv.firstName + " " + cv.lastName ?? t("gsManageCvs.unknownStudent")}
      </td>
      <td className="px-4 py-2">{cv.fileName}</td>
      <td className="px-4 py-2">
        {t(`gsManageCvs.status.${cv.status.toLowerCase()}`)}
      </td>
      <td className="px-4 py-2">{Math.round((cv.fileSize || 0) / 1024)} KB</td>
      <td className="px-4 py-2">
        {new Date(cv.uploadedAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-2 flex space-x-2">
        <Button
          onClick={() => handlePreview(cv)}
          label={
            cv.fileType === "application/pdf"
              ? t("gsManageCvs.actions.preview")
              : t("gsManageCvs.actions.download")
          }
          className={
            cv.fileType === "application/pdf"
              ? "bg-blue-300 hover:bg-blue-100 rounded-lg"
              : "bg-indigo-300 hover:bg-indigo-100 rounded-lg"
          }
        />
        {cv.status === "PENDING" && (
          <>
            <Button
              onClick={() => handleAccept(cv)}
              label={t("gsManageCvs.actions.accept")}
              className="bg-green-300 hover:bg-green-100 rounded-lg"
            />
            <Button
              onClick={() => handleReject(cv)}
              label={t("gsManageCvs.actions.reject")}
              className="bg-red-400 hover:bg-red-100 p-1 rounded-lg"
            />
          </>
        )}
      </td>
    </tr>
  ));

  return (
    <div className="space-y-6">
      <Header title={t("gsManageCvs.title")} />

      <Popover>
        {({ open, setOpen, triggerRef, contentRef }) => (
          <>
            <PopoverTrigger
              open={open}
              setOpen={setOpen}
              triggerRef={triggerRef}
            >
              <span className="px-4 hover:bg-zinc-200 transition py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer">
                {t("gsManageCvs.filter")}:{" "}
                {t(`gsManageCvs.status.${filterStatus.toLowerCase()}`)}
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
                    {t(`gsManageCvs.status.${status.toLowerCase()}`)}
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

      <Table
        headers={[
          t("gsManageCvs.table.student"),
          t("gsManageCvs.table.fileName"),
          t("gsManageCvs.table.status"),
          t("gsManageCvs.table.size"),
          t("gsManageCvs.table.date"),
          t("gsManageCvs.table.actions"),
        ]}
        rows={rows}
        emptyMessage={t("gsManageCvs.empty")}
      />

      {previewId && (
        <div className="mt-4">
          <div className="flex justify-end mb-2">
            <Button
              onClick={() => setPreviewId(null)}
              label={t("menu.close")}
              className="bg-gray-400"
            />
          </div>
          <PdfViewer cvId={previewId} role="gs" />
        </div>
      )}

      <ReasonModal
        open={showReasonModal}
        onClose={() => setShowReasonModal(false)}
        onSubmit={async (reason) => {
          if (!reason.trim()) {
            toast.error(t("gsManageCvs.toast.missingReason"));
            return;
          }
          try {
            await rejectCv(selectedCv.id, reason);
            toast.error(
              t("gsManageCvs.toast.rejected", {
                fileName: selectedCv.fileName,
              }),
            );
            setShowReasonModal(false);
          } catch {
            toast.error(t("gsManageCvs.toast.rejectError"));
          }
        }}
      />
    </div>
  );
};
