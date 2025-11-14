import React, { useEffect, useState } from "react";
import { InternshipApplicationsPhone } from "../phone/internshipApplicationPhone.jsx";
import { InternshipApplications } from "../internshipApplication.jsx";

export const InternshipApplicationsWrapper = () => {
    const [isPhone, setIsPhone] = useState(false);

    useEffect(() => {
        const checkPhone = () => {
            setIsPhone(window.innerWidth <= 480 || window.screen.width <= 480);
        };

        checkPhone();
        window.addEventListener("resize", checkPhone);

        return () => window.removeEventListener("resize", checkPhone);
    }, []);

    return isPhone ? <InternshipApplicationsPhone /> : <InternshipApplications />;
};
