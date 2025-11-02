import React, {useEffect, useState} from "react";
import {Header} from "../../components/ui/header.jsx";
import {Table} from "../../components/ui/table.jsx";
import {useGeStore} from "../../stores/geStore.js";
import {useTranslation} from "react-i18next";
import {toast} from "sonner";
import {Button} from "../../components/ui/button.jsx";
import useAuthStore from "../../stores/authStore.js";
import {useOfferStore} from "../../stores/offerStore.js";
import {
    ReaderIcon
} from "@radix-ui/react-icons";
import {useNavigate} from "react-router";

export const ModalSelectedOfferApplicants = ({offerId}) => {
    const navigate = useNavigate();
    const {t} = useTranslation();
    const user = useAuthStore((s) => s.user);

    const [currentProgram, setCurrentProgram] = useState([]);
    const [currentStudentApplications, setCurrentStudentApplications] = useState([]);
    const [selectedOfferApplicationsList, setSelectedOfferApplicationsList] = useState([])


    const studentNameFilterTypes = {
        ALPHABETICAL: t("selectedOfferApplicationsList.filters.studentNameFilters.alphabetical"),
        REVERSE_ALPHABETICAL: t("selectedOfferApplicationsList.filters.studentNameFilters.reverseAlphabetical"),
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
    }, [selectedOfferApplicationsList, currentStudentNameFilter]);

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

    const openStudentApplicationsList = async (studentEmail) => {
        try {
            await viewStudentApplicaitonList(studentEmail);
            const {selectedOffer, isModalOpen} = useOfferStore.getState();
            setSelectedOffer(selectedOffer);
            setIsModalOpen(isModalOpen);
        } catch (err) {
            console.error(err);
            toast.error(t("offer.errors.loadOffer"));
        }
    };


    //affich les modals
    function componentCustomModal(modalTitle, content, onBtnClose) {
        return <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-3/4 max-w-lg">
                <h2 className="text-xl font-semibold mb-4">{modalTitle}</h2>
                {content}
                <div className="flex w-auto justify-between mt-6 justify-end">
                    <button
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={() => {
                            onBtnClose()
                        }}
                    >
                        {t("offer.modal.close")}
                    </button>
                </div>
            </div>
        </div>
    }

    const tableRows = () => selectedOfferApplicationsList.map((application) => (
        <tr key={application.id} className="border-t border-gray-300">
            <td className="px-4 py-1 w-auto">{application.studentFirstName} {application.studentLastName}</td>
            <td className="px-4 py-1 w-auto">{application.studentProgrammeName}</td>
            <td className="px-4 py-1 w-auto">N/A</td>
            <td className="px-4 py-1 w-auto">{application.status}</td>
            <td className="px-4 py-1 w-auto">{application.internshipOfferPublishedDate}</td>

        </tr>
    ));


    return <div className="flex flex-col gap-1 py-5">
        <div>
            <span>{t("selectedOfferApplicationsList.filters.filterName")} : </span>
            <select className="px-2" value={currentStudentNameFilter}
                    onChange={e => setCurrentStudentNameFilter(e.target.value)}>
                {Object.values(studentNameFilterTypes).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        </div>
        <div className="overflow-auto h-132">
            {loading ? <p>{t("selectedOfferApplicationsList.loading")}</p> :
                <>

                    <Table
                        headers={[
                            t("selectedOfferApplicationsList.tableHeader.studentName"),
                            t("selectedOfferApplicationsList.tableHeader.studentProgramme"),
                            t("Cv"),
                            t("selectedOfferApplicationsList.tableHeader.applicationStatus"),
                            t("selectedOfferApplicationsList.tableHeader.applicationDate"),

                        ]}
                        rows={tableRows()}
                        emptyMessage={t("selectedOfferApplicationsList.noApplicants")}
                    />
                </>
            }
        </div>
    </div>

}