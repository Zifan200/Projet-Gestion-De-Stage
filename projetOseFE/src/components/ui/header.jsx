import React from "react";

export const Header = ({ title, actionLabel, onAction }) => (
  <div className="flex justify-between items-center">
    <h2 className="text-xl font-semibold">{title}</h2>
    {actionLabel && (
      <button
        onClick={onAction}
        className="px-4 py-2 bg-green-400 text-black rounded-lg hover:bg-green-500 transition"
      >
        {actionLabel}
      </button>
    )}
  </div>
);
