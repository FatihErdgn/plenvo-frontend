import React, { useState, useEffect } from "react";
import { LiaEdit } from "react-icons/lia";
import { IoEyeOutline } from "react-icons/io5";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import ViewAppointmentDetailsPopup from "./ViewAppointmentDetailsPopup";

const ConsultantTable = ({ searchQuery, data }) => {
  const [currentPage, setCurrentPage] = useState(1); // Sayfa numarası
  const [selectedData, setSelectedData] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const rowsPerPage = 10; // Sayfa başına gösterilecek satır sayısı

  const getStatusClass = (status) => {
    switch (status) {
      case "Açık":
        return "flex flex-row items-center justify-center bg-[#EBF9F1] border-[1px] border-[#41BC63] text-[#41BC63] py-[6px] ml-6 max-w-36 min-w-16 rounded-full text-center";
      case "Ödeme Bekleniyor":
        return "flex flex-row items-center justify-center bg-[#FBF9F4] border-[1px] border-[#BC9241] text-[#BC9241] py-[6px] ml-6 max-w-36 min-w-16 rounded-full text-center text-[14px]";
      case "Tamamlandı":
        return "flex flex-row items-center justify-center bg-gray-100 border-[1px] border-gray-500 text-gray-500 py-[6px] ml-6 max-w-36 min-w-16 rounded-full text-center";
      case "İptal Edildi":
        return "flex flex-row items-center justify-center bg-[#FBF4F4] border-[1px] border-[#BC4141] text-[#BC4141] py-[6px] ml-6 max-w-36 min-w-16 rounded-full text-center";
      default:
        return "";
    }
  };

  const getButtonClasses = (enabled) => {
    return enabled
      ? "bg-[#399AA1] text-white px-4 py-[9px] rounded-[20px] hover:bg-[#007E85]"
      : "bg-gray-300 text-gray-500 px-4 py-[9px] rounded-[20px] cursor-not-allowed";
  };

  const filteredData = searchQuery
    ? data.filter((item) => {
        const fullName = `${item.firstName} ${item.lastName}`.toLowerCase();
        const phoneNumber = item.phoneNumber.toLowerCase();
        const status = item.status.toLowerCase();
        const query = searchQuery.toLowerCase();
        const isMatch =
          fullName.includes(query) ||
          phoneNumber.includes(query) ||
          status.includes(query);
        return isMatch;
      })
    : data;

  const totalPages = Math.ceil(filteredData.length / rowsPerPage); // Toplam sayfa sayısı
  const startIndex = (currentPage - 1) * rowsPerPage; // Başlangıç index'i
  const currentData = filteredData.slice(startIndex, startIndex + rowsPerPage); // Sayfa başına gösterilecek veriler

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleEditClick = (data) => {
    setSelectedData(data);
    setIsEditable(true);
    setIsPopupOpen(true);
  };

  const handleViewClick = (data) => {
    setSelectedData(data);
    setIsEditable(false);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedData(null);
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

  const clinicOptions =
    data && Array.isArray(data)
      ? [...new Set(data.map((item) => item.clinic))]
      : [];
  const doctorOptions =
    data && Array.isArray(data)
      ? [...new Set(data.map((item) => item.doctor))]
      : [];

  const genderOptions = ["Erkek", "Kadın"];

  return (
    <div className="flex flex-col bg-white justify-between h-[87vh] font-montserrat p-6 rounded-lg shadow-md">
      <div className="overflow-auto">
        <table className="table-auto w-full border-collapse bg-white shadow-sm rounded-lg">
          <thead>
            <tr className="text-gray-700 text-center">
              <th className="px-4 py-2">İsim</th>
              <th className="px-4 py-2">Soyisim</th>
              <th className="px-4 py-2">Cep Numarası</th>
              <th className="px-4 py-2">Randevu Tarihi ve Saati</th>
              <th className="px-4 py-2 text-center">Durum</th>
              <th className="px-4 py-2">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((row) => (
              <tr
                key={row.id}
                className="odd:bg-[#F7F6FE] even:bg-white hover:bg-green-50 text-center"
              >
                <td className="px-4 py-2">{row.firstName}</td>
                <td className="px-4 py-2">{row.lastName}</td>
                <td className="px-4 py-2">{row.phoneNumber}</td>
                <td className="px-4 py-2">{row.appointmentDateTime}</td>
                <td className="px-4 py-2 text-center">
                  <span className={getStatusClass(row.status)}>
                    {row.status}
                  </span>
                </td>
                <td className="flex flex-row justify-center text-sm items-center px-4 py-[14px] space-x-2">
                  <button
                    className={getButtonClasses(row.actions.payNow)}
                    disabled={!row.actions.payNow}
                  >
                    Ödeme Yap
                  </button>
                  {/* <button
                    className={getButtonClasses(row.actions.bookNow)}
                    disabled={!row.actions.bookNow}
                  >
                    Randevu Yenile
                  </button> */}
                  <button
                    className={getButtonClasses(row.actions.reBook)}
                    disabled={!row.actions.reBook}
                  >
                    Randevu Yenile
                  </button>
                  <button
                    className="flex items-center justify-center text-red-500 px-2 py-2 rounded-full hover:bg-red-600 hover:text-white"
                    disabled={!row.actions.edit}
                    aria-label="edit"
                    onClick={() => handleEditClick(row)}
                  >
                    <LiaEdit className="w-6 h-6" />
                  </button>
                  <button
                    className="flex items-center justify-center text-gray-500 px-2 py-2 rounded-full hover:bg-gray-600 hover:text-white"
                    disabled={!row.actions.view}
                    aria-label="View"
                    onClick={() => handleViewClick(row)}
                  >
                    <IoEyeOutline className="w-6 h-6" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex justify-center items-center mt-4">
        {/* Önceki Sayfa */}
        <button
          onClick={goToPreviousPage}
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
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center transition-opacity duration-300 ease-in-out">
          <div
            className="p-6 rounded-[10px] w-[100%] px-12 py-8 transform scale-95 transition-transform duration-300 ease-out"
            style={{
              animation: "popupSlideIn 0.3s forwards",
            }}
          >
            <ViewAppointmentDetailsPopup
              data={selectedData}
              isEditable={isEditable}
              onClose={handleClosePopup}
              options={{
                clinic: clinicOptions,
                doctor: doctorOptions,
                gender: genderOptions,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultantTable;
