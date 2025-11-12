import React, { useEffect, useState } from "react";
import OffresAConfirmer from "../internshipFinalDecision.jsx";
import OffresAConfirmerPhone from "../phone/internshipFinalDecisionPhone.jsx";

export const OffresAConfirmerWrapper = ({ DesktopComponent = OffresAConfirmer, className }) => {
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
        <OffresAConfirmerPhone />
    ) : (
        <DesktopComponent className={className} />
    );
};
