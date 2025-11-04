import i18n from "i18next";
import backend from "i18next-http-backend";
import detector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

console.warn("i18n Loading");
const savedLang = localStorage.getItem("lang") || "fr";

i18n
  .use(backend)
  .use(detector)
  .use(initReactI18next)
  .init({
    fallbackLng: "fr",
    lng: savedLang,
    ns: [
      "common",
      "menu",
      "login",
      "signup_student",
      "signup_employer",
      "student_dashboard",
      "student_dashboard_cvs",
      "student_dashboard_offers",
      "employer_dashboard",
      "employer_dashboard_offers",
      "employer_dashboard_add_intership",
      "gs_dashboard",
      "gs_dashboard_all_internships",
      "gs_dashboard_manage_cvs",
      "dashboard_settings",
      "internship_applications",
      "reason_modal"
    ],
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
    nsSeparator: ":",
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

i18n.on("languageChanged", (lng) => {
  localStorage.setItem("lang", lng);
});

export default i18n;
