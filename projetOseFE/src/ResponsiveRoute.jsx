import {useMediaQuery} from "./useMediaQuery.jsx";

export const ResponsiveRoute = ({ DesktopComponent, PhoneComponent }) => {
    const isPhone = useMediaQuery("(max-width: 430px)");
    return isPhone ? <PhoneComponent /> : <DesktopComponent />;
};
