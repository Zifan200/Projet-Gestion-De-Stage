import React, {useEffect, useState} from "react";
import {
    Cross2Icon,
    FileIcon,
    ReaderIcon
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

export const ModalSelectedOfferApplicants = ({offerId}) => {
    const {t} = useTranslation("gs_modal_selectedOfferApplications");
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);

    const [currentProgram, setCurrentProgram] = useState([]);
    const [currentStudentApplications, setCurrentStudentApplications] = useState([]);
    const [selectedOfferApplicationsList, setSelectedOfferApplicationsList] = useState([])
    const [selectedApplicationCv, setSelectedApplicationCv] = useState(null)

    const [previewId, setPreviewId] = useState(null);

    const handlePreview = (applicationCv) => {
        if (applicationCv.selectedCvFileType === "application/pdf") setPreviewId(applicationCv.selectedCvID);
        else alert("cant open cv");
    };


    const studentNameFilterTypes = {
        ALPHABETICAL: t("filterLabels.alphabetical"),
        REVERSE_ALPHABETICAL: t("filterLabels.reverseAlphabetical"),
    };
    const [currentStudentNameFilter, setCurrentStudentNameFilter] = useState(studentNameFilterTypes.ALPHABETICAL)

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
            await loadAllApplicationsFromInternshipOffer(offerId)
            const {selectedOfferApplicationsList} = useGeStore.getState();
            setSelectedOfferApplicationsList(selectedOfferApplicationsList)
            console.log(offerId)
        };
        loadAllData();
        applyCurrentFilter();
    }, []);

    //
    useEffect(() => {
        applyCurrentFilter();
    }, [ currentStudentNameFilter]);

    const sortStudentsNameAlphabetical = (applicationsList) => {
        let list = [...applicationsList].sort((a, b) => a.studentFirstName.localeCompare(b.studentFirstName))
        return list;
    };

    const sortStudentsNameReverseAlphabetical = (applicationsList) => {
        let list = [...applicationsList].sort((b, a) => a.studentFirstName.localeCompare(b.studentFirstName));
        return list;
    };

    const applyCurrentFilter = () => {
        let listToFilter = [];
        switch (currentStudentNameFilter) {
            case studentNameFilterTypes.ALPHABETICAL:
                listToFilter = sortStudentsNameAlphabetical(selectedOfferApplicationsList);
                break;
            case studentNameFilterTypes.REVERSE_ALPHABETICAL:
                listToFilter = sortStudentsNameReverseAlphabetical(selectedOfferApplicationsList);
                break;
        }

        let filtered = listToFilter;
        setSelectedOfferApplicationsList(filtered);
    };

    const tableRows = () => selectedOfferApplicationsList.map((application) => (
        <tr key={application.id}
            className="select-none w-fit border-0.5"
            onClick={()=>{

            }}
        >
            <td className="px-4 py-1 w-auto">
                <div
                    onClick={()=>{
                        console.log("student selected : " + application.studentFirstName + " " + application.studentLastName)
                    }}
                    className="inline-flex items-center px-3 py-1.5 rounded-md text-md font-bold transition-colors bg-blue-100 hover:bg-blue-200">
                    {application.studentFirstName} {application.studentLastName}
                </div>
            </td>
            <td className="px-4 py-1 w-auto">{application.studentProgrammeName}</td>
            <td className="px-4 py-1 w-auto">
                <button
                    onClick={()=>{
                        console.log("open applicaiton cv : " + application.selectedCvID)
                        // setSelectedApplicationCv(application.selectedCvID)
                        handlePreview(application)
                    }}
                    className="flex rounded-full p-2 w-8 h-8 transition-colors bg-lime-100 hover:bg-lime-200"><FileIcon className="justify-center"/></button>
            </td>
            <td className="px-4 py-1 w-auto">{application.status}</td>
            <td className="px-4 py-1 w-auto">{application.internshipOfferPublishedDate}</td>

        </tr>
    ));


    return <div className="w-fit h-fit">
        <div className="pb-3">
            <span>{t("filterType.applicantName")} : </span>
            <select className="px-2" value={currentStudentNameFilter}
                    onChange={e => setCurrentStudentNameFilter(e.target.value)}>
                {Object.values(studentNameFilterTypes).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        </div>
        <div className="overflow-auto h-132 border-1 border-gray-400">
            {loading ? <p>{t("loading")}</p> :
                <>
                    {previewId ?
                        <div className="mt-4 w-lvh">
                            <div className="sticky flex justify-end mb-2">
                                <button
                                    onClick={() => setPreviewId(null)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-red-100 text-red-700 hover:bg-red-200"
                                >
                                    <Cross2Icon className="w-4 h-4" />
                                    <span>{t("menu.close")}</span>
                                </button>
                            </div>
                            <PdfViewer cvId={previewId} role="gs" />
                        </div>
                     :
                    <Table
                        headers={[
                            t("tableHeaders.studentName"),
                            t("tableHeaders.studentProgramme"),
                            t("Cv"),
                            t("tableHeaders.applicationStatus"),
                            t("tableHeaders.applicationDate"),

                        ]}
                        rows={tableRows()}
                        emptyMessage={t("noApplications")}
                    />}
                </>
            }
        </div>

    </div>

}