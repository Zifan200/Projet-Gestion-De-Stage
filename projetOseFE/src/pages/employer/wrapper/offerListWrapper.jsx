import React, { useEffect, useState } from "react";
import {OfferList} from "../offerList.jsx";
import {OfferListPhone} from "../phone/offerListPhone.jsx";

export const OfferListWrapper = () => {
    const [isPhone, setIsPhone] = useState(false);

    useEffect(() => {
        const checkPhone = () => {
            setIsPhone(window.innerWidth <= 480 || window.screen.width <= 480);
        };

        checkPhone();
        window.addEventListener("resize", checkPhone);

        return () => window.removeEventListener("resize", checkPhone);
    }, []);

    return isPhone ? <OfferListPhone /> : <OfferList />;
};
