import React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const langs = {
  en: { nativeName: "English" },
  fr: { nativeName: "French" },
};

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "fr" : "en";
    i18n.changeLanguage(newLang);
  };

  // Affiche le code de la langue opposée
  const oppositeLang = i18n.language === "en" ? "fr" : "en";

  return <button onClick={toggleLanguage}>{oppositeLang}</button>;
};
