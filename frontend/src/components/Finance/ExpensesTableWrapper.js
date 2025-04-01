// components/ExpensesTableWrapper.js
import React, { useCallback } from "react";
import { TableProvider } from "../../contexts/TableContext";
import GenericTable from "../Table/GenericTable";
import { format } from "date-fns";
import ExportExcel from "../../utils/ExportExcel";
import { MdDelete } from "react-icons/md";
import { softDeleteExpense } from "../../services/expenseService";

export default function ExpensesTableWrapper({
  data,
  searchQuery,
  startDate,
  endDate,
  fetchExpenses,
}) {
  const getStatusClass = (kind) => {
    switch (kind) {
      case "Gelir":
        return "items-center justify-center bg-[#EBF9F1] border-[1px] border-[#41BC63] text-[#41BC63] py-2 px-6 max-w-32 min-w-16 rounded-full text-center";
      case "Sabit":
        return "items-center justify-center bg-[#FBF9F4] border-[1px] border-[#BC9241] text-[#BC9241] py-2 px-6 w-32 min-w-16 rounded-full text-center";
      case "Genel":
        return "items-center justify-center bg-[#FBF4F4] border-[1px] border-[#BC4141] text-[#BC4141] py-2 px-6 w-32 min-w-16 rounded-full text-center";
      default:
        return "items-center justify-center bg-gray-100 border-[1px] border-gray-500 text-gray-500 py-2 px-6 w-32 min-w-16 rounded-full text-center";
    }
  };

  // Soft Delete İşlemi
  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Bu gideri silmek istediğinize emin misiniz?")) return;

    try {
      await softDeleteExpense(expenseId);
      fetchExpenses(); // Güncellenmiş veriyi çek
    } catch (error) {
      console.error("Silme işlemi sırasında hata oluştu:", error);
    }
  };

  // Filtre fonksiyonu
  const customFilterFn = useCallback((items, query) => {
    const _query = query.toLowerCase();
    return items.filter((item) => {
      const expenseCategory = item.expenseCategory.toLowerCase();
      const expenseDesc = item.expenseDescription.toLowerCase();
      const expenseDate = item.expenseDate.toLowerCase();
      const expenseKind = item.expenseKind.toLowerCase();
      const currency = item.currencyName.toLowerCase();
      return (
        expenseCategory.includes(_query) ||
        expenseDesc.includes(_query) ||
        expenseDate.includes(_query) ||
        expenseKind.includes(_query) ||
        currency.includes(_query)
      );
    });
  }, []);

  const customDateFilterFn = useCallback((items, startDate, endDate) => {
    if (!startDate && !endDate) {
      return items;
    }

    return items.filter((item) => {
      const itemDate = new Date(item.expenseDate);
      const start = startDate ? new Date(startDate) : new Date("1970-01-01");
      const end = endDate ? new Date(endDate) : new Date("2999-12-31");

      return itemDate >= start && itemDate <= end;
    });
  }, []);

  // columns config
  const columns = [
    { key: "expenseCategory", label: "Kategori" },
    {
      key: "expenseDescription",
      label: "Açıklama",
      renderCell: (row) => (
        <div
          className="w-[15.625rem] mx-auto text-center whitespace-normal break-words line-clamp-4 overflow-hidden text-ellipsis"
          title={row.expenseDescription}
        >
          {row.expenseDescription}
        </div>
      ),
    },
    {
      key: "expenseDate",
      label: "Tarih",
      renderCell: (row) => {
        const dateValue = row.expenseDate;
        if (!dateValue) return "-"; // tarih yoksa kısa devre
        const dateObj = new Date(dateValue);
        return isNaN(dateObj.getTime()) ? "-" : format(dateObj, "dd.MM.yyyy");
      },
    },
    {
      key: "expenseKind",
      label: "Kalem Türü",
      renderCell: (row) => (
        <span className={getStatusClass(row.expenseKind)}>
          {row.expenseKind}
        </span>
      ),
    },
    { key: "expenseAmount", label: "Fiyat" },
    { key: "currencyName", label: "Para Birimi" },
    {
      key: "actions",
      label: "İşlemler",
      renderCell: (row) => (
        <button
          onClick={() => handleDeleteExpense(row._id)}
          className="text-red-500 px-2 py-2 rounded-full hover:bg-red-600 hover:text-white"
          title="Gideri Sil"
        >
          <MdDelete size={20} />
        </button>
      ),
    },
  ];

  // columns config
  const excelColumns = [
    { key: "expenseCategory", label: "Kategori" },
    {
      key: "expenseDescription",
      label: "Açıklama",
      renderCell: (row) => (
        <div
          className="max-w-[15.625rem] mx-auto text-center whitespace-normal break-words line-clamp-4 overflow-hidden text-ellipsis"
          title={row.expenseDescription}
        >
          {row.expenseDescription}
        </div>
      ),
    },
    {
      key: "expenseDate",
      label: "Tarih",
      renderCell: (row) => {
        const dateValue = row.expenseDate;
        if (!dateValue) return "-"; // tarih yoksa kısa devre
        const dateObj = new Date(dateValue);
        return isNaN(dateObj.getTime()) ? "-" : format(dateObj, "dd.MM.yyyy");
      },
    },
    {
      key: "expenseKind",
      label: "Kalem Türü",
      renderCell: (row) => (
        <span className={getStatusClass(row.expenseKind)}>
          {row.expenseKind}
        </span>
      ),
    },
    { key: "expenseAmount", label: "Fiyat" },
    { key: "currencyName", label: "Para Birimi" },
  ];

  return (
    <TableProvider
      data={data}
      columns={columns}
      excelColumns={excelColumns}
      searchQuery={searchQuery}
      startDate={startDate}
      endDate={endDate}
      // rowsPerPage={10}
      customFilterFn={customFilterFn}
      customDateFilterFn={customDateFilterFn}
    >
      <div className="font-montserrat bg-white w-full p-6 rounded-lg shadow-md flex flex-col justify-between">
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
