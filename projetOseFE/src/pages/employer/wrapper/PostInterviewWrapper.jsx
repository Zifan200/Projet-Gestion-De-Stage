import React, { useEffect, useState } from "react";
import { PostInterview } from "../postInterview.jsx";
import { PostInterviewPhone } from "../phone/postInterviewPhone.jsx";

export const PostInterviewWrapper = () => {
    const [isPhone, setIsPhone] = useState(false);

    useEffect(() => {
        const checkPhone = () => {
            setIsPhone(window.innerWidth <= 480 || window.screen.width <= 480);
        };

        checkPhone();
        window.addEventListener("resize", checkPhone);

        return () => window.removeEventListener("resize", checkPhone);
    }, []);

    return isPhone ? <PostInterviewPhone /> : <PostInterview />;
};
