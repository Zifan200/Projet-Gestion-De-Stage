import React, {useEffect, useState} from "react";
import {Header} from "../../components/ui/header.jsx";
import {Table} from "../../components/ui/table.jsx";
import {useGeStore}  from "../../stores/geStore.js";
import {useTranslation} from "react-i18next";
import { toast } from "sonner";
import { Button } from "../../components/ui/button.jsx";
import useAuthStore from "../../stores/authStore.js";
import {useOfferStore} from "../../stores/offerStore.js";
import {
    ReaderIcon
} from "@radix-ui/react-icons";
export const GsAllStudentsWithApplications = () => {

    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);

    const [currentProgram, setCurrentProgram] = useState([]);
    const [currentStudentApplications, setCurrentStudentApplications] = useState([]);


    const studentNameFilterTypes = {
        ALPHABETICAL: t("gsManageApplicants.filters.studentNameFilters.alphabetical"),
        REVERSE_ALPHABETICAL: t("gsManageApplicants.filters.studentNameFilters.reverseAlphabetical"),
    };
    const [currentStudentNameFilter, setCurrentStudentNameFilter] = useState(studentNameFilterTypes.ALPHABETICAL)

    const {
        students,
        loading,
        error,
        loadStudentsWithApplications,
    } = useGeStore();

    const {
        programs, loadPrograms,
    }= useOfferStore();

    useEffect(() => {
        const loadAllData = async () => {
            //
            await loadStudentsWithApplications();
            //
            await loadPrograms();
        };
        loadAllData();
    },[]);

    //
    useEffect(() => {
        applyCurrentFilter();
    },[currentStudentNameFilter]);

    const sortStudentsNameAlphabetical = (studentsList) => {
        let list = [... studentsList].sort((a, b) => a.firstName.localeCompare(b.firstName))
        return list;
    };

    const sortStudentsNameReverseAlphabetical = (studentsList) => {
        let list = [...studentsList].sort((b, a) => a.firstName.localeCompare(b.firstName));
        return list;
    };

    const applyCurrentFilter = () => {
        let listToFilter = [];
        switch (currentStudentNameFilter) {
            case studentNameFilterTypes.ALPHABETICAL: listToFilter = sortStudentsNameAlphabetical(students); break;
            case studentNameFilterTypes.REVERSE_ALPHABETICAL: listToFilter = sortStudentsNameReverseAlphabetical(students); break;
        }

        let filtered = listToFilter;
        setCurrentStudentApplications(filtered);
    };

    const openStudentApplicaitonsList = async (studentEmail) => {
        try {
            await viewStudentApplicaitonList(studentEmail);
            const { selectedOffer, isModalOpen } = useOfferStore.getState();
            setSelectedOffer(selectedOffer);
            setIsModalOpen(isModalOpen);
        } catch (err) {
            console.error(err);
            toast.error(t("offer.errors.loadOffer"));
        }
    };

    const tableRows = () => currentStudentApplications.map((student) => (
        <tr key={student.id} className="border-t border-gray-300">
            <td className="px-4 py-2">{student.firstName} {student.lastName}</td>
            <td className="px-4 py-2">{student.program}</td>
            <td className="px-4 py-2">{student.numberOfApplications}</td>
            {/*<td className="px-4 py-2">{new Date(offer.expirationDate).toLocaleDateString()}</td>*/}
            <td>
                <button  className="rounded-full p-2 bg-lime-300 hover:bg-lime-600" onClick={() => openStudentApplicaitonsList(student.email)}>
                    <ReaderIcon/>
                </button>
            </td>
        </tr>
    ));


    return <div className="space-y-6">
        {loading ? <p>{t("gsManageApplicants.loading")}</p> :
            <>
                <Header title={t("gsManageApplicants.title")} />
                {/* Filtrage status */}
                <select className="px-2" value={currentStudentNameFilter} onChange={e => setCurrentStudentNameFilter(e.target.value)}>
                    {Object.values(studentNameFilterTypes).map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                {/*TODO add translations for programs*/}
                {/*/!* Filtrage programmes *!/*/}
                {/*<select className="px-2" value={currentProgram} onChange={e => setCurrentProgram(e.target.value)}>*/}
                {/*    <option value={t("offer.filter.program.all")}>{t("offer.filter.program.all")}</option>*/}
                {/*    {programs.map(p => <option key={p} value={p}>{p}</option>)}*/}
                {/*</select>*/}

                <Table
                    headers={[
                        t("gsManageApplicants.tableHeader.studentName"),
                        t("gsManageApplicants.tableHeader.studentProgramme"),
                        t("gsManageApplicants.tableHeader.numberOfApplications"),
                        t("gsManageApplicants.tableHeader.actions")
                    ]}
                    rows={tableRows()}
                    emptyMessage={t("gsManageApplicants.noApplicants")}
                />
            </>
        }
    </div>
}