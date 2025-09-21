import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { MegaMenuColumn } from "./MenuColumn";

export const MegaMenu = ({ activeMenu, menuConfig, left, onMouseEnter, onMouseLeave }) => {
    const containerRef = useRef(null);
    const contentRef = useRef(null);
    const [currentMenu, setCurrentMenu] = useState(null);

    useEffect(() => {
        if (!containerRef.current) return;
        if (activeMenu) {
            gsap.to(containerRef.current, {
                autoAlpha: 1,
                y: 0,
                duration: 0.25,
                ease: "power3.out",
                display: "grid",
            });
        } else {
            gsap.to(containerRef.current, {
                autoAlpha: 0,
                y: 10,
                duration: 0.2,
                ease: "power3.in",
                onComplete: () => {
                    if (containerRef.current) containerRef.current.style.display = "none";
                    setCurrentMenu(null);
                },
            });
        }
    }, [activeMenu]);

    useEffect(() => {
        if (!contentRef.current || !activeMenu) return;

        const tl = gsap.timeline();
        tl.to(contentRef.current.children, {
            opacity: 0,
            y: 6,
            duration: 0.12,
            stagger: 0.03,
        })
            .add(() => setCurrentMenu(activeMenu))
            .fromTo(
                contentRef.current.children,
                { opacity: 0, y: 6 },
                { opacity: 1, y: 0, duration: 0.2, stagger: 0.05 },
                "+=0.03"
            );
    }, [activeMenu]);

    const menu = menuConfig.find((m) => m.id === currentMenu);

    const cols = menu?.sections.length || 1;
    const colWidth = 280;
    const widthPx = cols * colWidth;

    return (
        <div
            ref={containerRef}
            className="absolute top-full bg-white/90 backdrop-blur-xl border-zinc-200 border shadow-lg rounded-lg p-8 z-50 grid gap-8"
            style={{
                display: "none",
                opacity: 0,
                left: `${left}px`,
                width: `${widthPx}px`,
                gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`,
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div ref={contentRef} key={currentMenu} className="contents">
                {menu &&
                    menu.sections.map((section) => (
                        <MegaMenuColumn
                            key={section.title}
                            title={section.title}
                            links={section.links}
                        />
                    ))}
            </div>
        </div>
    );
};