import React, { useEffect, useState, useMemo } from "react";
import { Cross2Icon, DownloadIcon, EyeOpenIcon, FileTextIcon, PlusIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../stores/authStore.js";
import useGeStore from "../../../stores/geStore.js";
import { useInternshipAgreementStore } from "../../../stores/internshipAgreementStore.js";
import { Modal } from "../../../components/ui/modal.jsx";
import PdfViewerEntente from "../../../components/PdfViewerEntente.jsx";

export const GsInternshipAgreementsPhone = () => {
    const { t } = useTranslation("internship_agreements");
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const token = useAuthStore((s) => s.token);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const { applications, loadAllInternshipApplications, loading } = useGeStore();
    const {
        createInternshipAgreement,
        previewAgreement,
        downloadAgreement,
        resetAgreement,
        signAgreement,
        previewUrl
    } = useInternshipAgreementStore();

    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
    const [signatureGestionnaire, setSignatureGestionnaire] = useState("");
    const [signatureError, setSignatureError] = useState("");
    const [signatureSuccess, setSignatureSuccess] = useState("");
    const fullName = `${user?.firstName} ${user?.lastName}`.trim();

    useEffect(() => {
        if (!isAuthenticated || !user) navigate("/");
    }, [isAuthenticated, user]);

    useEffect(() => {
        loadAllInternshipApplications();
    }, [loadAllInternshipApplications]);

    const handleCreateAgreement = async (app) => {
        try {
            await createInternshipAgreement(token, app, user.id, user.role);
            loadAllInternshipApplications();
        } catch (err) {
            console.error("Erreur lors de la création de l'entente:", err);
        }
    };

    const handleSign = async () => {
        if (signatureGestionnaire.trim() !== fullName) {
            setSignatureError(t("pdf.signatureMismatch"));
            setSignatureSuccess("");
            return;
        }
        setSignatureError("");

        try {
            await signAgreement(
                token,
                selectedApplication.ententeStagePdfId,
                signatureGestionnaire,
                user.id,
                selectedApplication
            );
            setSignatureSuccess(t("pdf.signatureSuccess"));
        } catch (err) {
            console.error("Erreur lors de la signature :", err);
        }
    };

    const sortedApplications = useMemo(() => {
        return applications
            ?.filter(app => app.session === "Hiver")
            .filter(app => app.etudiantStatus === "CONFIRMED_BY_STUDENT" && app.postInterviewStatus === "ACCEPTED")
            .filter(app => app.startDate && (filterYear === "All" || new Date(app.startDate).getFullYear().toString() === filterYear))
            .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    }, [applications, filterYear]);


    // Générer toutes les années disponibles pour le filtre
    const availableYears = useMemo(() => {
        if (!applications) return [];
        return [...new Set(applications.map(app => new Date(app.startDate).getFullYear()))].sort((a, b) => b - a);
    }, [applications]);

    return (
        <div className="space-y-6 mt-6">
            <h1 className="text-2xl font-semibold text-center">{t("title")}</h1>

            {/* Filtre par année */}
            <div className="flex justify-start mb-4 px-2">
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

            {loading ? <p className="text-center">{t("table.loading")}</p> :
                <div className="space-y-2 px-2">
                    {sortedApplications?.map(app => (
                        <div key={app.id} className="flex items-center justify-between p-3 bg-white shadow rounded-md">
                            <div className="flex-1">
                                <p className="font-semibold text-gray-700">{app.internshipOfferTitle}</p>
                                <p className="text-gray-600 text-sm">{app.studentFirstName} {app.studentLastName}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setIsModalOpen(true)} className="p-2 bg-indigo-100 rounded-md">
                                    <EyeOpenIcon className="w-5 h-5 text-indigo-700"/>
                                </button>
                                {!app.claimed ? (
                                    <button onClick={() => handleCreateAgreement(app)} className="p-2 bg-amber-100 rounded-md">
                                        <PlusIcon className="w-5 h-5 text-amber-700"/>
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => {
                                                setSelectedApplication(app);
                                                previewAgreement(token, app.ententeStagePdfId);
                                            }}
                                            className="p-2 bg-amber-100 rounded-md"
                                        >
                                            <FileTextIcon className="w-5 h-5 text-amber-700"/>
                                        </button>
                                        <button onClick={() => downloadAgreement(token, app.ententeStagePdfId)} className="p-2 bg-green-100 rounded-md">
                                            <DownloadIcon className="w-5 h-5 text-green-700"/>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                    {sortedApplications?.length === 0 && (
                        <p className="text-gray-500 text-center mt-4">{t("table.noApplications")}</p>
                    )}
                </div>
            }

            {/* Modal et PDF Preview */}
            {selectedApplication && (
                <Modal
                    open={isModalOpen}
                    onClose={() => { setIsModalOpen(false); setSelectedApplication(null); }}
                    title={selectedApplication.internshipOfferTitle}
                    size="default"
                    footer={
                        <button
                            onClick={() => { setIsModalOpen(false); setSelectedApplication(null); }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-red-200"
                        >
                            {t("modal.close")}
                        </button>
                    }
                >
                    {/* Contenu modal desktop si besoin */}
                </Modal>
            )}

            {previewUrl && (
                <div className="mt-4 space-y-4 px-2">
                    <div className="flex justify-end mb-2">
                        <button
                            onClick={resetAgreement}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-red-200"
                        >
                            <Cross2Icon className="w-4 h-4" />
                            <span>{t("pdf.close")}</span>
                        </button>
                    </div>

                    <PdfViewerEntente previewUrl={previewUrl} />

                    <div className="mt-4">
                        <label className="block font-medium mb-1">{t("pdf.signatureLabel")}</label>
                        <input
                            type="text"
                            value={signatureGestionnaire}
                            onChange={(e) => setSignatureGestionnaire(e.target.value)}
                            placeholder={t("pdf.signaturePlaceholder")}
                            className="w-full border px-3 py-2 rounded-md"
                        />
                        {signatureError && <p className="text-red-600 mt-1 text-sm">{signatureError}</p>}
                        {signatureSuccess && <p className="text-green-600 mt-1 text-sm">{signatureSuccess}</p>}
                    </div>

                    <button
                        onClick={handleSign}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                        {t("pdf.signButton")}
                    </button>
                </div>
            )}
        </div>
    );
};
