import React, { useState, useEffect } from "react";
import { DashboardCardPhone } from "../phone/dashboardCardPhone.jsx";
import {EmployerDashboard} from "../dashboard.jsx";

export const DashboardCardWrapper = ({ sidebarLinks, title }) => {
    const [isPhone, setIsPhone] = useState(false);

    useEffect(() => {
        const checkPhone = () => {
            setIsPhone(window.innerWidth <= 480 || window.screen.width <= 480);
        };
        checkPhone(); // vérifie à l'initialisation
        window.addEventListener("resize", checkPhone);
        return () => window.removeEventListener("resize", checkPhone);
    }, []);

    return isPhone ? (
        <DashboardCardPhone />
    ) : (
        <EmployerDashboard sidebarLinks={sidebarLinks} title={title} />
    );
};
