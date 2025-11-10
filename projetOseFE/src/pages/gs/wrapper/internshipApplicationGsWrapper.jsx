import React, { useEffect, useState } from "react";
import { InternshipApplicationsGsPhone } from "../phone/internshipApplicationGsPhone.jsx";
import {InternshipApplicationsGE} from "../internshipApplication.jsx";

export const InternshipApplicationsGsWrapper = ({ DesktopComponent = InternshipApplicationsGE, className }) => {
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
        <InternshipApplicationsGsPhone />
    ) : (
        <DesktopComponent className={className} />
    );
};
