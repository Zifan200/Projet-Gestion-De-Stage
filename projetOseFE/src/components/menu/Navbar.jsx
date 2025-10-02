import {useState, useRef, useEffect} from "react";
import {MegaMenu} from "./Menu";
import {ChevronDown} from "./ChevronDown";
import {menuConfig} from "../../config/menuConfig.js";
import {LanguageSwitcher} from "../LanguageSwitcher.jsx";
import useAuthStore from "../../stores/authStore";
import {Link} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {Popover, PopoverClose, PopoverContent, PopoverTrigger} from "../ui/popover.jsx";

const HOVER_OPEN_DELAY = 40;
const HOVER_CLOSE_DELAY = 180;

const Navbar = () => {
    const [activeMenu, setActiveMenu] = useState(null);
    const productsBtnRef = useRef(null);
    const [menuLeft, setMenuLeft] = useState(0);
    const openTimer = useRef(null);
    const closeTimer = useRef(null);
    const wrapperRef = useRef(null);
    const { t } = useTranslation();

    // Handling du user
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const logout = useAuthStore((state) => state.logout);

    useEffect(() => {
        const updateLeft = () => {
            if (!productsBtnRef.current || !wrapperRef.current) return;
            const btn = productsBtnRef.current.getBoundingClientRect();
            const wrapper = wrapperRef.current.getBoundingClientRect();
            setMenuLeft(btn.left - wrapper.left);
        };
        updateLeft();
        window.addEventListener("resize", updateLeft);
        return () => window.removeEventListener("resize", updateLeft);
    }, []);

    const scheduleOpen = (id) => {
        clearTimeout(closeTimer.current);
        clearTimeout(openTimer.current);
        openTimer.current = setTimeout(() => setActiveMenu(id), HOVER_OPEN_DELAY);
    };

    const scheduleClose = () => {
        clearTimeout(openTimer.current);
        clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(
            () => setActiveMenu(null),
            HOVER_CLOSE_DELAY,
        );
    };

    const cancelClose = () => {
        clearTimeout(closeTimer.current);
    };

    return (
        <nav
            ref={wrapperRef}
            onMouseLeave={scheduleClose}
            className="relative flex items-center px-8 py-4 border-b border-zinc-200 bg-white"
        >
            <div className="text-xl font-bold mr-8">OSE 2.0</div>
            <div className="flex items-center gap-6">
                {menuConfig.map((menu, idx) => {
                    const isDropdown = menu.sections && menu.sections.length > 0;
                    return (
                        <button
                            key={menu.id}
                            ref={idx === 0 ? productsBtnRef : null}
                            className={`flex items-center gap-1 px-4 py-2 font-medium transition ${activeMenu === menu.id ? "text-black" : "text-gray-700 hover:text-black"}`}
                            onMouseEnter={
                                isDropdown ? () => scheduleOpen(menu.id) : undefined
                            }
                            onFocus={isDropdown ? () => scheduleOpen(menu.id) : undefined}
                            onBlur={isDropdown ? scheduleClose : undefined}
                            onClick={
                                !isDropdown
                                    ? () => {
                                        if (menu.link && menu.link.href)
                                            window.location.assign(menu.link.href);
                                    }
                                    : undefined
                            }
                        >
                            {t(menu.label)}
                            {isDropdown ? (
                                <ChevronDown open={activeMenu === menu.id}/>
                            ) : null}
                        </button>
                    );
                })}
            </div>
            <MegaMenu
                activeMenu={activeMenu}
                menuConfig={menuConfig}
                left={menuLeft}
                onMouseEnter={cancelClose}
                onMouseLeave={scheduleClose}
            />
            <div className="ml-10">
                <LanguageSwitcher/>
            </div>
            <div className={"ml-auto mr-10"}>
                {isAuthenticated && (
                    <>
                        <div className={"flex"}>
                            <Popover>
                                {({open, setOpen, triggerRef, contentRef}) => (
                                    <>
                                        <PopoverTrigger open={open} setOpen={setOpen} triggerRef={triggerRef}>
                                            <div
                                                className="rounded-full bg-lime-200 w-[35px] h-[35px] flex cursor-pointer">
                                             <span className="m-auto font-bold text-black">
                                                {user?.firstName?.[0] ?? "?"}
                                             </span>
                                            </div>
                                        </PopoverTrigger>

                                        <PopoverContent open={open} contentRef={contentRef}>
                                            <div className="w-50 p-2">
                                                <p className="mb-2 bold">{t("menu.hello")} {user?.firstName} 👋</p>
                                                <div
                                                    className={"h-[1px] bg-zinc-300 w-full mt-3 mb-3 ml-auto mr-auto"}></div>
                                                <button
                                                    className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
                                                    onClick={() => console.log("Dashboard")}
                                                >
                                                    {t("menu.dashboard")}
                                                </button>
                                                <button
                                                    className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
                                                    onClick={logout}
                                                >
                                                    {t("menu.disconnect")}
                                                </button>
                                                <div
                                                    className={"h-[1px] bg-zinc-300 w-full mt-3 mb-3 ml-auto mr-auto"}></div>
                                                <div className={"px-2"}>
                                                    <PopoverClose setOpen={setOpen}/>
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </>
                                )}
                            </Popover>
                            <span className={"mt-auto mb-auto ml-2"}>{user?.firstName} {user?.lastName}</span>
                        </div>
                    </>
                )}
            </div>

        </nav>
    );
};

export default Navbar;
