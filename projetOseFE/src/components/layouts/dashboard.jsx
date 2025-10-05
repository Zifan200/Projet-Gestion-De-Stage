import React, { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "../../stores/authStore";

export const DashboardLayout = ({ sidebarLinks, title }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const navigator = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigator("/");
    }
  });
  return (
    <div className="flex h-screen bg-[#fff]">
      <aside className="w-64 bg-[#FAFAFA] border-r border-gray-200 p-6">
        <h1 className="text-xl font-bold mb-6">{title}</h1>
        <nav className="space-y-3">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname.endsWith(link.href);

            return (
              <NavLink
                key={link.key}
                to={link.href}
                className={`flex items-center gap-2 p-2 rounded-lg ${
                  isActive ? "bg-[#B3FE3B] " : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </NavLink>
            );
          })}{" "}
        </nav>
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={window.location.pathname}
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
