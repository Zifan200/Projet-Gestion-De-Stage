import { useTranslation } from "react-i18next";
import React, { useEffect, useMemo, useState } from "react";
import { Header } from "../../components/ui/header.jsx";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "../../components/ui/popover.jsx";
import { Cross2Icon, DownloadIcon, EyeOpenIcon, FileTextIcon, PlusIcon } from "@radix-ui/react-icons";
import { TableActionButton } from "../../components/ui/tableActionButton.jsx";
import { Table } from "../../components/ui/table.jsx";
import useAuthStore from "../../stores/authStore.js";
import useGeStore from "../../stores/geStore.js";
import { Modal } from "../../components/ui/modal.jsx";
import { useInternshipAgreementStore } from "../../stores/internshipAgreementStore.js";
import PdfViewerEntente from "../../components/PdfViewerEntente.jsx";
import { PDFDocument } from "pdf-lib";

export const GsInternshipAgreements = () => {
    const user = useAuthStore((s) => s.user);
    const { t } = useTranslation("internship_agreements");
    const {
        createInternshipAgreement,
        previewAgreement,
        downloadAgreement,
        resetAgreement,
        signAgreement,
        previewUrl
    } = useInternshipAgreementStore();

    const { applications, loadAllInternshipApplications, loading } = useGeStore();
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
    const [signatureGestionnaire, setSignatureGestionnaire] = useState("");
    const fullName = `${user.firstName} ${user.lastName}`.trim();


    useEffect(() => {
        loadAllInternshipApplications();
    }, [loadAllInternshipApplications]);

    const handleCreateAgreement = async (app) => {
        try {
            await createInternshipAgreement(user.token, app, user.id, user.role);
            loadAllInternshipApplications();
        } catch (err) {
            console.error("Erreur lors de la création de l'entente:", err);
        }
    };

    const handleSign = async () => {
        console.log("Signature gestionnaire:",selectedApplication);

        try {
            // Appel du store pour signer l'entente côté backend
            const pdfUrl = await signAgreement(
                user.token,
                selectedApplication.ententeStagePdfId,
                signatureGestionnaire,
                user.id,
                selectedApplication // on transmet l'application entière
            );

            window.alert("PDF signé avec succès !");
            console.log("Nouvelle URL du PDF signé:", pdfUrl);
        } catch (err) {
            console.error("Erreur lors de la signature de l'entente :", err);
            window.alert("Une erreur est survenue lors de la signature du PDF.");
        }
    };


    const tableRows = () =>
        sortedAndFilteredApplications.map((app) => (
            <tr key={app.id} className="select-none pt-4 w-fit border-t border-gray-200 text-gray-700 text-sm">
                <td className="px-4 py-3">{app.internshipOfferTitle}</td>
                <td className="px-4 py-3">{app.employerEnterpriseName}</td>
                <td className="px-4 py-3">{app.studentFirstName} {app.studentLastName}</td>
                <td className="px-4 py-3 flex gap-2">
                    <TableActionButton
                        icon={EyeOpenIcon}
                        label={t("table.actionView")}
                        bg_color="indigo-100"
                        text_color="indigo-700"
                        onClick={() => setIsModalOpen(true)} // juste ouvrir le modal, pas de setSelectedApplication
                    />


                    {!app.claimed ? (
                        <TableActionButton
                            icon={PlusIcon}
                            label={t("table.createAgreement")}
                            bg_color="amber-100"
                            text_color="amber-700"
                            onClick={() => handleCreateAgreement(app)}
                        />
                    ) : (
                        <>
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

                            <TableActionButton
                                icon={DownloadIcon}
                                label={t("table.download")}
                                bg_color="green-100"
                                text_color="green-700"
                                onClick={() => downloadAgreement(user.token, app.ententeStagePdfId)}
                            />
                        </>
                    )}
                </td>
            </tr>
        ));

    const sortedAndFilteredApplications = useMemo(() => {
        return applications
            ?.filter(app => app.session === "Hiver")
            .filter(app => app.etudiantStatus === "CONFIRMED_BY_STUDENT" && app.postInterviewStatus === "ACCEPTED")
            .filter(app => {
                if (!app.startDate) return false;
                const year = new Date(app.startDate).getFullYear();
                return filterYear === "All" || year.toString() === filterYear.toString();
            })
            .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    }, [applications, filterYear]);

    const availableYears = Array.from(new Set(applications?.filter(app => app.startDate).map(app => new Date(app.startDate).getFullYear())))
        .sort((a, b) => b - a);

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

            {/* Vue détaillée de la candidature */}
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

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.scheduleType")}</h3>
                                <p className="text-gray-600">{selectedApplication.typeHoraire}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.hourAmount")}</h3>
                                <p className="text-gray-600">{selectedApplication.nbHeures}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.salary")}</h3>
                                <p className="text-gray-600">
                                    {selectedApplication.salary.toLocaleString(
                                        localStorage.getItem("lang") === "fr" ? "fr-CA" : "en-CA",
                                        { style: "currency", currency: "CAD" }
                                    )}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("modal.appliedAt")}</h3>
                                <p className="text-gray-600">{new Date(selectedApplication.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* PDF Preview */}
            {previewUrl && (
                <div className="mt-4 space-y-4">
                    {/* Bouton fermer */}
                    <div className="flex justify-end mb-2">
                        <button
                            onClick={resetAgreement}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-red-200"
                        >
                            <Cross2Icon className="w-4 h-4" />
                            <span>{t("pdf.close")}</span>
                        </button>
                    </div>

                    {/* PDF */}
                    <PdfViewerEntente previewUrl={previewUrl} />

                    {/* Champ de signature */}
                    <div className="mt-4">
                        <label className="block font-medium mb-1">
                            {t("pdf.signatureLabel")}
                        </label>
                        <input
                            type="text"
                            value={signatureGestionnaire}
                            onChange={(e) => setSignatureGestionnaire(e.target.value)}
                            placeholder={t("pdf.signaturePlaceholder")}
                            className="w-full border px-3 py-2 rounded-md"
                        />
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
