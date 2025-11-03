import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileTextIcon } from "@radix-ui/react-icons";
import { Button } from "../../components/ui/button.jsx";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import useAuthStore from "../../stores/authStore.js";
import { useCvStore } from "../../stores/cvStore";

export const StudentDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const user = useAuthStore((s) => s.user);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const logout = useAuthStore((s) => s.logout);

    const {
        cvs,
        loading,
        previewUrl,
        previewType,
        loadCvs,
        uploadCv,
        deleteCv,
        downloadCv,
        previewCv,
        closePreview,
        error,
    } = useCvStore();

    useEffect(() => {
        if (!isAuthenticated || !user) {
            navigate("/");
        } else if (user.role === "STUDENT") {
            loadCvs();
        }
    }, [isAuthenticated, user, navigate]);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            await uploadCv(file);
            toast.success(t("studentDashboard.success.uploadCv", { fileName: file.name }));
        } catch {
            toast.error(t("studentDashboard.errors.uploadCv"));
        }
    };

    const handleDownload = async (cvId, fileName) => {
        try {
            const blob = await downloadCv(cvId);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            toast.success(t("studentDashboard.success.downloadCv", { fileName }));
        } catch {
            toast.error(t("studentDashboard.errors.downloadCv"));
        }
    };

    const handleDelete = async (cvId) => {
        try {
            await deleteCv(cvId);
            toast.success(t("studentDashboard.success.deleteCv"));
        } catch {
            toast.error(t("studentDashboard.errors.deleteCv"));
        }
    };

    const handlePreview = async (cvId, fileType) => {
        try {
            await previewCv(cvId, fileType);
        } catch {
            toast.error(t("studentDashboard.errors.previewCv"));
        }
    };

    if (!isAuthenticated || !user) return null;

    return (
        <div className="h-[100vh]">
            <div className="flex h-full">
                {/* Sidebar */}
                <div className="bg-[#000]/3 pt-10 pl-10 pr-10">
                    <h1 className="text-5xl">{t("studentDashboard.title")}</h1>
                    <h3 className="text-xl mt-10 uppercase">{t("studentDashboard.menu")}</h3>
                    <div className="mt-2 no-underline">
                        <div className="bg-zinc-200 p-2 flex border-zinc-300 border rounded-xl mt-5">
                            <a className="text-black cursor-pointer no-underline flex pl-4">
                                <FileTextIcon className="w-5 h-5 mr-2 my-auto" />
                                {t("studentDashboard.cvs")}
                            </a>
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div className="ml-auto mr-auto pt-10 w-full pr-30 pl-30">
                    <div className="flex flex-col">
                        <div className="flex flex-row items-center justify-between mb-4 ml-auto mr-auto w-full">
                            <h2 className="text-xl font-semibold">{t("studentDashboard.myCvs")}</h2>
                            <label className="px-4 py-2 bg-[#B3FE3B] text-black shadow-lg border border-zinc-300 rounded-xl cursor-pointer">
                                {t("studentDashboard.addCv")}
                                <input type="file" className="hidden" onChange={handleUpload} />
                            </label>
                        </div>
                        <h4>{t("studentDashboard.description")}</h4>
                    </div>

                    <div className="w-full h-[1px] bg-zinc-300 mb-10 mt-10 rounded-full"></div>

                    {loading ? (
                        <p>{t("loading")}</p>
                    ) : (
                        <div className="overflow-x-auto bg-white shadow rounded">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-[#F9FBFC] text-gray-600 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3">{t("studentDashboard.table.fileName")}</th>
                                    <th className="px-4 py-3">{t("studentDashboard.table.type")}</th>
                                    <th className="px-4 py-3">{t("studentDashboard.table.size")}</th>
                                    <th className="px-4 py-3">{t("studentDashboard.table.date")}</th>
                                    <th className="px-4 py-3">{t("studentDashboard.table.actions")}</th>
                                </tr>
                                </thead>
                                <tbody>
                                {cvs.map((cv) => (
                                    <tr key={cv.id} className="border-t border-zinc-300 text-zinc-700">
                                        <td className="px-4 py-2">{cv.fileName}</td>
                                        <td className="px-4 py-2">{cv.fileType}</td>
                                        <td className="px-4 py-2">{Math.round((cv.fileSize || 0) / 1024)} KB</td>
                                        <td className="px-4 py-2">{new Date(cv.uploadedAt).toLocaleDateString()}</td>
                                        <td className="px-4 py-2 space-x-2 flex">
                                            <Button className="pt-[5px] pb-[5px] pl-1 pr-1 bg-[#F7FEEC]" onClick={() => handleDownload(cv.id, cv.fileName)} label={t("studentDashboard.actions.download")} />
                                            <Button className="pt-[5px] pb-[5px] pl-1 pr-1 bg-[#F7FEEC]" onClick={() => handlePreview(cv.id, cv.fileType)} label={t("studentDashboard.actions.preview")} />
                                            <Button className="pt-[5px] pb-[5px] pl-1 pr-1 bg-red-400" onClick={() => handleDelete(cv.id)} label={t("studentDashboard.actions.delete")} />
                                        </td>
                                    </tr>
                                ))}
                                {cvs.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4 text-gray-500">
                                            {t("studentDashboard.noCvs")}
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {previewUrl && (
                        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                            <div className="bg-white w-3/4 h-3/4 rounded shadow-lg relative">
                                <button className="absolute top-2 right-2 text-white bg-red-600 px-3 py-1 rounded" onClick={closePreview}>
                                    {t("studentDashboard.actions.close")}
                                </button>

                                {previewType.includes("pdf") ? (
                                    <iframe src={previewUrl} className="w-full h-full rounded" title="CV PDF Viewer" />
                                ) : previewType.includes("word") || previewType.includes("docx") ? (
                                    <iframe src={`https://docs.google.com/viewer?url=${encodeURIComponent(previewUrl)}&embedded=true`} className="w-full h-full rounded" title="CV DOCX Viewer" />
                                ) : (
                                    <p className="p-4">{t("studentDashboard.errors.unsupportedFormat")}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};