// contexts/TableContext.js
import { createContext, useContext, useState, useEffect, useMemo } from "react";

const TableContext = createContext();

export function useTableContext() {
  return useContext(TableContext);
}

export function TableProvider({
  children,
  data = [],
  columns = [],
  excelColumns = [],
  searchQuery = "",
  startDate = "",
  endDate = "",
  rowsPerPage = 10,
  customFilterFn, // Filtreleme için özel bir fonksiyon tanımlamak isterseniz
  customDateFilterFn, // Tarih aralığı filtresi için özel bir fonksiyon tanımlamak isterseniz
}) {
  const [currentPage, setCurrentPage] = useState(1);

  // Pop-up, seçilen satır vb. alanları context içerisinde yönetebilirsiniz
  const [selectedData, setSelectedData] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isEditable, setIsEditable] = useState(false);

  // Eğer tablo verilerini searchQuery ile filtreleyecekseniz:
  const filteredData = useMemo(() => {
    let newData = data;

    // 1. ÖNCE arama filtresi
    if (customFilterFn && searchQuery) {
      newData = customFilterFn(newData, searchQuery);
    }

    // 2. SONRA tarih filtresi
    if (customDateFilterFn && (startDate || endDate)) {
      newData = customDateFilterFn(newData, startDate, endDate);
    }

    return newData;
  }, [
    data,
    searchQuery,
    startDate,
    endDate,
    customFilterFn,
    customDateFilterFn,
  ]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  // Mevcut sayfada gösterilecek veriler
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  useEffect(() => {
    // Sayfa içi pop-up’ı ESC ile kapatmak için
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsPopupOpen(false);
      }
    };
    if (isPopupOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPopupOpen]);

  // Değerleri context üzerinden paylaş
  const value = {
    data,
    columns,
    excelColumns,
    searchQuery,
    startDate,
    endDate,
    currentData,
    currentPage,
    totalPages,
    goToNextPage,
    goToPrevPage,
    isPopupOpen,
    setIsPopupOpen,
    selectedData,
    setSelectedData,
    isEditable,
    setIsEditable,
    // ...
  };

  return (
    <TableContext.Provider value={value}>{children}</TableContext.Provider>
  );
}
