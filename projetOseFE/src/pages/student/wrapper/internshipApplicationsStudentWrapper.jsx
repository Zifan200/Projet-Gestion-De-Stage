import React, { useEffect, useState } from "react";
import { StudentApplications } from "../internshipApplications.jsx";
import { InternshipApplicationStudentPhone } from "../phone/internshipApplicationsStudentPhone.jsx";

export const StudentApplicationsWrapper = ({ DesktopComponent = StudentApplications, className }) => {
    const [isPhone, setIsPhone] = useState(false);

    useEffect(() => {
        const checkPhone = () => {
            setIsPhone(window.innerWidth <= 430 || window.screen.width <= 430);
        };

        checkPhone();
        window.addEventListener("resize", checkPhone);
        return () => window.removeEventListener("resize", checkPhone);
    }, []);

    return isPhone ? (
        <InternshipApplicationStudentPhone />
    ) : (
        <DesktopComponent className={className} />
    );
};
