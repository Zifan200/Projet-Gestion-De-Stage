import React, { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "../../stores/authStore";

export const DashboardLayout = ({ sidebarLinks, title }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const asideRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  const toggleSidebar = () => {
    if (!asideRef.current) return;

    if (!isOpen) {
      asideRef.current.classList.remove("hidden");
      gsap.fromTo(
        asideRef.current,
        { x: -250, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, ease: "power3.out" },
      );
      setIsOpen(true);
    } else {
      gsap.to(asideRef.current, {
        x: -250,
        opacity: 0,
        duration: 0.4,
        ease: "power3.in",
        onComplete: () => {
          asideRef.current.classList.add("hidden");
          setIsOpen(false);
        },
      });
    }
  };

  return (
    <div className="flex h-screen bg-white relative">
      <button
        onClick={toggleSidebar}
        className="absolute top-4 left-4 z-50 p-2 bg-white border border-zinc-300 rounded-full shadow-sm md:hidden"
      >
        {isOpen ? (
          <X
            className="w-4
        h-4"
          />
        ) : (
          <Menu className="w-4 h-4" />
        )}
      </button>

      <aside
        ref={asideRef}
        id="aside"
        className="hidden min-w-[250px]  md:flex md:flex-col w-64 bg-[#FAFAFA] border-r border-gray-200 p-6"
      >
        <h1 className="text-xl mt-10 font-bold mb-6">{title}</h1>
        <nav className="space-y-3">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname.endsWith(link.href);
            return (
              <NavLink
                key={link.key}
                to={link.href}
                className={`flex items-center gap-2 p-2 rounded-lg ${
                  isActive ? "bg-[#B3FE3B]" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <link.icon className="w-5 h-5" />
                <div>{link.label}</div>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 p-6 ">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
