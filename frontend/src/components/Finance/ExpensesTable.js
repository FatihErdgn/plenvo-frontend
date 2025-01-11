import React, { useState } from "react";
import data from "../../expensesData.json"; // JSON dosyasını içe aktar
import { MdNavigateNext, MdNavigateBefore } from "react-icons/md";
import { format } from "date-fns";

const ExpensesTable = ({ searchQuery }) => {
  console.log("Search Query:", searchQuery);
  const [currentPage, setCurrentPage] = useState(1); // Sayfa numarası
  const rowsPerPage = 10; // Sayfa başına gösterilecek satır sayısı

  const getStatusClass = (status) => {
    switch (status) {
      case "Gelir":
        return "flex flex-row items-center justify-center bg-[#EBF9F1] border-[1px] border-[#41BC63] text-[#41BC63] py-[6px] max-w-32 min-w-16 rounded-full text-center";
      case "Sabit":
        return "flex flex-row items-center justify-center bg-[#FBF9F4] border-[1px] border-[#BC9241] text-[#BC9241] py-[6px] w-32 min-w-16 rounded-full text-center";
      case "Genel":
        return "flex flex-row items-center justify-center bg-[#FBF4F4] border-[1px] border-[#BC4141] text-[#BC4141] py-[6px] w-32 min-w-16 rounded-full text-center";
      default:
        return "";
    }
  };

  const filteredData = searchQuery
    ? data.filter((item) => {
        const expenseCategory = item.ExpenseCategory.toLowerCase();
        const expenseDesc = item.ExpenseDesc.toLowerCase();
        const expenseDate = item.Date.toLowerCase();
        const expenseKind = item.ExpenseKind.toLowerCase();
        const currency = item.Currency.toLowerCase();
        const query = searchQuery.toLowerCase();
        return (
          expenseCategory.includes(query) ||
          expenseDesc.includes(query) ||
          expenseDate.includes(query) ||
          expenseKind.includes(query) ||
          currency.includes(query)
        );
      })
    : data;

  console.log("Filtered Data:", filteredData);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage); // Toplam sayfa sayısı
  const startIndex = (currentPage - 1) * rowsPerPage; // Başlangıç index'i
  const currentData = filteredData.slice(startIndex, startIndex + rowsPerPage); // Sayfa başına gösterilecek veriler

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviosPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="font-montserrat bg-white w-screen p-6 rounded-lg shadow-md flex flex-col justify-between h-[79vh]">
      {/* Tablo */}
      <div className="overflow-auto">
        <table className="table-auto w-full border-collapse bg-white shadow-sm rounded-lg">
          <thead>
            <tr className="text-gray-700 text-center">
              <th className="px-4 py-2.5">Kategori</th>
              <th className="px-4 py-2.5">Açıklama</th>
              <th className="px-4 py-2.5">Tarih</th>
              <th className="px-4 py-2.5">Kalem Türü</th>
              <th className="px-4 py-2.5">Fiyat</th>
              <th className="px-4 py-2.5">Para Birimi</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((row) => (
              <tr
                key={row.id}
                className="odd:bg-[#F7F6FE] even:bg-white hover:bg-green-50 text-center"
              >
                <td className="px-4 py-2.5">{row.ExpenseCategory}</td>
                <td className="px-4 py-2.5">{row.ExpenseDesc}</td>
                <td className="px-4 py-2.5">
                  {format(new Date(row.Date), "dd.MM.yyyy")}
                </td>
                <td className="px-4 py-2.5 flex justify-center">
                  <span className={getStatusClass(row.ExpenseKind)}>
                    {row.ExpenseKind}
                  </span>
                </td>
                <td className="px-4 py-2.5">{row.Amount}</td>
                <td className="px-4 py-2.5">{row.Currency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-4">
        {/* Önceki Sayfa */}
        <button
          onClick={goToPreviosPage}
          disabled={currentPage === 1}
          className={`px-2 py-2 rounded-full ${
            currentPage === 1
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#399AA1] text-white hover:bg-[#007E85]"
          }`}
        >
          <MdNavigateBefore className="w-5 h-5" />
        </button>

        {/* Sayfa Bilgisi */}
        <span className="mx-4 text-gray-700">
          Sayfa {currentPage} 
          {/* {totalPages} */}
        </span>

        {/* Sonraki Sayfa */}
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
};

export default ExpensesTable;
