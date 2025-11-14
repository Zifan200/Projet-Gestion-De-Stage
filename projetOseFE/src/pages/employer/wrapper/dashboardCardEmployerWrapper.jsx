// src/components/layouts/wrapper/DashboardCardWrapper.jsx
import React, { useState, useEffect } from "react";
import { DashboardCardPhone } from "../phone/dashboardCardPhone.jsx";
import {EmployerDashboard} from "../dashboard.jsx"; // version desktop

/**
 * Wrapper responsive pour le dashboard employeur
 * Affiche DashboardCardPhone si écran ≤ 480px, sinon la version desktop
 */
export const DashboardCardEmployerWrapper = ({ sidebarLinks, title }) => {
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