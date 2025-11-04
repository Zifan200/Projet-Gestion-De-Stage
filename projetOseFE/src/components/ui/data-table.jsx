import React from "react";
import { cn } from "../../lib/cn.js";
import { CheckIcon, Cross2Icon, EyeOpenIcon, DownloadIcon, TrashIcon, Pencil1Icon } from "@radix-ui/react-icons";

const getButtonStyles = (actionKey) => {
  const baseStyles = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors";

  const variants = {
    view: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    preview: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
    download: "bg-green-100 text-green-700 hover:bg-green-200",
    delete: "bg-red-100 text-red-700 hover:bg-red-200",
    reject: "bg-red-100 text-red-700 hover:bg-red-200",
    accept: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
    edit: "bg-amber-100 text-amber-700 hover:bg-amber-200",
  };

  return `${baseStyles} ${variants[actionKey] || "bg-gray-100 text-gray-700 hover:bg-gray-200"}`;
};

const getActionIcon = (actionKey) => {
  const icons = {
    view: EyeOpenIcon,
    preview: EyeOpenIcon,
    download: DownloadIcon,
    delete: TrashIcon,
    reject: Cross2Icon,
    accept: CheckIcon,
    edit: Pencil1Icon,
  };

  return icons[actionKey] || null;
};

export const DataTable = ({ columns, data, onAction }) => {
  return (
    <div className="overflow-x-auto bg-white shadow rounded">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-[#F9FBFC] text-gray-600 uppercase text-xs font-semibold">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center p-6 text-gray-400"
              >
                Aucun résultat
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row.id}
                className="border-t border-gray-200 text-gray-700 text-sm"
              >
                {columns.map((col) => {
                  if (col.key === "status" || col.key === "etudiantStatus") {
                    const statusKey = row.rawStatus || row[col.key]?.toLowerCase();
                    const statusColor =
                      {
                        pending: "bg-yellow-100 text-yellow-800",
                        accepted: "bg-green-100 text-green-800",
                        rejected: "bg-red-100 text-red-800",
                        reviewing: "bg-blue-100 text-blue-800",
                        confirmed_by_student: "bg-green-100 text-green-800",
                        rejected_by_student: "bg-red-100 text-red-800",
                        waiting_student_decision: "bg-yellow-100 text-yellow-800",
                      }[statusKey] ||
                      "bg-gray-100 text-gray-700";

                    const displayValue = col.format ? col.format(row[col.key], row) : row[col.key];

                    return (
                      <td key={col.key} className="px-4 py-3 align-middle">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor}`}
                        >
                          {displayValue}
                        </span>
                      </td>
                    );
                  }

                  if (col.key === "actions") {
                    const actions = typeof col.actions === "function" ? col.actions(row) : col.actions;
                    return (
                      <td key={col.key} className="px-4 py-3 align-middle">
                        <div className="flex items-center justify-start gap-2">
                          {actions.map((action) => {
                            const Icon = getActionIcon(action.key);
                            const showIcon = action.showIcon === true;
                            const showLabel = action.showLabel !== false;

                            return (
                              <button
                                key={action.key}
                                onClick={() => onAction(action.key, row)}
                                className={getButtonStyles(action.key)}
                              >
                                {Icon && showIcon && <Icon className="w-4 h-4" />}
                                {showLabel && action.label}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    );
                  }

                  return (
                    <td key={col.key} className="px-4 py-3 align-middle">
                      {row[col.key]}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
