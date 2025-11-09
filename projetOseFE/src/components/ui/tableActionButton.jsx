import React from "react";

export const TableActionButton = ({
                                      label,
                                      icon: Icon,
                                      onClick,
                                      bg_color = "gray-200",
                                      text_color = "gray-700",
                                      icon_fill_color = "",
                                      icon_stroke_color = ""

                                  }) => {
    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 text-${text_color}  bg-${bg_color} hover:bg-current/25 hover:text-${text_color}`}
        >
            {Icon && (
                <Icon
                    className={`relative z-10 w-4 h-4 fill-current ${icon_fill_color?"fill-"+icon_fill_color:""} ${icon_stroke_color?"stroke-"+icon_stroke_color+" stroke-1":""}`}
                />
            )}
            <span className={`relative z-10`}>{label}</span>
        </button>

    );
};
