import React from "react";
import { LiaEdit } from "react-icons/lia";
import { IoEyeOutline } from "react-icons/io5";
import { useState, useEffect } from "react";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import ViewServiceDetailsPopup from "./ViewServiceDetailsPopup";

export default function ServiceManagementTable({ searchQuery, data }) {
  console.log("Search Query:", searchQuery);
  const [currentPage, setCurrentPage] = useState(1); // Sayfa numarası
  const [selectedData, setSelectedData] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const rowsPerPage = 10; // Sayfa başına gösterilecek satır sayısı

  const getStatusClass = (status) => {
    switch (status) {
      case "Aktif":
        return "inline-block bg-[#41BC63] border-[1px] border-[#41BC63] text-[#ffffff] py-[6px] px-[12px] rounded-md font-semibold text-sm";
      case "Pasif":
        return "inline-block bg-[#BC9241] border-[1px] border-[#BC9241] text-[#ffffff] py-[6px] px-[12px] rounded-md font-semibold text-sm";
      default:
        return "";
    }
  };

  const filteredData = searchQuery
    ? data.filter((item) => {
        const serviceName = item.serviceName.toLowerCase();
        const provider = item.provider.toLowerCase();
        const validityDate = item.validityDate.toLowerCase();
        const currency = item.currency.toLowerCase();
        const query = searchQuery.toLowerCase();
        return (
          serviceName.includes(query) ||
          provider.includes(query) ||
          validityDate.includes(query) ||
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

  const handleEditClick = (data) => {
    setSelectedData(data);
    setIsPopupOpen(true);
    setIsEditable(true);
  };
  // const handleViewClick = (data) => {
  //   setSelectedData(data);
  //   setIsEditable(false);
  //   setIsPopupOpen(true);
  // };

  const handleClosePopup = () => {
    setSelectedData(null);
    setIsPopupOpen(false);
  };

  useEffect(() => {
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

  const providerOptions =
    data && Array.isArray(data)
      ? [...new Set(data.map((item) => item.provider))]
      : [];

  return (
    <div className="font-montserrat bg-white p-6 rounded-lg shadow-md flex flex-col justify-between h-[79vh]">
      <table className="table-auto w-full border-collapse bg-white shadow-sm rounded-lg">
        <thead>
          <tr className="text-gray-700 text-center">
            <th className="px-4 py-2">Hizmet Adı</th>
            <th className="px-4 py-2">Hizmet Sağlayıcı</th>
            <th className="px-4 py-2">Hizmet Geçerlilik Tarihi</th>
            <th className="px-4 py-2">Durum</th>
            <th className="px-4 py-2">Hizmet Bedeli</th>
            <th className="px-4 py-2 text-center">Para Birimi</th>
            <th className="px-4 py-2">İşlem</th>
          </tr>
        </thead>
        <tbody>
          {currentData &&
            currentData.map((row) => (
              <tr
                key={row.id}
                className="odd:bg-[#F7F6FE] even:bg-white hover:bg-green-50 text-center"
              >
                <td className="px-4 py-2">{row.serviceName}</td>
                <td className="px-4 py-2">{row.provider}</td>
                <td className="px-4 py-2">{row.validityDate}</td>
                <td className="px-4 py-2 text-center">
                  <span className={getStatusClass(row.status)}>
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-2">{row.serviceFee}</td>
                <td className="px-4 py-2">{row.currency}</td>
                <td className="flex flex-row justify-center text-sm items-center px-4 py-[14px] space-x-2">
                  <button
                    className="flex items-center justify-center text-red-500 px-2 py-2 rounded-full hover:bg-red-600 hover:text-white"
                    disabled={!row.actions.edit}
                    aria-label="edit"
                    onClick={() => handleEditClick(row)}
                  >
                    <LiaEdit className="w-6 h-6" />
                  </button>
                  {/* <button
                    className="flex items-center justify-center text-gray-500 px-2 py-2 rounded-full hover:bg-gray-600 hover:text-white"
                    disabled={!row.actions.view}
                    aria-label="View"
                    onClick={() => handleViewClick(row)}
                  >
                    <IoEyeOutline className="w-6 h-6" />
                  </button> */}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <div className="flex justify-center items-center mt-4">
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
        <span className="mx-4 text-gray-700">Sayfa {currentPage}</span>
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
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center transition-opacity duration-300 ease-in-out">
          <div
            className="p-6 rounded-[10px] w-[100%] px-12 py-8 transform scale-95 transition-transform duration-300 ease-out"
            style={{
              animation: "popupSlideIn 0.3s forwards",
            }}
          >
            <ViewServiceDetailsPopup
              data={selectedData}
              onClose={handleClosePopup}
              options={{
                provider: providerOptions,
                status: ["Aktif", "Pasif"],
                currency: ["TRY", "USD", "EUR"],
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
