import { useTranslation } from "react-i18next";
import React, { useEffect, useMemo, useState } from "react";
import { Cross2Icon, DownloadIcon, EyeOpenIcon, FileTextIcon } from "@radix-ui/react-icons";
import { useEmployerStore } from "../../../stores/employerStore.js";
import { useInternshipAgreementStore } from "../../../stores/internshipAgreementStore.js";
import { Modal } from "../../../components/ui/modal.jsx";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "../../../components/ui/popover.jsx";
import PdfViewerEntente from "../../../components/PdfViewerEntente.jsx";
import useAuthStore from "../../../stores/authStore.js";

export const EmployerInternshipAgreementsPhone = () => {
    const { t } = useTranslation("internship_agreements");
    const user = useAuthStore(s => s.user);
    user.token = localStorage.getItem("token");
    const { applications, fetchApplications, loading } = useEmployerStore();
    const { previewAgreement, downloadAgreement, resetAgreement, previewUrl, signAgreementStore } = useInternshipAgreementStore();

    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
    const [signature, setSignature] = useState("");
    const [signatureError, setSignatureError] = useState("");
    const [signatureSuccess, setSignatureSuccess] = useState("");

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    useEffect(() => {
        resetAgreement();
        return () => resetAgreement();
    }, [filterYear, resetAgreement]);

    const handleSign = async () => {
        const fullName = `${user.lastName} ${user.firstName}`.trim();
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
                user.role,
                user.id,
                signature,
                selectedApplication
            );
            setSignatureSuccess(t("pdf.signatureSuccess"));
        } catch (err) {
            console.error("Erreur lors de la signature :", err);
        }
    };

    const sortedAndFilteredApplications = useMemo(() => {
        return applications
            ?.filter(app => app.startDate)
            .filter(app => filterYear === "All" || new Date(app.startDate).getFullYear().toString() === filterYear.toString())
            .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    }, [applications, filterYear]);

    const availableYears = useMemo(() => {
        return Array.from(new Set(applications?.filter(app => app.startDate).map(app => new Date(app.startDate).getFullYear()))).sort((a, b) => b - a);
    }, [applications]);

    return (
        <div className="space-y-6 mt-6 px-2">
            <h1 className="text-2xl font-semibold text-center">{t("title")}</h1>

            {/* Filtre année */}
            <div className="flex justify-start mb-4">
                <Popover>
                    {({ open, setOpen, triggerRef, contentRef }) => (
                        <>
                            <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
                            <span className="px-3 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200">
                                {t("filter.year")}: {filterYear !== "All" ? filterYear : t("session.AllYears")}
                            </span>
                            </PopoverTrigger>
                            <PopoverContent open={open} contentRef={contentRef}>
                                <div className="flex flex-col gap-2 min-w-[120px] max-h-[200px] overflow-y-auto items-center">
                                    {availableYears.map(year => (
                                        <button
                                            key={year}
                                            onClick={() => { setFilterYear(year); setOpen(false); }}
                                            className={`px-3 py-1 rounded text-left ${filterYear === year ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`}
                                        >
                                            {year}
                                        </button>
                                    ))}
                                    <PopoverClose setOpen={setOpen}>
                                        <span className="text-sm text-gray-600">{t("menu.close")}</span>
                                    </PopoverClose>
                                </div>
                            </PopoverContent>
                        </>
                    )}
                </Popover>
            </div>

            {/* Table mobile (icônes uniquement pour actions) */}
            {loading ? <p className="text-center">{t("table.loading")}</p> :
                <div className="space-y-2">
                    {sortedAndFilteredApplications?.map(app => (
                        <div key={app.id} className="flex justify-between items-center bg-white shadow rounded-md p-3">
                            <div>
                                <p className="font-semibold text-gray-700">{app.internshipOfferTitle}</p>
                                <p className="text-gray-600 text-sm">{app.studentFirstName} {app.studentLastName}</p>
                            </div>
                            <div className="flex gap-2">
                                {app.ententeStagePdfId && (
                                    <>
                                        <button onClick={() => { setSelectedApplication(app); previewAgreement(user.token, app.ententeStagePdfId); }} className="p-2 bg-amber-100 rounded-md">
                                            <FileTextIcon className="w-5 h-5 text-amber-700" />
                                        </button>
                                        <button onClick={() => downloadAgreement(user.token, app.ententeStagePdfId)} className="p-2 bg-green-100 rounded-md">
                                            <DownloadIcon className="w-5 h-5 text-green-700" />
                                        </button>
                                    </>
                                )}
                                <button onClick={() => setIsModalOpen(true)} className="p-2 bg-indigo-100 rounded-md">
                                    <EyeOpenIcon className="w-5 h-5 text-indigo-700" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {sortedAndFilteredApplications?.length === 0 && <p className="text-center text-gray-500">{t("table.noApplications")}</p>}
                </div>
            }

            {/* Modal détails */}
            {selectedApplication && isModalOpen && (
                <Modal
                    open={isModalOpen}
                    onClose={() => { setIsModalOpen(false); setSelectedApplication(null); }}
                    title={selectedApplication.internshipOfferTitle}
                    size="default"
                    footer={<button onClick={() => { setIsModalOpen(false); setSelectedApplication(null); }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-red-200">{t("modal.close")}</button>}
                >
                    <div className="space-y-4">
                        <p><strong>{t("modal.studentName")}:</strong> {selectedApplication.studentFirstName} {selectedApplication.studentLastName}</p>
                        <p><strong>{t("modal.studentEmail")}:</strong> {selectedApplication.studentEmail}</p>
                        <p><strong>{t("modal.company")}:</strong> {selectedApplication.employerEnterpriseName}</p>
                        <p><strong>{t("modal.companyEmail")}:</strong> {selectedApplication.employerEmail}</p>
                        <p><strong>{t("modal.address")}:</strong> {selectedApplication.employerAddress}</p>
                        {selectedApplication.internshipOfferDescription && <p><strong>{t("modal.description")}:</strong> {selectedApplication.internshipOfferDescription}</p>}
                        <p><strong>{t("modal.startDate")}:</strong> {new Date(selectedApplication.startDate).toLocaleDateString()}</p>
                        <p><strong>{t("modal.semester")}:</strong> {["AUTOMNE", "HIVER"].includes(selectedApplication.session.toUpperCase()) ? t(`modal.${selectedApplication.session.toLowerCase()}`) : t("modal.noSemester")}</p>
                    </div>
                </Modal>
            )}

            {/* PDF + signature */}
            {previewUrl && (
                <div className="mt-4 space-y-4">
                    <div className="flex justify-end mb-2">
                        <button onClick={resetAgreement} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-red-200 inline-flex items-center gap-1">
                            <Cross2Icon className="w-4 h-4" /> {t("pdf.close")}
                        </button>
                    </div>
                    <PdfViewerEntente previewUrl={previewUrl} />
                    <div>
                        <label className="block mb-1 font-medium">{t("pdf.signatureLabelEmployer")}</label>
                        <input type="text" value={signature} onChange={(e) => setSignature(e.target.value)} placeholder={t("pdf.signaturePlaceholder")} className="w-full border px-3 py-2 rounded-md"/>
                        {signatureError && <p className="text-red-600 mt-1 text-sm">{signatureError}</p>}
                        {signatureSuccess && <p className="text-green-600 mt-1 text-sm">{signatureSuccess}</p>}
                    </div>
                    <button onClick={handleSign} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">{t("pdf.signButton")}</button>
                </div>
            )}
        </div>
    );

};