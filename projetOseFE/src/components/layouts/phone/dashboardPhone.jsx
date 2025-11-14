import React, { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "../../../stores/authStore";

export const DashboardPhoneLayout = ({ sidebarLinks, title }) => {
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
                { x: 0, opacity: 1, duration: 0.4, ease: "power3.out" }
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

    const handleLinkClick = () => {
        // Ferme le menu si mobile
        if (window.innerWidth < 768 && isOpen) toggleSidebar();
    };

    return (
        <div className="flex h-screen bg-white relative">
            {/* Hamburger menu bouton visible uniquement sur mobile */}
            <button
                onClick={toggleSidebar}
                className="absolute top-4 left-4 z-50 p-2 bg-white border border-zinc-300 rounded-full shadow-sm md:hidden"
            >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Overlay sombre quand le menu mobile est ouvert */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside
                ref={asideRef}
                className="fixed inset-y-0 left-0 w-64 bg-[#FAFAFA] border-r border-gray-200 p-6 transform -translate-x-full md:translate-x-0 md:relative md:flex md:flex-col z-50 hidden md:flex"
            >
                <h1 className="text-xl font-bold mb-6">{title}</h1>
                <nav className="space-y-3">
                    {sidebarLinks.map((link) => {
                        const isActive = location.pathname.endsWith(link.href);
                        return (
                            <NavLink
                                key={link.key}
                                to={link.href}
                                onClick={handleLinkClick}
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

            {/* Contenu principal */}
            <main className="flex-1 p-6 md:ml-64">
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
