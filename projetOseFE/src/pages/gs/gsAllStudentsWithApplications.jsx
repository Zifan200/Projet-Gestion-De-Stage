import {useState} from "react";
import useAuthStore from "../../stores/authStore.js";
import {useTranslation} from "react-i18next";

export const GsAllStudentsWithApplications = () => {
    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);

    //status filter
    //enterprise filter
    //name filter

    return <div></div>
}