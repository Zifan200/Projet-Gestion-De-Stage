import { useState, useRef, useEffect } from "react";
import { MegaMenu } from "./Menu";
import { ChevronDown } from "./ChevronDown";
import { menuConfig } from "../../config/menuConfig.js";
import { LanguageSwitcher } from "../LanguageSwitcher.jsx";

const HOVER_OPEN_DELAY = 40;
const HOVER_CLOSE_DELAY = 180;

const Navbar = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const productsBtnRef = useRef(null);
  const [menuLeft, setMenuLeft] = useState(0);
  const openTimer = useRef(null);
  const closeTimer = useRef(null);
  const wrapperRef = useRef(null);

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
      className="relative flex items-center px-8 py-4 border-b border-zinc-200"
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
              {menu.label}
              {isDropdown ? (
                <ChevronDown open={activeMenu === menu.id} />
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
      <LanguageSwitcher />
    </nav>
  );
};

export default Navbar;
