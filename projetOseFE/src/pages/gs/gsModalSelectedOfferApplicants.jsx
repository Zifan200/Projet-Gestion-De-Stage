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

export const ModalSelectedOfferApplicants = () => {
    const navigate = useNavigate();
    const {t} = useTranslation();
    const user = useAuthStore((s) => s.user);

    const [currentProgram, setCurrentProgram] = useState([]);
    const [currentStudentApplications, setCurrentStudentApplications] = useState([]);


    const studentNameFilterTypes = {
        ALPHABETICAL: t("selectedOfferApplicationsList.filters.studentNameFilters.alphabetical"),
        REVERSE_ALPHABETICAL: t("selectedOfferApplicationsList.filters.studentNameFilters.reverseAlphabetical"),
    };
    const [currentStudentNameFilter, setCurrentStudentNameFilter] = useState(studentNameFilterTypes.ALPHABETICAL)

    const {
        selectedOfferApplications,
        loading,
        error,
    } = useGeStore();

    const {
        programs, loadPrograms,
    } = useOfferStore();

    useEffect(() => {
        const loadAllData = async () => {
            await loadPrograms();
        };

        loadAllData();
    }, []);

    //
    useEffect(() => {
        applyCurrentFilter();
    }, [currentStudentNameFilter]);

    const sortStudentsNameAlphabetical = (studentsList) => {
        let list = [...studentsList].sort((a, b) => a.firstName.localeCompare(b.firstName))
        return list;
    };

    const sortStudentsNameReverseAlphabetical = (studentsList) => {
        let list = [...studentsList].sort((b, a) => a.firstName.localeCompare(b.firstName));
        return list;
    };

    const applyCurrentFilter = () => {
        let listToFilter = [];
        switch (currentStudentNameFilter) {
            case studentNameFilterTypes.ALPHABETICAL:
                listToFilter = sortStudentsNameAlphabetical(selectedOfferApplications);
                break;
            case studentNameFilterTypes.REVERSE_ALPHABETICAL:
                listToFilter = sortStudentsNameReverseAlphabetical(selectedOfferApplications);
                break;
        }

        let filtered = listToFilter;
        setCurrentStudentApplications(filtered);
    };

    const openStudentApplicaitonsList = async (studentEmail) => {
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


    const PillButton = ({onClick, label, Icon, className = ""}) => (
        <button
            onClick={onClick}
            // 👇 use a uniquely named group for this button only
            className={`max-w-32 group/button flex items-center justify-center md:justify-start gap-2 rounded-full
                w-full md:w-10 hover:w-auto max-w-full px-3 py-2 transition-all duration-300 overflow-hidden ${className}`}
        >
            {/* Icon — visible only on medium screens and up */}
            <Icon
                className="hidden md:block group-hover:hidden text-white transition-colors duration-300 flex-shrink-0"
            />

            {/* Label — always visible on small screens, animated on desktop */}
            <span
                className="text-sm text-white text-start
                 overflow-hidden whitespace-nowrap
                 md:group-hover/button:whitespace-normal break-words
                 opacity-100
                 md:opacity-0
                 md:group-hover/button:opacity-100
                 transition-opacity duration-300 ease-in-out
                 md:inset-0 flex items-center justify-center"
            >
      {label}
    </span>


        </button>
    );


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

    const tableRows = () => currentStudentApplications.map((student) => (
        <tr key={student.id} className="border-t border-gray-300">
            <td className="px-4 py-1 w-auto">{student.firstName} {student.lastName}</td>
            <td className="px-4 py-1 w-auto">{student.program}</td>

            <td className="px-4 py-1 relative w-[160px] text-center"> {/* fixed width, centered */}
                <div className="relative flex justify-center items-center gap-2 group">
                    <div className="flex justify-center items-center gap-2 transition-all duration-300">
                        <PillButton
                            onClick={() => openStudentApplicaitonsList(student.email)}
                            label={t("selectedOfferApplicationsList.btnLabels.applicationsList")}
                            Icon={ReaderIcon}
                            className="bg-sky-300 hover:bg-sky-600 w-auto max-w-full"
                        />
                    </div>
                </div>
            </td>


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
                        ]}
                        rows={tableRows()}
                        emptyMessage={t("selectedOfferApplicationsList.noApplicants")}
                    />
                </>
            }
        </div>
    </div>

}