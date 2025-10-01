import { useFormContext } from "react-hook-form";
import { cn } from "../../lib/cn.js";
import { EyeOpenIcon, EyeClosedIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";

function Input({ name, type = "text", placeholder, className }) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = errors[name]?.message;
  const isPassword = type === "password";
  const [show, setShow] = useState(false);
  const effectiveType = isPassword ? (show ? "text" : "password") : type;
  const { t } = useTranslation();

  return (
    <div className="flex flex-col w-full">
      <div className="relative w-full">
        <input
          id={name}
          type={effectiveType}
          {...register(name)}
          placeholder={placeholder}
          className={cn(
            "w-full border shadow-md outline-none rounded-xl border-zinc-300 pl-3 pr-10 py-2 min-w-[250px] placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
            className,
          )}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-pressed={show}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-center"
          >
            {show ? (
              <EyeOpenIcon className="w-5 h-5" />
            ) : (
              <EyeClosedIcon className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{t(error)}</p>}
    </div>
  );
}

export default Input;
