import { useTranslation } from "react-i18next";

export const MegaMenuColumn = ({ title, links }) => {
  const { t } = useTranslation("menu");
  console.log(title);

  return (
    <div className="space-y-3 ">
      <h3 className="text-sm font-semibold text-gray-800">{t(title)}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-50 transition"
            >
              <div className="w-6 h-6 flex-shrink-0 bg-gray-200 rounded-md" />

              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {t(link.label)}
                </span>
                {link.description && (
                  <span className="text-xs text-gray-500">
                    {t(link.description)}
                  </span>
                )}
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

