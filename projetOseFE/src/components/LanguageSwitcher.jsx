import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUserStore } from "../stores/userStore.js";
import useAuthStore from "../stores/authStore.js";

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const { settings, updateLanguage } = useUserStore();
  const { isAuthenticated } = useAuthStore();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  useEffect(() => {
    const handleLangChange = (lng) => setCurrentLang(lng);
    i18n.on("languageChanged", handleLangChange);
    return () => i18n.off("languageChanged", handleLangChange);
  }, [i18n]);

  useEffect(() => {
    if (
      isAuthenticated &&
      settings?.language &&
      settings.language !== i18n.language
    ) {
      i18n.changeLanguage(settings.language);
    }
  }, [isAuthenticated, settings.language, i18n]);

  const toggleLanguage = async () => {
    const newLang = currentLang === "en" ? "fr" : "en";

    i18n.changeLanguage(newLang);
    setCurrentLang(newLang);

    if (isAuthenticated) {
      try {
        await updateLanguage(newLang);
      } catch (err) {
        console.error("Failed to update language:", err);
      }
    } else {
      localStorage.setItem("lang", newLang);
    }
  };

  const oppositeLang = currentLang === "en" ? "fr" : "en";

  return (
    <button
      onClick={toggleLanguage}
      className="text-sm px-3 py-1 rounded-full hover:bg-gray-100 transition"
    >
      {oppositeLang.toUpperCase()}
    </button>
  );
};
