import {useEffect, useState} from "react";
import {Header} from "../../components/ui/header.jsx";
import {Table} from "../../components/ui/table.jsx";
import useGeStore  from "../../stores/geStore.js";
import {useTranslation} from "react-i18next";
import { toast } from "sonner";
import { Button } from "../../components/ui/button.jsx";
import useAuthStore from "../../stores/authStore.js";

export const GsAllStudentsWithApplications = () => {

    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const [currentStudentApplications, setCurrentStudentApplications] = useState([]);

    //status filter
    //enterprise filter
    //name filter

    const {
        students, loadStudentsWithApplications,
        loading,
        error
    } = useGeStore();

    useEffect(() => {
        const loadAllData = async () => {
            await loadStudentsWithApplications();
        };
        loadAllData();
    }, []);
    //
    useEffect(() => {
        setCurrentStudentApplications(students);
    });

    const tableRows = () => currentStudentApplications.map((student) => (
        <tr key={student.id} className="border-t border-gray-300">
            <td className="px-4 py-2">{student.firstName} {student.lastName}</td>
            <td className="px-4 py-2">{student.program}</td>
            <td className="px-4 py-2"></td>
            {/*<td className="px-4 py-2">{new Date(offer.expirationDate).toLocaleDateString()}</td>*/}
            <td>
                <Button
                    label={t("gsStudentsWithApplications.btnLabels.listApplications")}
                    className="w-1/2"
                    // onClick={() => openOffer(offer.id)}
                />
            </td>
        </tr>
    ));
//TODO add translations
    return <div>
        {loading ? <p>{t("gsStudentsWithApplications.loading")}</p> :
            <>
                <Header title={t("gsStudentsWithApplications.title")} />
                <Table
                    headers={[
                        t("gsStudentsWithApplications.tableHeader.studentName"),
                        t("gsStudentsWithApplications.tableHeader.studentProgramme"),
                        t("gsStudentsWithApplications.tableHeader.numberOfApplications"),
                        t("gsStudentsWithApplications.tableHeader.applications")
                    ]}
                    rows={tableRows()}
                    emptyMessage={t("gsStudentsWithApplications.noApplicants")}
                />
            </>
        }
    </div>
}