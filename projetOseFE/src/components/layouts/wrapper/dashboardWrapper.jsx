import React, { useEffect, useState } from "react";
import { DashboardPhone } from "../phone/dashboardPhone.jsx";
import { DashboardLayout } from "../dashboard.jsx";

export const DashboardPhoneWrapper = ({ sidebarLinks, title, DesktopComponent }) => {
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
        <DashboardPhone sidebarLinks={sidebarLinks} title={title} />
    ) : (
        <DesktopComponent sidebarLinks={sidebarLinks} title={title} />
    );
};
