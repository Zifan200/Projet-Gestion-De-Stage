import { Link } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <h1>{t("description")}</h1>
    </div>
  );
}
