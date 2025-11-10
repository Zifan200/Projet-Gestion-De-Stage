import React, { useEffect, useState } from "react";
import StudentConvocationDecisionPhone from "../phone/studenConvocationDecisionPhone.jsx";

export const StudentConvocationDecisionWrapper = ({ DesktopComponent, className }) => {
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
        <StudentConvocationDecisionPhone />
    ) : (
        <DesktopComponent className={className} />
    );
};
