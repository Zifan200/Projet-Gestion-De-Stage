import React, {useEffect, useState} from "react";
import {StudentDashboard} from "../dashboard.jsx";
import {DashboardCardPhoneStudent} from "../phone/dashboardCardPhone.jsx";

export const DashboardCardStudentWrapper = () => {
    const [isPhone, setIsPhone] = useState(false);

    useEffect(() => {
        const checkPhone = () => {
            setIsPhone(window.innerWidth <= 480 || window.screen.width <= 480);
        };

        checkPhone();
        window.addEventListener("resize", checkPhone);

        return () => window.removeEventListener("resize", checkPhone);
    }, []);

    return isPhone ? <DashboardCardPhoneStudent /> : <StudentDashboard />;
};