import React, {useEffect, useState} from "react";
import {GsDashboard} from "../dashboard.jsx";
import {DashboardGsPhone} from "../phone/dashboardGsPhone.jsx";

export const DashboardCardGsWrapper = () => {
    const [isPhone, setIsPhone] = useState(false);

    useEffect(() => {
        const checkPhone = () => {
            setIsPhone(window.innerWidth <= 480 || window.screen.width <= 480);
        };

        checkPhone();
        window.addEventListener("resize", checkPhone);

        return () => window.removeEventListener("resize", checkPhone);
    }, []);

    return isPhone ? <DashboardGsPhone /> : <GsDashboard />;
};