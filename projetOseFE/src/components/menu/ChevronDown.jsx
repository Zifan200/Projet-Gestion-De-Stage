import { useEffect, useRef } from "react";
import gsap from "gsap";

export const ChevronDown = ({ open }) => {
    const ref = useRef(null);

    useEffect(() => {
        if (!ref.current) return;

        gsap.to(ref.current, {
            rotate: open ? 180 : 0,
            duration: 0.25,
            ease: "power2.out",
        });
    }, [open]);

    return (
        <svg
            ref={ref}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-500"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12.0607 6.74999L11.5303 7.28032L8.7071 10.1035C8.31657 10.4941 7.68341 10.4941 7.29288 10.1035L4.46966 7.28032L3.93933 6.74999L4.99999 5.68933L5.53032 6.21966L7.99999 8.68933L10.4697 6.21966L11 5.68933L12.0607 6.74999Z"
                fill="currentColor"
            />
        </svg>
    );
};