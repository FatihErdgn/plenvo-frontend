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
  rowsPerPage: initialRowsPerPage = 10,
  customFilterFn, // Filtreleme için özel bir fonksiyon tanımlamak isterseniz
  customDateFilterFn, // Tarih aralığı filtresi için özel bir fonksiyon tanımlamak isterseniz
}) {
  const [currentPage, setCurrentPage] = useState(1);

  // Yeni: Sayfa başına gösterilecek satır sayısını state ile yönetiyoruz
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  // Pop-up, seçilen satır vb. alanları context içerisinde yönetebilirsiniz
  const [selectedData, setSelectedData] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isEditable, setIsEditable] = useState(false);

  // Eğer tablo verilerini searchQuery ile filtreleyecekseniz:
  const filteredData = useMemo(() => {
    let newData = Array.isArray(data) ? data : [data];

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

  // Eğer rowsPerPage değişirse, mevcut sayfa 1'e sıfırlansın.
  useEffect(() => {
    setCurrentPage(1);
  }, [rowsPerPage]);

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
    rowsPerPage,
    setRowsPerPage,
    isPopupOpen,
    setIsPopupOpen,
    selectedData,
    setSelectedData,
    isEditable,
    setIsEditable,
    // ...
  };

  return (
    <TableContext.Provider value={value}>
      {children}
    </TableContext.Provider>
  );
}
