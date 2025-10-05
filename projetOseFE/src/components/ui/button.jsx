import { cn } from "../../lib/cn.js";

export const Button = ({ label, className, ...props }) => {
  return (
    <button
      {...props}
      className={cn(
        " rounded-xl bg-[#B3FE3B] text-black w-full border border-zinc-300 shadow-md text-xl hover:bg-[#a2ef35] transition-colors",
        className,
      )}
    >
      {label}
    </button>
  );
};
