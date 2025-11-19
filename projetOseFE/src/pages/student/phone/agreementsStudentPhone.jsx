import React, { useEffect, useState, useMemo } from "react";
import { Cross2Icon, DownloadIcon, EyeOpenIcon, FileTextIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";
import useAuthStore from "../../../stores/authStore.js";
import { useStudentStore } from "../../../stores/studentStore.js";
import { useInternshipAgreementStore } from "../../../stores/internshipAgreementStore.js";
import { Modal } from "../../../components/ui/modal.jsx";
import PdfViewerEntente from "../../../components/PdfViewerEntente.jsx";

export const StudentInternshipAgreementsPhone = () => {
    const { t } = useTranslation("internship_agreements");
    const user = useAuthStore((s) => s.user);

    const { applications, loadAllApplications, loading } = useStudentStore();
    const {
        previewAgreement,
        downloadAgreement,
        resetAgreement,
        signAgreementStore,
        previewUrl
    } = useInternshipAgreementStore();

    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());

    const [signature, setSignature] = useState("");
    const [signatureError, setSignatureError] = useState("");
    const [signatureSuccess, setSignatureSuccess] = useState("");

    const fullName = `${user.firstName} ${user.lastName}`.trim();

    useEffect(() => {
        if (user?.token) {
            loadAllApplications(user.token);
        }
    }, [loadAllApplications, user?.token]);


    /** -------------------------
     *  SIGNATURE ÉTUDIANT
     --------------------------*/
    const handleSign = async () => {
        if (signature.trim() !== fullName) {
            setSignatureError(t("pdf.signatureMismatch"));
            setSignatureSuccess("");
            return;
        }
        setSignatureError("");

        try {
            await signAgreementStore(
                user.token,
                selectedApplication.ententeStagePdfId,
                "STUDENT",
                user.id,
                signature,
                selectedApplication
            );

            setSignatureSuccess(t("pdf.signatureSuccess"));
        } catch (err) {
            console.error("Erreur signature:", err);
        }
    };


    /** -------------------------
     *  TRI + FILTRE PAR ANNÉE
     --------------------------*/
    const sortedApplications = useMemo(() => {
        return applications
            ?.filter(app => app.startDate)
            .filter(app => {
                const year = new Date(app.startDate).getFullYear().toString();
                return filterYear === "All" || filterYear === year;
            })
            .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    }, [applications, filterYear]);

    const availableYears = useMemo(() => {
        return [...new Set(applications?.map(app => new Date(app.startDate).getFullYear()))].sort((a, b) => b - a);
    }, [applications]);



    return (
        <div className="space-y-6 mt-6 px-2">

            <h1 className="text-2xl font-semibold text-center">{t("title")}</h1>

            {/* Filtre année */}
            <div className="flex justify-start mb-4">
                <label className="mr-2 font-medium">{t("filter.year")}:</label>
                <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="border rounded-md px-2 py-1"
                >
                    {availableYears.map(year => (
                        <option key={year} value={year.toString()}>{year}</option>
                    ))}
                </select>
            </div>


            {/* LISTE DES ENTENTES — VERSION MOBILE */}
            {loading ? (
                <p className="text-center">{t("table.loading")}</p>
            ) : (
                <div className="space-y-3">
                    {sortedApplications?.map(app => (
                        <div key={app.id} className="flex items-center justify-between p-3 bg-white shadow rounded-md">

                            {/* Infos principales */}
                            <div className="flex-1">
                                <p className="font-semibold text-gray-700">{app.internshipOfferTitle}</p>
                                <p className="text-gray-600 text-sm">
                                    {app.studentFirstName} {app.studentLastName}
                                </p>
                            </div>

                            {/* Icônes Actions */}
                            <div className="flex gap-2">
                                {/* Voir infos étudiant */}
                                <button
                                    onClick={() => {
                                        setSelectedApplication(app);
                                        setIsModalOpen(true);
                                    }}
                                    className="p-2 bg-indigo-100 rounded-md"
                                >
                                    <EyeOpenIcon className="w-5 h-5 text-indigo-700" />
                                </button>

                                {/* Preview PDF */}
                                {app.ententeStagePdfId && (
                                    <button
                                        onClick={() => {
                                            setSelectedApplication(app);
                                            previewAgreement(user.token, app.ententeStagePdfId);
                                        }}
                                        className="p-2 bg-amber-100 rounded-md"
                                    >
                                        <FileTextIcon className="w-5 h-5 text-amber-700" />
                                    </button>
                                )}

                                {/* Download PDF */}
                                {app.ententeStagePdfId && (
                                    <button
                                        onClick={() => downloadAgreement(user.token, app.ententeStagePdfId)}
                                        className="p-2 bg-green-100 rounded-md"
                                    >
                                        <DownloadIcon className="w-5 h-5 text-green-700" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {sortedApplications?.length === 0 && (
                        <p className="text-center text-gray-500">
                            {t("table.noApplications")}
                        </p>
                    )}
                </div>
            )}



            {/* ------------------------- */}
            {/* MODAL INFO ÉTUDIANT       */}
            {/* ------------------------- */}
            {selectedApplication && isModalOpen && (
                <Modal
                    open={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedApplication(null);
                    }}
                    title={selectedApplication.internshipOfferTitle}
                    size="default"
                >
                    <div className="space-y-4 text-gray-700">
                        <p>
                            <span className="font-bold">{t("modal.studentName")}:</span><br />
                            {selectedApplication.studentFirstName} {selectedApplication.studentLastName}
                        </p>

                        <p>
                            <span className="font-bold">{t("modal.studentEmail")}:</span><br />
                            {selectedApplication.studentEmail}
                        </p>

                        <p>
                            <span className="font-bold">{t("modal.startDate")}:</span><br />
                            {new Date(selectedApplication.startDate).toLocaleDateString()}
                        </p>
                    </div>
                </Modal>
            )}



            {/* ------------------------- */}
            {/* PDF + SIGNATURE           */}
            {/* ------------------------- */}
            {previewUrl && (
                <div className="mt-4 space-y-4">

                    {/* bouton de fermeture */}
                    <div className="flex justify-end">
                        <button
                            onClick={resetAgreement}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-red-200"
                        >
                            <Cross2Icon className="w-4 h-4" />
                            {t("pdf.close")}
                        </button>
                    </div>

                    <PdfViewerEntente previewUrl={previewUrl} />

                    {/* Champ de signature */}
                    <div>
                        <label className="block font-medium mb-1">
                            {t("pdf.signatureLabelStudent")}
                        </label>
                        <input
                            type="text"
                            value={signature}
                            onChange={(e) => setSignature(e.target.value)}
                            placeholder={t("pdf.signaturePlaceholder")}
                            className="w-full border px-3 py-2 rounded-md"
                        />
                        {signatureError && (
                            <p className="text-red-600 text-sm mt-1">{signatureError}</p>
                        )}
                        {signatureSuccess && (
                            <p className="text-green-600 text-sm mt-1">{signatureSuccess}</p>
                        )}
                    </div>

                    <button
                        onClick={handleSign}
                        className="px-4 py-2 bg-green-600 text-white rounded-md w-full"
                    >
                        {t("pdf.signButton")}
                    </button>
                </div>
            )}

        </div>
    );
};
