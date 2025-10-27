import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

export function Popover({ children }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        open &&
        contentRef.current &&
        !contentRef.current.contains(e.target) &&
        !triggerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div style={{ display: "inline-block", position: "relative" }}>
      {children({
        open,
        setOpen,
        triggerRef,
        contentRef,
      })}
    </div>
  );
}

export function PopoverTrigger({ children, setOpen, triggerRef, open }) {
  return (
    <button
      ref={triggerRef}
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={() => setOpen((prev) => !prev)}
    >
      {children}
    </button>
  );
}

export function PopoverContent({
  children,
  contentRef,
  open,
  leftPercent,
  topPercent,
  bottomPercent,
}) {
  if (!open) return null;

  return (
    <div
      ref={contentRef}
      role="dialog"
      style={{
        position: "absolute",
        top: topPercent,
        bottom: bottomPercent,
        left: leftPercent,
        background: "white",
        border: "1px solid #ddd",
        borderRadius: "6px",
        padding: "10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        zIndex: 100,
      }}
    >
      {children}
    </div>
  );
}

export function PopoverClose({ setOpen, children }) {
  const { t } = useTranslation();
  return (
    <button onClick={() => setOpen(false)}>
      {children || t("menu.close")}
    </button>
  );
}

