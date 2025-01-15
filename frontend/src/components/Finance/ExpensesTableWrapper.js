// components/ExpensesTableWrapper.js
import React, { useCallback } from "react";
import { TableProvider } from "../../contexts/TableContext";
import GenericTable from "../Table/GenericTable";
import { format } from "date-fns";
import ExportExcel from "../../utils/ExportExcel";

export default function ExpensesTableWrapper({ data, searchQuery }) {
  const getStatusClass = (kind) => {
    switch (kind) {
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

  // Filtre fonksiyonu
  const customFilterFn = useCallback((items, query) => {
    const _query = query.toLowerCase();
    return items.filter((item) => {
      const expenseCategory = item.ExpenseCategory.toLowerCase();
      const expenseDesc = item.ExpenseDesc.toLowerCase();
      const expenseDate = item.Date.toLowerCase();
      const expenseKind = item.ExpenseKind.toLowerCase();
      const currency = item.Currency.toLowerCase();
      return (
        expenseCategory.includes(_query) ||
        expenseDesc.includes(_query) ||
        expenseDate.includes(_query) ||
        expenseKind.includes(_query) ||
        currency.includes(_query)
      );
    });
  }, []);

  // columns config
  const columns = [
    { key: "ExpenseCategory", label: "Kategori" },
    { key: "ExpenseDesc", label: "Açıklama" },
    {
      key: "Date",
      label: "Tarih",
      renderCell: (row) => format(new Date(row.Date), "dd.MM.yyyy"),
    },
    {
      key: "ExpenseKind",
      label: "Kalem Türü",
      renderCell: (row) => (
        <span className={getStatusClass(row.ExpenseKind)}>
          {row.ExpenseKind}
        </span>
      ),
    },
    { key: "Amount", label: "Fiyat" },
    { key: "Currency", label: "Para Birimi" },
  ];

  return (
    <TableProvider
      data={data}
      columns={columns}
      searchQuery={searchQuery}
      rowsPerPage={10}
      customFilterFn={customFilterFn}
    >
      <div className="font-montserrat bg-white w-screen p-6 rounded-lg shadow-md flex flex-col justify-between">
        <div className="flex flex-row justify-between items-center mb-4">
          {/* Eğer başlık istemiyorsanız, boş bir <div /> veya <span /> bırakabilirsiniz */}
          <h2 className="text-lg font-semibold text-gray-700">
            Maliyet Listesi
          </h2>

          <ExportExcel fileName="MaliyetListesi.xlsx" />
        </div>

        {/* Tablo alanı */}
        <div className="flex-1 overflow-y-auto">
          <GenericTable />
        </div>
      </div>
    </TableProvider>
  );
}
