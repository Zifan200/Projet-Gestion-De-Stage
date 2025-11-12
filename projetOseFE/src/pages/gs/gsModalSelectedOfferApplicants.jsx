import React, {useEffect, useState} from "react";
import {
    Cross2Icon,
    FileIcon, FileTextIcon,
    ReaderIcon, TriangleDownIcon
} from "@radix-ui/react-icons";
import {useNavigate} from "react-router";
import {Table} from "../../components/ui/table.jsx";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverClose,
} from "../../components/ui/popover.jsx";
import {useGeStore} from "../../stores/geStore.js";
import {useTranslation} from "react-i18next";
import useAuthStore from "../../stores/authStore.js";
import {useOfferStore} from "../../stores/offerStore.js";
import PdfViewer from "../../components/CvViewer.jsx";
import {toast} from "sonner";
import {TableActionButton} from "../../components/ui/tableActionButton.jsx";

export const ModalSelectedOfferApplicants = ({offerId}) => {
    const {t} = useTranslation("gs_modal_selectedOfferApplications");
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);

// store both the original unmodified list and the filtered list
    const [originalList, setOriginalList] = useState([]);
    const [selectedOfferApplicationsList, setSelectedOfferApplicationsList] = useState([]);

    const [currentProgram, setCurrentProgram] = useState([]);
    const [currentStudentApplications, setCurrentStudentApplications] = useState([]);
    const [selectedApplicationCv, setSelectedApplicationCv] = useState(null)

    const [previewId, setPreviewId] = useState(null);

    const applicationStatuses = {
        PENDING: "PENDING",
        ACCEPTED: "ACCEPTED",
        REJECTED: "REJECTED",
    };

    const handlePreview = (applicationCv) => {
        if (applicationCv.selectedCvFileType === "application/pdf") setPreviewId(applicationCv.selectedCvID);
        else toast.error(t("errors.openCv"));
    };


    const elementOrderFilterTypes = {
        ORDERED: "▲",
        REVERSE_ORDERED: "▼",
    };

    const sortTypes = {
        NAME: "name",
        DATE: "date",
    };
    const [currentStudentNameFilter, setCurrentStudentNameFilter] = useState(elementOrderFilterTypes.ORDERED)
    const [currentApplicationDateFilter, setCurrentApplicationDateFilter] = useState(elementOrderFilterTypes.ORDERED)
    const [activeSortType, setActiveSortType] = useState("date"); // or "name"

    const {
        selectedOfferApplications,
        loadAllApplicationsFromInternshipOffer,
        loading,
        error,
    } = useGeStore();

    const {
        programs, loadPrograms,
    } = useOfferStore();

    useEffect(() => {
        const loadAllData = async () => {
            await loadPrograms();
            await loadAllApplicationsFromInternshipOffer(offerId);
            const { selectedOfferApplicationsList } = useGeStore.getState();
            console.log("Loaded applications: ", selectedOfferApplicationsList);

            // keep a clean copy for filtering later
            setOriginalList(selectedOfferApplicationsList);
            setSelectedOfferApplicationsList(selectedOfferApplicationsList);
        };
        loadAllData();
    }, []);
    const selectedOfferApplicationsListFromStore = useGeStore(
        (state) => state.selectedOfferApplicationsList
    );


    useEffect(() => {
        setOriginalList(selectedOfferApplicationsListFromStore);
        setSelectedOfferApplicationsList(selectedOfferApplicationsListFromStore);
    }, [selectedOfferApplicationsListFromStore]);



    //
    useEffect(() => {
        handleActiveSorting();
    }, [currentStudentNameFilter, currentApplicationDateFilter]);

    const handleActiveSorting=() =>{
        //NOTE to me(zohn): update icon of other sorts later
        if (activeSortType === sortTypes.DATE) {
            applyDateSort();
        } else if(activeSortType === sortTypes.NAME) {
            applyNameSort();
        }
    }
    const applyNameSort= () => {
        let list = [...originalList]; // always start from the clean copy

        // --- Name filter ---
        switch (currentStudentNameFilter) {
            case elementOrderFilterTypes.ORDERED: // A → Z
                list.sort((a, b) => a.studentFirstName.localeCompare(b.studentFirstName));
                break;
            case elementOrderFilterTypes.REVERSE_ORDERED: // Z → A
                list.sort((a, b) => b.studentFirstName.localeCompare(a.studentFirstName));
                break;
            default:
                break;
        }

        setSelectedOfferApplicationsList(list);
    }
    const applyDateSort= () => {
        let list = [...originalList]; // always start from the clean copy

        // --- Date filter ---
        switch (currentApplicationDateFilter) {
            case elementOrderFilterTypes.ORDERED: // oldest first
                list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case elementOrderFilterTypes.REVERSE_ORDERED: // newest first
                list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            default:
                break;
        }

        setSelectedOfferApplicationsList(list);
    };



    function statusTranslation(applicationStatus) {
        switch (applicationStatus) {
            case applicationStatuses.PENDING:
                return t("applicationStatus.pending");
            case applicationStatuses.ACCEPTED:
                return t("applicationStatus.accepted");
            case applicationStatuses.REJECTED:
                return t("applicationStatus.rejected");
        }
    }

    const getStatusColor = (status) => {
        const statusColors = {
            pending: "bg-yellow-100 text-yellow-800",
            accepted: "bg-green-100 text-green-800",
            rejected: "bg-red-100 text-red-800",
        };
        return statusColors[status?.toLowerCase()] || "bg-gray-100 text-gray-700";
    };


    const tableRows = () => selectedOfferApplicationsList.map((application) => (
        <tr key={application.id}
            className="select-none pt-4 w-fit border-t border-gray-200 text-gray-700 text-sm" >
            <td className="px-4 py-1 w-auto">
                <div
                    onClick={() => {
                        console.log("student selected : " + application.studentFirstName + " " + application.studentLastName)
                    }}
                    className="inline-flex items-center px-3 py-1.5 rounded-md text-md font-bold transition-colors bg-blue-100 hover:bg-blue-200">
                    {application.studentFirstName} {application.studentLastName}
                </div>
            </td>
            <td className="px-4 py-1 w-auto">{application.studentProgrammeName}</td>
            <td className="px-4 py-1 w-auto">
                <TableActionButton
                    icon={FileTextIcon}
                    bg_color={"blue-200"} text_color = {"blue-700"}
                    label={""+application.selectedCvFileType}
                    onClick={() => {
                        setSelectedApplicationCv(application.selectedCvID)
                        handlePreview(application)
                    }}
                />
            </td>
            <td className="px-4 py-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(application.status)}`}>
                    {statusTranslation(application.status)}
                </span>
            </td>
            <td className="px-4 py-1 w-auto">{new Date(application.createdAt).toLocaleString()}</td>

        </tr>
    ));


    return <div className="w-full h-full">
        <div className="overflow-auto max-h-96 border border-gray-300 rounded-lg">
            {loading ? <p>{t("loading")}</p> :
                <>
                    {previewId ?
                        <div className="mt-4 w-lvh">
                            <div className="sticky flex justify-end mb-2">
                                <button
                                    onClick={() => setPreviewId(null)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-red-100 text-red-700 hover:bg-red-200"
                                >
                                    <Cross2Icon className="w-4 h-4"/>
                                    <span>{t("menu.close")}</span>
                                </button>
                            </div>
                            <PdfViewer cvId={previewId} role="gs"/>
                        </div>
                        :
                        <Table
                            headers={[
                                <div>
                                    {t("tableHeaders.studentName")}
                                    <select  className={`w-5 px-1 mx-2 rounded appearance-none text-center focus:bg-yellow-300 ${activeSortType===sortTypes.NAME?" bg-yellow-300":""}`} value={currentStudentNameFilter}
                                            onClick={()=>{setActiveSortType(sortTypes.NAME)}}
                                             onChange={(e) => {
                                                setActiveSortType(sortTypes.NAME)
                                                setCurrentStudentNameFilter(e.target.value)
                                            }}>
                                        {Object.values(elementOrderFilterTypes).map((s,i) => <option key={i} value={s}>{s}</option>)}
                                    </select>
                                </div>,
                                t("tableHeaders.studentProgramme"),
                                t("Cv"),
                                t("tableHeaders.applicationStatus"),
                                <div>
                                    {t("tableHeaders.applicationDate")}
                                    <select  className={`w-5 px-1 mx-2 rounded appearance-none text-center focus:bg-yellow-300 ${activeSortType===sortTypes.DATE?" bg-yellow-300":""}`} value={currentApplicationDateFilter}
                                             onClick={()=>{setActiveSortType(sortTypes.DATE)}}
                                             onChange={(e) => {
                                                 setActiveSortType(sortTypes.DATE)
                                                 setCurrentApplicationDateFilter(e.target.value)
                                             }}>
                                        {Object.values(elementOrderFilterTypes).map((s,i) => <option key={i} value={s}>{s}</option>)}
                                    </select>
                                </div>,

                            ]}
                            rows={tableRows()}
                            emptyMessage={t("noApplications")}
                        />}
                </>
            }
        </div>

    </div>

}