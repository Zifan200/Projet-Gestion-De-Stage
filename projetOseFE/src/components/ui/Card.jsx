import { cn } from "../../lib/cn.js";

export const Card = ({ title, subtitle, className, children, ...props }) => {
  return (
    <div
      {...props}
      className={cn(
        " rounded-md p-3  text-black w-full border border-zinc-300 shadow-md text-xl transition-colors",
        className,
      )}
    >
      <h2>{title}</h2>
      <h4>{subtitle}</h4>
      {children}
    </div>
  );
};
