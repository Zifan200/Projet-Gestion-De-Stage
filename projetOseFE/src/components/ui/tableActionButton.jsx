import clsx from "clsx";

export const TableActionButton = ({
                                      label,
                                      icon: Icon,
                                      onClick,
                                      bg_color = "gray-200",
                                      text_color = "gray-700",
                                      inactive_bg_color ,
                                      inactive_text_color,
                                      className = "",
                                      interactive = true,
                                  }) => {
    const activeClasses = `text-${text_color} bg-${bg_color} hover:bg-current/25 hover:text-${text_color}`;
    const inactiveClasses = `text-${inactive_text_color} bg-${inactive_bg_color}`;

    return (
        <button
            onClick={() => {
                if (interactive) onClick();
            }}
            className={clsx(
                "inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 max-sm:w-9 max-sm:h-9 max-sm:gap-0 min-w-[2.5rem]",
                interactive===true ? activeClasses : inactiveClasses,
                className
            )}
        >
            {Icon && <Icon className="relative z-10 w-4 h-4 stroke-0.5 stroke-current max-sm:w-5 max-sm:h-5 shrink-0" />}
            {label && (
                <span className="relative z-10 max-sm:opacity-0 max-sm:w-0 max-sm:overflow-hidden transition-all duration-200 whitespace-nowrap">
          {label}
        </span>
            )}
        </button>
    );
};
