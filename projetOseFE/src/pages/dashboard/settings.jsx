import React from "react";
import { useTranslation } from "react-i18next";
import { useUserStore } from "../../stores/userStore.js";
import { Card } from "../../components/ui/Card.jsx";
import { toast } from "sonner";

export const DashboardSettings = () => {
  const { t, i18n } = useTranslation("dashboard_settings");
  const { settings, loading, loadSettings, updateLanguage } = useUserStore();

  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  React.useEffect(() => {
    if (settings?.language && i18n.language !== settings.language) {
      i18n.changeLanguage(settings.language);
    }
  }, [settings.language, i18n]);

  const handleLanguageChange = async (e) => {
    const lang = e.target.value;
    try {
      i18n.changeLanguage(lang);
      await updateLanguage(lang);
      toast.success(t("toast.success"));
    } catch (err) {
      toast.error(t("toast.error"));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-4xl mb-8">{t("title")}</h1>

      <Card title={t("lang.title")}>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="language"
            className="text-sm font-medium text-gray-700 mt-2 mb-6"
          >
            {t("lang.language_description")}
          </label>

          <select
            id="language"
            value={settings.language}
            onChange={handleLanguageChange}
            disabled={loading}
            className="border rounded-md border-zinc-400 px-3 py-1"
          >
            <option value="en">{t("languages.en")}</option>
            <option value="fr">{t("languages.fr")}</option>
          </select>
        </div>
      </Card>
    </div>
  );
};
