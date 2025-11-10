import React, { useEffect, useState } from "react";
import { OfferListPhone } from "../phone/OfferListPhone.jsx";
import {OfferList} from "../offerList.jsx";
ç

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
