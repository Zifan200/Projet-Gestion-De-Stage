import React from "react";
import { cn } from "../../lib/cn.js";
import { EyeOpenIcon } from "@radix-ui/react-icons";

// Standardized button style variants for consistency across all tables
const getButtonStyles = (actionKey) => {
  const baseStyles =
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors";

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

export const DataTable = ({ columns, data, onAction, getRowClassName }) => {
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
                className={cn(
                  "border-t border-gray-200 text-gray-700 text-sm transition-colors",
                  getRowClassName ? getRowClassName(row) : ""
                )}
              >
                {columns.map((col) => {
                  if (col.key === "status") {
                    // Use rawStatus for color mapping if available, otherwise use status
                    const statusKey =
                      row.rawStatus || row[col.key]?.toLowerCase();
                    const statusColor =
                      {
                        pending: "bg-yellow-100 text-yellow-800",
                        accepted: "bg-green-100 text-green-800",
                        rejected: "bg-red-100 text-red-800",
                        reviewing: "bg-blue-100 text-blue-800",
                      }[statusKey] || "bg-gray-100 text-gray-700";

                    const displayValue = col.format ? col.format(row[col.key]) : row[col.key];

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

                  if (col.key === "etudiantStatus") {
                    const statusKey = (row[col.key]+"").toLowerCase();
                    const statusColor =
                      {
                        pending: "bg-yellow-100 text-yellow-800",
                        accepted: "bg-green-100 text-green-800",
                        confirmed_by_student: "bg-green-100 text-green-800",
                        declined: "bg-red-100 text-red-800",
                        rejected_by_student: "bg-red-100 text-red-800",
                      }[statusKey] || "bg-yellow-100 text-yellow-800";

                    const displayValue = col.format ? col.format(row[col.key]) : row[col.key];

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
                    return (
                      <td key={col.key} className="px-4 py-3 align-middle">
                        <div className="flex items-center justify-start gap-2">
                          {col.actions.map(
                            (action) =>
                              (row.rawStatus === "pending" ||
                                (action.key !== "accept" &&
                                  action.key !== "reject")) && (
                                <button
                                  key={action.key}
                                  onClick={() => onAction(action.key, row)}
                                  className={getButtonStyles(action.key)}
                                >
                                  {action.showIcon && action.key === "view" && (
                                    <EyeOpenIcon className="w-4 h-4" />
                                  )}
                                  {action.label}
                                </button>
                              ),
                          )}
                        </div>
                      </td>
                    );
                  }

                  // Support for custom render function
                  if (col.render) {
                    return (
                      <td key={col.key} className="px-4 py-3 align-middle">
                        {col.render(row)}
                      </td>
                    );
                  }

                  const displayValue = col.format ? col.format(row[col.key]) : row[col.key];

                  return (
                    <td key={col.key} className="px-4 py-3 align-middle">
                      {displayValue}
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

