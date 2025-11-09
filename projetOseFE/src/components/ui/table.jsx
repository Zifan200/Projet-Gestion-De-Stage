import React from "react";

export const Table = ({ headers, rows, emptyMessage }) => {
  return (
      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-[#F9FBFC] text-gray-600 uppercase text-xs font-semibold">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows
          ) : (
            <tr>
              <td
                colSpan={headers.length}
                className="text-center py-6 text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
