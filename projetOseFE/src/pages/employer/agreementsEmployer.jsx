import { useTranslation } from "react-i18next";
import React, { useEffect, useMemo, useState } from "react";
import { Header } from "../../components/ui/header.jsx";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "../../components/ui/popover.jsx";
import { Cross2Icon, DownloadIcon, EyeOpenIcon, FileTextIcon } from "@radix-ui/react-icons";
import { TableActionButton } from "../../components/ui/tableActionButton.jsx";
import { Table } from "../../components/ui/table.jsx";
import useAuthStore from "../../stores/authStore.js";
import { useEmployerStore } from "../../stores/employerStore.js";
import { useInternshipAgreementStore } from "../../stores/internshipAgreementStore.js";
import { Modal } from "../../components/ui/modal.jsx";
import PdfViewerEntente from "../../components/PdfViewerEntente.jsx";


export const EmployerInternshipAgreements = () => {
    const user = useAuthStore((s) => s.user);
    const { t } = useTranslation("internship_agreements");
    user.token=localStorage.getItem("token");
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
        const fullName = `${user.lastName} ${user.firstName} `.trim();
        console.log("selectedApplication.ententeStagePdfId aaaaaaaaaaaa :", selectedApplication.ententeStagePdfId);
        if (signature.trim() !== fullName) {
            setSignatureError(t("pdf.signatureMismatch"));
            setSignatureSuccess("");
            return;
        }
        setSignatureError("");

        try {
            const pdfUrl = await signAgreementStore(
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


    const tableRows = () =>
        sortedAndFilteredApplications.map((app) => (
            <tr key={app.id} className="select-none pt-4 w-fit border-t border-gray-200 text-gray-700 text-sm">
                <td className="px-4 py-3">{app.internshipOfferTitle}</td>
                <td className="px-4 py-3">{app.employerEnterpriseName}</td>
                <td className="px-4 py-3">{app.studentFirstName} {app.studentLastName}</td>
                <td className="px-4 py-3 flex gap-2">
                    {/* 1️⃣ View Candidate → ouvre la modal */}
                    <TableActionButton
                        icon={EyeOpenIcon}
                        label={t("table.actionView")}
                        bg_color="indigo-100"
                        text_color="indigo-700"
                        onClick={() => {
                            setSelectedApplication(app);
                            setIsModalOpen(true);                        }}
                    />

                    {/* 2️⃣ View Agreement → prévisualise le PDF */}
                    {app.ententeStagePdfId && (
                        <TableActionButton
                            icon={FileTextIcon}
                            label={t("table.viewAgreement")}
                            bg_color="amber-100"
                            text_color="amber-700"
                            onClick={() => {
                                setSelectedApplication(app);
                                previewAgreement(user.token, app.ententeStagePdfId);
                            }}
                        />
                    )}


                    {/* 3️⃣ Download PDF → télécharge le PDF */}
                    {app.ententeStagePdfId && (
                        <TableActionButton
                            icon={DownloadIcon}
                            label={t("table.download")}
                            bg_color="green-100"
                            text_color="green-700"
                            onClick={() => downloadAgreement(user.token, app.ententeStagePdfId)}
                        />
                    )}
                </td>
            </tr>
        ));


    const sortedAndFilteredApplications = useMemo(() => {
        return applications
            ?.filter(app => app.startDate) // startDate existe
            .filter(app => {
                const year = new Date(app.startDate).getFullYear();
                return filterYear === "All" || year.toString() === filterYear.toString();
            })
            .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    }, [applications, filterYear]);


    const availableYears = useMemo(() => {
        return Array.from(new Set(applications
            ?.filter(app => app.startDate)
            .map(app => new Date(app.startDate).getFullYear())
        ))
            .sort((a, b) => b - a);
    }, [applications]);

    return (
        <div className="space-y-6">
            <Header title={t("title")} />

            {/* Filtre année */}
            <div className="flex items-center gap-4">
                <Popover>
                    {({ open, setOpen, triggerRef, contentRef }) => (
                        <>
                            <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
                                <span className="px-4 py-1 border border-zinc-400 bg-zinc-100 rounded-md shadow-sm cursor-pointer hover:bg-zinc-200 transition">
                                    {t("filter.year")}: {filterYear !== "All" ? filterYear : t("session.AllYears")}
                                </span>
                            </PopoverTrigger>
                            <PopoverContent open={open} contentRef={contentRef}>
                                <div className="flex flex-col gap-2 min-w-[150px] max-h-[300px] overflow-y-auto items-center">
                                    {availableYears.map((year) => (
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

            {/* Table */}
            {loading ? <p>{t("table.loading")}</p> :
                <Table
                    headers={[
                        t("table.offerTitle"),
                        t("table.company"),
                        t("table.studentName"),
                        t("table.action"),
                    ]}
                    rows={tableRows()}
                    emptyMessage={t("table.noApplications")}
                />
            }

            {/* Modal vue détaillée */}
            {selectedApplication && isModalOpen && (
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
                    <div className="space-y-4">
                        {/* Infos étudiant */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.studentName")}</h3>
                                <p className="text-gray-600">{selectedApplication.studentFirstName} {selectedApplication.studentLastName}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.studentEmail")}</h3>
                                <p className="text-gray-600">{selectedApplication.studentEmail}</p>
                            </div>
                        </div>

                        {/* Infos entreprise */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.company")}</h3>
                                <p className="text-gray-600">{selectedApplication.employerEnterpriseName}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.companyEmail")}</h3>
                                <p className="text-gray-600">{selectedApplication.employerEmail}</p>
                            </div>
                        </div>

                        {/* Description et adresse */}
                        <div className="grid grid-cols-2 gap-4">
                            {selectedApplication.internshipOfferDescription && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.description")}</h3>
                                    <p className="text-gray-600 whitespace-pre-wrap">{selectedApplication.internshipOfferDescription}</p>
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.address")}</h3>
                                <p className="text-gray-600">{selectedApplication.employerAddress}</p>
                            </div>
                        </div>

                        {/* Dates et informations supplémentaires */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.startDate")}</h3>
                                <p className="text-gray-600">{new Date(selectedApplication.startDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.semester")}</h3>
                                <p className="text-gray-600">
                                    {["AUTOMNE", "HIVER"].includes(selectedApplication.session.toUpperCase())
                                        ? t(`modal.${selectedApplication.session.toLowerCase()}`)
                                        : t("modal.noSemester")}
                                </p>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}


            {/* PDF Preview + Signature */}
            {previewUrl && (
                <div className="mt-4 space-y-4">
                    {/* Bouton fermer PDF */}
                    <div className="flex justify-end mb-2">
                        <button
                            onClick={resetAgreement}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-red-200"
                        >
                            <Cross2Icon className="w-4 h-4" />
                            <span>{t("pdf.close")}</span>
                        </button>
                    </div>

                    {/* PDF Viewer */}
                    <PdfViewerEntente previewUrl={previewUrl} />

                    {/* Champ de signature */}
                    <div className="mt-4">
                        <label className="block font-medium mb-1">{t("pdf.signatureLabelEmployer")}</label>
                        <input
                            type="text"
                            value={signature}
                            onChange={(e) => setSignature(e.target.value)}
                            placeholder={t("pdf.signaturePlaceholder")}
                            className="w-full border px-3 py-2 rounded-md"
                        />
                        {signatureError && (
                            <p className="text-red-600 mt-1 text-sm">{signatureError}</p>
                        )}
                        {signatureSuccess && (
                            <p className="text-green-600 mt-1 text-sm">{signatureSuccess}</p>
                        )}
                    </div>

                    {/* Bouton SIGNER */}
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
