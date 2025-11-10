import React, { useEffect, useState } from "react";
import { DashboardCardPhoneStudent } from "../phone/dashboardCardPhone.jsx";

export const DashboardCardWrapperStudent = ({ sidebarLinks, title, DesktopComponent, className }) => {
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
        <DashboardCardPhoneStudent sidebarLinks={sidebarLinks} title={title} />
    ) : (
        <DesktopComponent sidebarLinks={sidebarLinks} title={title} className={className} />
    );
};
