import React from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

export const Textarea = ({ name, placeholder, className }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = errors[name]?.message;
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-1 w-full">
      <textarea
        id={name}
        {...register(name)}
        placeholder={placeholder}
        className={`rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
          error
            ? "border-red-500 focus:ring-red-300"
            : "border-gray-300 focus:ring-blue-300"
        } ${className}`}
      />
      {error && <p className="text-xs text-red-500">{t(error)}</p>}
    </div>
  );
};
