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
  searchQuery = "",
  rowsPerPage = 10,
  customFilterFn, // Filtreleme için özel bir fonksiyon tanımlamak isterseniz
}) {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Pop-up, seçilen satır vb. alanları context içerisinde yönetebilirsiniz
  const [selectedData, setSelectedData] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isEditable, setIsEditable] = useState(false);

  // Eğer tablo verilerini searchQuery ile filtreleyecekseniz:
  const filteredData = useMemo(() => {
    if (customFilterFn) {
      return customFilterFn(data, searchQuery);
    }
    return data;
  }, [data, searchQuery, customFilterFn]);

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
    searchQuery,
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

  return <TableContext.Provider value={value}>{children}</TableContext.Provider>;
}
