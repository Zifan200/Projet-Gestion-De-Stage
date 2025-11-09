import React, {useEffect, useState, useMemo} from "react";
import {useTranslation} from "react-i18next";
import {toast} from "sonner";
import {useEmployerStore} from "../../stores/employerStore.js";
import {useCvStore} from "../../stores/cvStore.js";
import useAuthStore from "../../stores/authStore.js";
import {Table} from "../../components/ui/table.jsx";
import {TableActionButton} from "../../components/ui/tableActionButton.jsx";

import {Modal} from "../../components/ui/modal.jsx";
import {Header} from "../../components/ui/header.jsx";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverClose,
} from "../../components/ui/popover.jsx";
import {
    DownloadIcon,
    FileTextIcon,
    Cross2Icon,
    CheckIcon, CheckboxIcon, CircleIcon,
} from "@radix-ui/react-icons";


import {
    AlertCircle,
    AlertCircleIcon,
    CheckCircleIcon,
    CheckSquareIcon,
    PhoneCallIcon,
    PhoneIcon,
    ContactIcon
} from "lucide-react";
import {convocationSchema} from "../../models/convocation.js";
import {authService} from "../../services/authService.js";
import {Warning} from "postcss";

export const InternshipApplications = () => {
    const {t} = useTranslation("internship_applications");
    const user = useAuthStore((s) => s.user);

    const {
        fetchApplications,
        fetchListConvocation,
        approveApplication,
        rejectApplication,
        loading
    } = useEmployerStore();
    const {
        previewUrl,
        previewType,
        previewCvForEmployer,
        downloadCvForEmployer,
        closePreview,
    } = useCvStore();
    const {createConvocation: sendConvocation} = useEmployerStore();

    const [currentApplicationsList, setCurrentApplicationsList] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);

    const convocations = useEmployerStore((s) => s.convocations);
    const applications =  useEmployerStore((s) => s.applications);


    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("details");
    const [modalType, setModalType] = useState(null);

    const [filterStatus, setFilterStatus] = useState(null);
    const [filterSession, setFilterSession] = useState("All");
    const [filterYear, setFilterYear] = useState("All");

    const [modeConvocation, setModeConvocation] = useState("");
    const [dateConvocation, setDateConvocation] = useState("");
    const [timeConvocation, setTimeConvocation] = useState("09:00");

    const [link, setLink] = useState("");
    const [location, setLocation] = useState("");
    const [rejectReason, setRejectReason] = useState("");

    useEffect(() => {
        //load all applications
        const loadAllData = async () => {
            await fetchApplications();
            await fetchListConvocation();
            // const applications =
        }
        loadAllData();

        //
    }, []);

    // Gestion acceptation
    const handleApproveApplication = async (application) => {
        try {
            await approveApplication(user.token, application.id);
            toast.success(t("success.accepted"));
        } catch {
            toast.error(t("errors.accept"));
        }
    };

    // Gestion rejet
    const handleRejectApplication = async (reason) => {
        try {
            await rejectApplication(user.token, selectedApplication.id, reason);
            toast.success(t("success.rejected"));
            setIsModalOpen(false);
            setModalMode("details");
            setRejectReason("");
            setSelectedApplication(null);
        } catch {
            toast.error(t("errors.reject"));
        }
    };

// Gestion actions (vue, téléchargement, etc.)
    const handleAction = (action, app) => {

        if (action === "convocation" && app.status !== "ACCEPTED") {
            return toast.error(t("errors.convocations"))
        }

        try {
            switch (action) {
                case "view":
                    // setSelectedApplication(app);
                    // setIsModalOpen(true);
                    break;
                case "preview":
                    previewCvForEmployer(app.selectedCvFileData, app.selectedCvFileName);
                    break;
                case "download":
                    downloadCvForEmployer(app.selectedCvFileData, app.selectedCvFileName);
                    break;
                case "convocation" :
                    setSelectedApplication(app);
                    setIsModalOpen(true);
                    setModalType("convocation");
                    break;
                case "accept":
                    handleApproveApplication(app);
                    break;
                case "reject":
                    handleRejectApplication(app);
                    break;
                default:
                    break;
            }
        } catch (err) {
            toast.error(err.message || t("errors.downloadCv"));
        }
    };


    function isOfferedInterview(application) {
        if (!Array.isArray(convocations)) return false;

        return convocations.some((convocation, i) => {
            if (!convocation) {
                console.warn(`Convocation at index ${i} is undefined:`, convocations);
                return false;
            }

            return convocation.internshipApplicationId === application.id;
        });
    }

    function getConvocationDate(application) {
        if (!Array.isArray(convocations) || convocations.length === 0) return "";

        const convocation = convocations.find(
            (c) => c && c.internshipApplicationId === application.id
        );

        return convocation
            ? new Date(convocation.convocationDate).toLocaleString()
            : "";
    }






    const tableRows = () => applications.map((application) => (
        <tr key={application.id}
            className="select-none pt-4 w-fit border-t border-gray-200 text-gray-700 text-sm"
        >
            {/*offer title*/}
            <td className="px-4 py-3 align-middle md:whitespace-nowrap">
                <div
                    className="items-center px-3 py-1.5 text-md">
                    {application.internshipOfferTitle}
                </div>
            </td>
            {/*student name*/}
            <td className="px-4 py-3 align-middle md:whitespace-nowrap">
                <div
                    className="inline-flex items-center px-3 py-1.5 text-md transition-colors ">
                    {application.studentFirstName} {application.studentLastName}
                </div>
            </td>
            {/*student email*/}
            <td className="px-4 py-3 align-middle md:whitespace-nowrap">{application.studentEmail}</td>
            {/*applicaiton date*/}
            <td className="px-4 py-3 align-middle md:whitespace-nowrap">
                {new Date(application.createdAt).toLocaleDateString()} {" "}
                {new Date(application.createdAt).toLocaleTimeString()}
            </td>
            {/*actions*/}
            <td className="px-4 py-3 align-middle flex gap-2 md:whitespace-nowrap">
                <TableActionButton icon={FileTextIcon} label={t("table.preview")}
                                   bg_color={"indigo-100"} text_color={"indigo-700"}
                                   onClick={() => {
                                       previewCvForEmployer(application.selectedCvFileData, application.selectedCvFileName);
                                   }}
                />

                <TableActionButton icon={DownloadIcon} label={t("table.download")}
                                   bg_color={"green-100"} text_color={"green-700"}
                                   onClick={() => {
                                       downloadCvForEmployer(application.selectedCvFileData, application.selectedCvFileName);
                                   }}
                />

                        <TableActionButton icon={ContactIcon} 
                                                         label={!isOfferedInterview(application) ? t("table.convocation") : 
                                                         getConvocationDate(application)}
                                           bg_color={"amber-100"} text_color={"amber-700"}
                                           onClick={() => {
                                               setSelectedApplication(application);
                                               setIsModalOpen(true);
                                               setModalType("convocation");
                                               console.log(convocations)
                                           }}
                                           interactive={!isOfferedInterview(application)}
                                           inactive_text_color={"blue-500"}
                        />

            </td>
        </tr>
    ));

    return (
        <div className="space-y-6">
            <Header title={t("title")}/>

            {/* Tableau */}
            {loading ? <p>{t("table.loading")}</p> :
                // <DataTable columns={columns} data={tableData} onAction={handleAction}/>}
                <Table
                    headers={[
                        t("table.offerTitle"),
                        t("table.studentName"),
                        t("table.studentEmail"),
                        t("table.appliedAt"),
                        t("table.action"),

                    ]}
                    rows={tableRows()}
                    emptyMessage={t("table.noApplications")}
                />
            }

            {/* Aperçu du CV */}
            {previewUrl && (
                <div className="mt-6 p-4 border-t border-gray-300 bg-gray-50 rounded">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-semibold">{t("previewCv")}</h3>
                        <button
                            className="flex items-center gap-2 px-3 py-2 text-white bg-red-500 rounded hover:bg-red-600"
                            onClick={closePreview}
                        >
                            <Cross2Icon className="w-4 h-4"/>
                            {t("closeCvPreview")}
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

            {selectedApplication && isModalOpen && modalType !== "convocation" && (
                <Modal
                    open={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setModalMode("details");
                        setRejectReason("");
                        setSelectedApplication(null);
                    }}
                    title={
                        modalMode === "details"
                            ? selectedApplication
                                ? `${selectedApplication.studentFirstName} ${selectedApplication.studentLastName}`
                                : ""
                            : t("reasonModal.title")
                    }
                    size="default"
                    footer={
                        modalMode === "details" ? (
                            <>
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setModalMode("details");
                                        setSelectedApplication(null);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                                >
                                    <span>{t("modal.close")}</span>
                                </button>
                                {selectedApplication?.status === "PENDING" && (
                                    <>
                                        <button
                                            onClick={() => setModalMode("reject")}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-red-100 text-red-700 hover:bg-red-200"
                                        >
                                            <Cross2Icon className="w-4 h-4"/>
                                            <span>{t("table.reject")}</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleApproveApplication(selectedApplication);
                                                setIsModalOpen(false);
                                                setModalMode("details");
                                                setSelectedApplication(null);
                                            }}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                        >
                                            <CheckIcon className="w-4 h-4"/>
                                            <span>{t("table.accept")}</span>
                                        </button>
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        setModalMode("details");
                                        setRejectReason("");
                                    }}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                                >
                                    <span>{t("reasonModal.cancel")}</span>
                                </button>
                                <button
                                    onClick={() => {
                                        if (!rejectReason.trim()) {
                                            toast.error(t("reasonModal.errorEmpty"));
                                            return;
                                        }
                                        handleRejectApplication(rejectReason);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-red-100 text-red-700 hover:bg-red-200"
                                >
                                    <span>{t("reasonModal.confirm")}</span>
                                </button>
                            </>
                        )
                    }
                >

                {modalMode === "reject" && (
                    <div className="space-y-4">
                        <p className="text-gray-600">{t("reasonModal.description")}</p>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t("reasonModal.label")}
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder={t("reasonModal.placeholder")}
                                className="w-full min-h-[150px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                        </div>
                    </div>
                )}
            </Modal>
        )}

        {modalType === "convocation" && isModalOpen && selectedApplication && (
            <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded shadow-lg w-3/4 max-w-lg">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <PhoneCallIcon className="w-5 h-5 text-blue-500"/>
                        {t("convocations.title")}
                        {selectedApplication.studentFirstName}{" "}
                        {selectedApplication.studentLastName}
                    </h2>

                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();

                            try {
                                const token = localStorage.getItem("token");
                                if (!token) {
                                    toast.error(t(errors.noToken));
                                    return;
                                }

                                const employerData = await authService.getMe(token);
                                if (!employerData?.email) {
                                    toast.error(t("errors.noAccessibleEmployerData"));
                                    return;
                                }

                                const dateTimeConvocation = `${dateConvocation}T${timeConvocation}`;

                                const formData = {
                                    studentEmail: selectedApplication.studentEmail,
                                    employerEmail: employerData.email,
                                    convocationDate: dateTimeConvocation,
                                    location,
                                    link,
                                    internshipApplicationId: selectedApplication.id
                                };

                                const result = convocationSchema.safeParse(formData);

                                if (!result.success) {
                                    toast.error(result.error.errors[0]?.message || t("errors.form"));
                                    return;
                                }
                                toast.success(t("convocations.success"));
                                await sendConvocation(formData)
                                setIsModalOpen(false);
                                setSelectedApplication(null);
                                setModalType(null);

                            } catch (error) {
                                toast.error(error.message || t("convocation.unknown"));
                            }
                        }}
                        className="flex flex-col gap-4"
                    >
                        <div className="flex flex-col">
                            <label className="text-sm font-medium mb-1">
                                {t("convocations.date")}
                            </label>
                            <input
                                type="date"
                                min={new Date().toString().split("T")[0]}
                                value={dateConvocation}
                                onChange={(e) => setDateConvocation(e.target.value)}
                                className="border border-gray-300 rounded p-2"
                                required
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-medium mb-1">{t("convocations.time")}</label>
                            <input
                                type="time"
                                value={timeConvocation}
                                onChange={(e) => setTimeConvocation(e.target.value)}
                                className="border border-gray-300 rounded p-2"
                                required
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-medium mb-1">
                                {t("convocations.type")}
                            </label>
                            <select
                                value={modeConvocation}
                                onChange={(e) => {
                                    setModeConvocation(e.target.value);
                                    setLocation("");
                                    setLink("");
                                }}
                                className="border border-gray-300 rounded p-2"
                                required
                            >
                                <option value="placeholder" >{t("convocations.select")}</option>
                                <option value="online">{t("convocations.online")}</option>
                                <option value="in-person">{t("convocations.inPerson")}</option>
                            </select>
                        </div>

                        {modeConvocation === "online" && (
                            <div className="flex flex-col">
                                <label className="text-sm font-medium mb-1">{t("convocations.online")}</label>
                                <input
                                    type="url"
                                    placeholder="https://meet.google.com/..."
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    className="border border-gray-300 rounded p-2"
                                    required
                                />
                            </div>
                        )}

                        {modeConvocation === "in-person" && (
                            <div className="flex flex-col">
                                <label className="text-sm font-medium mb-1">{t("convocations.address")}</label>
                                <input
                                    type="text"
                                    placeholder="Ex : 1111 Rue Lapierre"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="border border-gray-300 rounded p-2"
                                    required
                                />
                            </div>
                        )}

                        <div className="flex mt-6 justify-end gap-3">
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                <PhoneCallIcon className="w-4 h-4" />
                                {t("modal.submit")}
                            </button>

                            <button
                                type="button"
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedApplication(null);
                                    setModalType(null);
                                }}
                            >
                                <Cross2Icon className="w-4 h-4" />
                                {t("modal.close")}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  )
}
