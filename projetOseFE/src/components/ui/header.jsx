import React from "react";

export const Header = ({ title, actionLabel, onAction }) => (
  <div className="flex justify-between items-center">
    <h2 className="text-xl font-semibold">{title}</h2>
    {actionLabel && (
      <button
        onClick={onAction}
        className="px-4 py-2 bg-[#B3FE3B] text-black rounded-lg hover:bg-lime-200 transition"
      >
        {actionLabel}
      </button>
    )}
  </div>
);
