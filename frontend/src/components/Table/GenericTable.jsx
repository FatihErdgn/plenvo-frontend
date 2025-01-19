// components/GenericTable.js
import React from "react";
import { useTableContext } from "../../contexts/TableContext";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";

export default function GenericTable() {
  const {
    columns,
    currentData,
    currentPage,
    totalPages,
    goToNextPage,
    goToPrevPage,
  } = useTableContext();

  return (
    <div className="w-full h-full flex flex-col justify-between">
      <table className="table-auto w-full border-collapse bg-white shadow-sm rounded-lg">
        <thead>
          <tr className="text-gray-700 text-center">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-2 text-center">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentData.map((row, rowIndex) => {
            const isGroupRow =
              row.firstName === "Grup" && row.lastName === "Randevusu";

            return (
              <tr
                key={row.id || rowIndex}
                className="odd:bg-[#F7F6FE] even:bg-white hover:bg-green-50 text-center"
              >
                {columns.map((col, colIndex) => {
                  // Eğer isGroupRow ve kolonu ilk iki kolondan biriyse (colIndex < 2) => font-bold
                  const cellClass =
                    isGroupRow && colIndex < 2
                      ? "px-4 py-1 text-center font-semibold"
                      : "px-4 py-1 text-center";

                  if (col.renderCell) {
                    return (
                      <td key={col.key} className={cellClass}>
                        {col.renderCell(row)}
                      </td>
                    );
                  }
                  return (
                    <td key={col.key} className={cellClass}>
                      {row[col.key]}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-4">
        <button
          onClick={goToPrevPage}
          disabled={currentPage === 1}
          className={`px-2 py-2 rounded-full ${
            currentPage === 1
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#399AA1] text-white hover:bg-[#007E85]"
          }`}
        >
          <MdNavigateBefore className="w-5 h-5" />
        </button>

        <span className="mx-4 text-gray-700">
          Sayfa {currentPage} / {totalPages}
        </span>

        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className={`px-2 py-2 rounded-full ${
            currentPage === totalPages
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#399AA1] text-white hover:bg-[#007E85]"
          }`}
        >
          <MdNavigateNext className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
