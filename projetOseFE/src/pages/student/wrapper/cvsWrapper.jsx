import React, { useEffect, useState } from "react";
import { CvsPhone } from "./../phone/cvsPhone.jsx";
import { StudentCVs } from "../cvs.jsx";

export const CvsWrapper = () => {
    const [isPhone, setIsPhone] = useState(false);

    useEffect(() => {
        const checkPhone = () => {
            setIsPhone(window.innerWidth <= 480 || window.screen.width <= 480);
        };

        checkPhone();
        window.addEventListener("resize", checkPhone);
        return () => window.removeEventListener("resize", checkPhone);
    }, []);

    return isPhone ? <CvsPhone /> : <StudentCVs />;
};
