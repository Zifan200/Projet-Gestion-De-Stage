import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "../../components/ui/header.jsx";
import { Table } from "../../components/ui/table.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useCvStore } from "../../stores/cvStore.js";
import { toast } from "sonner";
import PdfViewer from "../../components/CvViewer.jsx";

export const StudentCVs = () => {
  const { t } = useTranslation("student_dashboard_cvs");

  const { cvs, loadCvs, uploadCv, downloadCv, deleteCv } = useCvStore();
  const [previewId, setPreviewId] = useState(null);

  useEffect(() => {
    loadCvs();
  }, []);

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

  const rows = cvs.map((cv) => (
    <tr key={cv.id} className="border-t border-gray-300">
      <td className="px-4 py-2">{cv.fileName}</td>
      <td className="px-4 py-2">{getFriendlyType(cv.fileType)}</td>
      <td className="px-4 py-2">{Math.round((cv.fileSize || 0) / 1024)} KB</td>
      <td className="px-4 py-2">
        {new Date(cv.uploadedAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-2 flex space-x-2">
        <Button
          onClick={() => handlePreview(cv)}
          label={t("actions.preview")}
          className="bg-indigo-300 hover:bg-indigo-100 p-1 rounded-lg"
        />
        <Button
          onClick={() => downloadCv(cv.id, cv.fileName)}
          label={t("actions.download")}
          className="bg-blue-300 hover:bg-blue-100 rounded-lg"
        />
        <Button
          onClick={() => deleteCv(cv.id)}
          label={t("actions.delete")}
          className="bg-red-300 hover:bg-red-100 rounded-lg"
        />
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
      <Table
        headers={[
          t("table.fileName"),
          t("table.type"),
          t("table.size"),
          t("table.date"),
          t("table.actions"),
        ]}
        rows={rows}
        emptyMessage={t("noCvs")}
      />

      {previewId && (
        <div className="mt-4">
          <div className="flex justify-end mb-2">
            <Button
              onClick={() => setPreviewId(null)}
              label={t("actions.close", { defaultValue: "Close" })}
              className="bg-zinc-200 hover:bg-zinc-100 p-1 rounded-lg"
            />
          </div>
          <PdfViewer cvId={previewId} role="student" />
        </div>
      )}
    </div>
  );
};
