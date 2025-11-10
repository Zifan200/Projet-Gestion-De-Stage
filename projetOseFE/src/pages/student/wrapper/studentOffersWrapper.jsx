import React, { useEffect, useState } from "react";
import { StudentOffers } from "./../studentOffers.jsx";
import { StudentOffersPhone } from "../phone/studentOffersPhone.jsx";

export const StudentOffersWrapper = ({ sidebarLinks, title, DesktopComponent = StudentOffers }) => {
    const [isPhone, setIsPhone] = useState(false);

    useEffect(() => {
        const checkPhone = () => {
            setIsPhone(window.innerWidth <= 480 || window.screen.width <= 480);
        };

        checkPhone();
        window.addEventListener("resize", checkPhone);
        return () => window.removeEventListener("resize", checkPhone);
    }, []);

    return isPhone ? (
        <StudentOffersPhone sidebarLinks={sidebarLinks} title={title} />
    ) : (
        <DesktopComponent sidebarLinks={sidebarLinks} title={title} />
    );
};
