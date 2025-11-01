import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useEmployerStore } from "../../stores/employerStore.js";
import { useCvStore } from "../../stores/cvStore.js";
import { toast } from "sonner";
import {FormTemplate} from "../../components/ui/form-template.jsx";
import {FormProvider, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {authService} from "../../services/authService.js";
import Label from "../../components/ui/label.js";
import Input from "../../components/ui/Input.jsx";
import {convocationSchema} from "../../models/convocation.js";

export const InternshipApplications = () => {
    const { t } = useTranslation();
    const { applications, fetchApplications } = useEmployerStore();
    const {
        previewUrl,
        previewType,
        previewCvForEmployer,
        downloadCvForEmployer,
        closePreview,
    } = useCvStore();
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConvocationClicked, setIsConvocationClicked] = useState(false);
    const [employer, setEmployer] = useState(null);

    useEffect(() => {
        const fetchEmployer = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;
            const data = await authService.getMe(token);
            setEmployer(data);
        };
        fetchEmployer();
    }, []);

    const form = useForm({
        resolver: zodResolver(convocationSchema),
        defaultValues: {
            etudiant: selectedApplication?.studentEmail | "",
            employer: employer?.email | "",
            dateConvocation: "",
            location: "",
            link:""
        },
    });

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleViewApplication = (application) => {
        setSelectedApplication(application);
        setIsModalOpen(true);
    };

    const handleConvocation = (application) => {
        setSelectedApplication(application);
        setIsModalOpen(true);
        setIsConvocationClicked(true);
    }

    const handlePreviewCv = (application) => {
        try {
            previewCvForEmployer(application.selectedCvFileData, application.selectedCvFileName);
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDownloadCv = (application) => {
        try {
            downloadCvForEmployer(application.selectedCvFileData, application.selectedCvFileName);
        } catch (err) {
            toast.error(t("internshipApplications.errors.downloadCv"));
        }
    };

    const onSubmit = async (data) => {
        toast("test");
    }

    const onError = (err) => {
        toast(t("errors.fillFields"));
    };

    return (
        <div className="p-10">
            {/* Table des candidatures */}
            <div className="overflow-x-auto bg-white shadow rounded">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-[#F9FBFC] text-gray-600 uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3">{t("internshipApplications.table.offerTitle") || "Offre"}</th>
                        <th className="px-4 py-3">{t("internshipApplications.table.studentName") || "Nom et Prénom"}</th>
                        <th className="px-4 py-3">{t("internshipApplications.table.studentEmail") || "Email"}</th>
                        <th className="px-4 py-3">{t("internshipApplications.table.cv") || "CV"}</th>
                        <th className="px-4 py-3">{t("internshipApplications.table.statusTitle") || "Statut"}</th>
                        <th className="px-4 py-3">{t("internshipApplications.table.action") || "Action"}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {applications.map((app) => (
                        <tr key={app.id} className="border-t border-zinc-300 text-zinc-700 text-base">
                            <td className="px-4 py-2">{app.internshipOfferTitle}</td>
                            <td className="px-4 py-2">{app.studentFirstName} {app.studentLastName}</td>
                            <td className="px-4 py-2">{app.studentEmail}</td>
                            <td className="px-4 py-2">
                                {app.selectedCvFileName ? (
                                    <>
                                        <button
                                            className="text-blue-600 underline hover:text-blue-800 mr-2"
                                            onClick={() => handlePreviewCv(app)}
                                        >
                                            {app.selectedCvFileName}
                                        </button>
                                        <button
                                            className="text-green-600 underline hover:text-green-800"
                                            onClick={() => handleDownloadCv(app)}
                                        >
                                            {t("internshipApplications.table.download")}
                                        </button>
                                    </>
                                ) : (
                                    t("internshipApplications.table.noCv")
                                )}
                            </td>
                            <td className="px-4 py-2">
                                {t(`internshipApplications.table.status.${app.status.toLowerCase()}`)}
                            </td>
                            <td className="px-4 py-2">
                                <button
                                    className="px-14 py-0.5 bg-[#B3FE3B] rounded-full font-bold text-lg hover:bg-green-400 transition-all duration-200"
                                    onClick={() => handleViewApplication(app)}
                                >
                                    {t("internshipApplications.table.actionView") || "Voir"}
                                </button>

                            </td>
                            <td className="px-4 py-2">
                                <button
                                    disabled={app.status !== "ACCEPTED"}
                                    className={`px-10 py-0.5 rounded-full font-bold text-lg transition-all duration-200
                                        ${app.status === "ACCEPTED"
                                        ? "bg-amber-200 hover:bg-amber-50 cursor-pointer"
                                        : "bg-gray-300 cursor-not-allowed opacity-60"}`}
                                    onClick={() => handleConvocation(app)}
                                >
                                    Convoquer
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Preview CV */}
            {previewUrl && (
                <div className="mt-6 p-4 border-t border-gray-300 bg-gray-50 rounded">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-semibold">{t("internshipApplications.previewCv")}</h3>
                        <button
                            className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
                            onClick={closePreview}
                        >
                            {t("internshipApplications.closeCvPreview")}
                        </button>
                    </div>
                    {previewType === "pdf" ? (
                        <iframe
                            src={previewUrl}
                            className="w-full h-[600px] border"
                            title="Preview CV"
                        />
                    ) : (
                        <a
                            href={previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                        >
                            Ouvrir le CV
                        </a>
                    )}
                </div>
            )}

            {/* Modal détails candidature */}
            {isModalOpen && selectedApplication && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-3/4 max-w-lg">
                        <h2 className="text-xl font-semibold mb-4">
                            {selectedApplication.studentFirstName} {selectedApplication.studentLastName}
                        </h2>
                        <p>
                            <strong>{t("internshipApplications.modal.email") || "Email"}: </strong>
                            {selectedApplication.studentEmail}
                        </p>
                        <p>
                            <strong>{t("internshipApplications.modal.cv") || "CV"}: </strong>
                            {selectedApplication.selectedCvFileName || "Aucun CV"}
                        </p>
                        <p>
                            <strong>{t("internshipApplications.modal.offerTitle") || "Offre"}: </strong>
                            {selectedApplication.internshipOfferTitle}
                        </p>
                        <p>
                            <strong>{t("internshipApplications.modal.appliedAt") || "Postulé le"}: </strong>
                            {new Date(selectedApplication.createdAt).toLocaleDateString()}
                        </p>
                        <p>
                            <strong>{t("internshipApplications.modal.statusTitle") || "Statut"}: </strong>
                            {t(`internshipApplications.modal.status.${selectedApplication.status.toLowerCase()}`)}
                        </p>
                        {selectedApplication.status === "REJECTED" &&
                            <p>
                                <strong>{t("internshipApplications.modal.reason") || "Raison"}: </strong>
                                {selectedApplication.reason}
                            </p>
                        }

                        <div className="mt-6 flex justify-end">
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedApplication(null);
                                }}
                            >
                                {t("internshipApplications.modal.close") || "Fermer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && selectedApplication && isConvocationClicked && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-3/4 max-w-lg">
                        <h2 className="text-xl font-semibold mb-4">
                            Convocation pour {selectedApplication.studentFirstName}{" "}
                            {selectedApplication.studentLastName}
                        </h2>

                        <FormProvider {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit, onError)}>
                                <div className="flex flex-col mb-7">
                                    <Label name="dateConvocation" label="Date de convocation" />
                                    <Input type="date" name="dateConvocation" />
                                </div>

                                <div className="flex flex-col mb-4">
                                    <Label name="typeConvocation" label="Type de convocation" />
                                    <select
                                        {...form.register("typeConvocation")}
                                        className="border px-2 py-1 rounded"
                                        defaultValue="placeholder"
                                    >
                                        <option value="placeholder" disabled hidden placeholder>Veuillez sélectionner un type de convocation</option>
                                        <option value="inPerson">En personne</option>
                                        <option value="online">En ligne</option>
                                    </select>
                                </div>

                                {form.watch("typeConvocation") === "inPerson" ? (
                                    <div className="flex flex-col mb-4">
                                        <Label name="location" label="Adresse" />
                                        <Input type="text" name="location" />
                                    </div>
                                ) : form.watch("typeConvocation") === "online" ?

                                (
                                    <div className="flex flex-col mb-4">
                                        <Label name="link" label="Lien de vidéoconférence" />
                                        <Input type="text" name="link" />
                                    </div>
                                )
                                :
                                    <div className="flex flex-col mb-24"></div>
                                }

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setSelectedApplication(null);
                                        }}
                                    >
                                        {t("internshipApplications.modal.close") || "Fermer"}
                                    </button>

                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        {t("internshipApplications.modal.submit") || "Fermer"}
                                    </button>
                                </div>
                            </form>
                        </FormProvider>
                    </div>
                </div>
            )}
        </div>
    );
};