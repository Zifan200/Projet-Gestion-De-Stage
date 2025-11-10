import { useState, useRef, useEffect } from "react";
import { MegaMenu } from "./Menu";
import { ChevronDown } from "./ChevronDown";
import { menuConfig } from "../../config/menuConfig.js";
import { LanguageSwitcher } from "../LanguageSwitcher.jsx";
import useAuthStore from "../../stores/authStore";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover.jsx";

const HOVER_OPEN_DELAY = 40;
const HOVER_CLOSE_DELAY = 180;

const Navbar = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const productsBtnRef = useRef(null);
  const [menuLeft, setMenuLeft] = useState(0);
  const openTimer = useRef(null);
  const closeTimer = useRef(null);
  const wrapperRef = useRef(null);
  const { t } = useTranslation("menu");
  const navigate = useNavigate();

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
        HOVER_CLOSE_DELAY
    );
  };

  const cancelClose = () => {
    clearTimeout(closeTimer.current);
  };

  const gotoDashboard = () => {
    if (isAuthenticated) {
      if (user.role === "STUDENT") navigate("/dashboard/student/");
      if (user.role === "EMPLOYER") navigate("/dashboard/employer/");
      if (user.role === "GESTIONNAIRE") navigate("/dashboard/gs/");
    }
  };

  const disconnect = () => {
    navigate("/");
    logout();
  };

  const settings = () => {
    if (isAuthenticated) {
      if (user.role === "STUDENT") navigate("/dashboard/student/settings");
      if (user.role === "EMPLOYER") navigate("/dashboard/employer/settings");
      if (user.role === "GESTIONNAIRE") navigate("/dashboard/gs/settings");
    }
  };

  return (
      <nav
          ref={wrapperRef}
          onMouseLeave={scheduleClose}
          className="relative flex flex-wrap items-center px-8 py-4 border-b border-zinc-200 bg-white phone:px-4 phone:py-3"
      >
        {/* Logo */}
        <div className="text-xl font-bold mr-8 phone:mr-0">OSE 2.0</div>

        {/* Hamburger mobile */}
        <button
            className="hidden phone:block ml-auto"
            onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg
              className="w-6 h-6 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
          >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Menu principal */}
        <div
            className={`flex items-center gap-6 phone:flex-col phone:w-full phone:mt-2 phone:gap-2 ${
                mobileOpen ? "phone:flex" : "phone:hidden"
            }`}
        >
          {menuConfig.map((menu, idx) => {
            const isDropdown = menu.sections && menu.sections.length > 0;
            return (
                <button
                    key={menu.id}
                    ref={idx === 0 ? productsBtnRef : null}
                    className={`flex items-center gap-1 px-4 py-2 font-medium transition ${
                        activeMenu === menu.id
                            ? "text-black"
                            : "text-gray-700 hover:text-black"
                    } phone:w-full phone:text-left phone:px-2 phone:py-1`}
                    onMouseEnter={isDropdown ? () => scheduleOpen(menu.id) : undefined}
                    onFocus={isDropdown ? () => scheduleOpen(menu.id) : undefined}
                    onBlur={isDropdown ? scheduleClose : undefined}
                    onClick={
                      !isDropdown
                          ? () =>
                              menu.link?.href && window.location.assign(menu.link.href)
                          : undefined
                    }
                >
                  {t(menu.label)}
                  {isDropdown && <ChevronDown open={activeMenu === menu.id} />}
                </button>
            );
          })}
        </div>

        {/* MegaMenu */}
        <MegaMenu
            activeMenu={activeMenu}
            menuConfig={menuConfig}
            left={menuLeft}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
        />

        {/* Language switcher */}
        <div className="ml-auto phone:ml-0 mt-2 phone:mt-2">
          <LanguageSwitcher />
        </div>

        {/* User info */}
        {isAuthenticated && (
            <div className="ml-4 phone:ml-0 mt-2 phone:mt-2">
              <Popover>
                {({ open, setOpen, triggerRef, contentRef }) => (
                    <>
                      <PopoverTrigger
                          open={open}
                          setOpen={setOpen}
                          triggerRef={triggerRef}
                      >
                        <div className="rounded-full bg-lime-200 w-[35px] h-[35px] flex cursor-pointer">
                    <span className="m-auto font-bold text-black">
                      {user?.firstName?.[0] ?? "?"}
                    </span>
                        </div>
                      </PopoverTrigger>

                      <PopoverContent open={open} contentRef={contentRef}>
                        <div className="w-50 p-2">
                          <p className="mb-2 font-bold">
                            {t("hello")} {user?.firstName} 👋
                          </p>
                          <div className="h-[1px] bg-zinc-300 w-full my-3"></div>
                          <button
                              className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
                              onClick={gotoDashboard}
                          >
                            {t("dashboard")}
                          </button>
                          <button
                              className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
                              onClick={disconnect}
                          >
                            {t("disconnect")}
                          </button>
                          <button
                              className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
                              onClick={settings}
                          >
                            {t("settings")}
                          </button>
                          <div className="h-[1px] bg-zinc-300 w-full my-3"></div>
                          <div className="px-2">
                            <PopoverClose setOpen={setOpen} />
                          </div>
                        </div>
                      </PopoverContent>
                    </>
                )}
              </Popover>
              <span className="ml-2">
            {user?.firstName} {user?.lastName}
          </span>
            </div>
        )}
      </nav>
  );
};

export default Navbar;
