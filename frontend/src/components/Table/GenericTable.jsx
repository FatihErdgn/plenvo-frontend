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
    rowsPerPage,
    setRowsPerPage,
  } = useTableContext();

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Dropdown: Sayfa başına gönderilecek randevu sayısını seçme */}
      <div className="mb-4 flex justify-end items-center">
        <label className="mr-2 text-gray-700">Sayfa başına gösterilecek satır:</label>
        <select
          value={rowsPerPage}
          onChange={handleRowsPerPageChange}
          className="border border-gray-300 rounded p-1"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      {/* Tablo container'ı: 7 satır yüksekliği aşıldığında aşağı kaydırılsın */}
      <div className="overflow-y-auto" style={{ maxHeight: "calc(7 * 4.75rem)" }}>
        <table className="table-auto w-full border-collapse bg-white shadow-sm rounded-lg">
          <thead>
            <tr className="text-gray-700 text-center">
              {columns?.map((col) => (
                <th key={col.key} className="px-4 py-2 text-center">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData?.map((row, rowIndex) => {
              // row yoksa (undefined/null) => satır oluşturma
              if (!row) return null;

              // (Örnek) isGroupRow kontrolü
              const isGroupRow = row?.type === "group";

              return (
                <tr
                  key={row?._id || rowIndex}
                  className="odd:bg-[#F7F6FE] even:bg-white hover:bg-green-50 text-center"
                >
                  {columns?.map((col, colIndex) => {
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
                        {/* eğer col.renderCell varsa onu kullan, yoksa direkt row[col.key] */}
                        {col.renderCell ? col.renderCell(row) : row[col.key] ?? "-"}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

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
