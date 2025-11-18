import React, { useEffect, useState } from "react";
import { DashboardPhoneLayout } from "../phone/dashboardPhone.jsx";
import { DashboardLayout } from "../dashboard.jsx";

export const PageWrapper = ({ title="", PhoneComponent, DesktopComponent, phoneClassName="", desktopClassName="", sidebarLinks=[]}) => {
    const [isPhone, setIsPhone] = useState(false);

    useEffect(() => {
        const checkPhone = () => {
            setIsPhone(window.innerWidth <= 480 || window.screen.width <= 480);
        };

        checkPhone();
        window.addEventListener("resize", checkPhone);
        return () => window.removeEventListener("resize", checkPhone);
    }, []);

    return isPhone && PhoneComponent ? (
        <PhoneComponent sidebarLinks={sidebarLinks} title={title} ClassName={phoneClassName}/>
    ) : (
        <DesktopComponent sidebarLinks={sidebarLinks} title={title} ClassName={desktopClassName}/>
    );
};
