import React, {useEffect, useState} from "react";
import useAuthStore from "../../stores/authStore.js";
import useGeStore  from "../../stores/geStore.js";
import {useTranslation} from "react-i18next";
import { toast } from "sonner";
import { Button } from "../../components/ui/button.jsx";
import {Header} from "../../components/ui/header.jsx";
import {Table} from "../../components/ui/table.jsx";

export const GsAllStudentsWithApplications = () => {

    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const [currentStudentApplications, setCurrentStudentApplications] = useState([]);

    //status filter
    //enterprise filter
    //name filter

    const {
        studentsWithApplications, loadAllStudentWithApplications,
        loading,
    } = useGeStore();

    useEffect(() => {
        setCurrentStudentApplications(studentsWithApplications);
    },[]);

    const tableRows = () => currentStudentApplications.map((student) => (
        <tr key={student.id} className="border-t border-gray-300">
            <td className="px-4 py-2">{student.firstName}</td>
            <td className="px-4 py-2">{student.lastName}</td>
            <td className="px-4 py-2">{student.program}</td>
            {/*<td className="px-4 py-2">{new Date(offer.expirationDate).toLocaleDateString()}</td>*/}
            {/*<td>*/}
            {/*    <Button*/}
            {/*        label={t("offer.actions.view")}*/}
            {/*        className="w-1/2"*/}
            {/*        onClick={() => openOffer(offer.id)}*/}
            {/*    />*/}
            {/*    <Button*/}
            {/*        onClick={() => handleDownload(offer.id)}*/}
            {/*        label={t("offer.actions.download")}*/}
            {/*        className="w-1/2 bg-amber-200 hover:bg-amber-50"*/}
            {/*    />*/}
            {/*</td>*/}
        </tr>
    ));
//TODO add translations
    return <div>
        {loading ? <p>{t("offer.table.loading")}</p> :
            <>
                <Header title={t("menu.allOffers")} />
                <Table
                    headers={[
                        // t("offer.table.offerTitle"),
                        // t("offer.table.enterprise"),
                        // t("offer.table.program"),
                        // t("offer.table.status"),
                        // t("offer.table.deadline"),
                        // t("offer.actions.view")
                        t("student name"),
                        t("programme"),
                        t("offer title"),
                        t("applyed to"),
                        t("date of applicaiton")
                    ]}
                    rows={tableRows()}
                    emptyMessage={t("offer.table.noOffers")}
                />
            </>
        }
    </div>
}