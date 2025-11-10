import React, { useState, useEffect } from "react";
import { DashboardGsPhone } from "../phone/dashboardGsPhone.jsx";
import { GsDashboard } from "../dashboard.jsx";

export const DashboardGsWrapper = ({ DesktopComponent = GsDashboard, className }) => {
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
        <DashboardGsPhone />
    ) : (
        <DesktopComponent className={className} />
    );
};
