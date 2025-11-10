import React, { useEffect, useState } from "react";
import { GsManageCvs } from "../cvs.jsx";
import { CvsGsPhone } from "../phone/cvsGsPhone.jsx";

export const CvsGsWrapper = ({ DesktopComponent = GsManageCvs, className }) => {
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
        <CvsGsPhone />
    ) : (
        <DesktopComponent className={className} />
    );
};
