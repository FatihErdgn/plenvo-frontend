import React from "react";
import { LiaEdit } from "react-icons/lia";
import { IoEyeOutline } from "react-icons/io5";
import { useState, useEffect } from "react";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import ViewPersonnelDetailsPopup from "./ViewPersonnelDetailsPopup";

const PersonnelTable = ({ searchQuery, data }) => {
  console.log("Search Query:", searchQuery);
  const [currentPage, setCurrentPage] = useState(1); // Sayfa numarası
  const [selectedData, setSelectedData] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const rowsPerPage = 10; // Sayfa başına gösterilecek satır sayısı

  const getStatusClass = (status) => {
    switch (status) {
      case "Manager":
        return "inline-block bg-[#41BC63] border-[1px] border-[#41BC63] text-[#ffffff] py-[6px] px-[12px] rounded-md font-semibold text-sm";
      case "Consultant":
        return "inline-block bg-[#BC9241] border-[1px] border-[#BC9241] text-[#ffffff] py-[6px] px-[12px] rounded-md font-semibold text-sm";
      case "Admin":
        return "inline-block bg-[#BC4141] border-[1px] border-[#BC4141] text-[#ffffff] py-[6px] px-[12px] rounded-md font-semibold text-sm";
      case "Doctor":
        return "inline-block bg-[#025E86] border-[1px] border-[#025E86] text-[#ffffff] py-[6px] px-[12px] rounded-md font-semibold text-sm";
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
        const userRole = item.role.toLowerCase();
        const query = searchQuery.toLowerCase();
        const isMatch = fullName.includes(query) || userRole.includes(query);
        // console.log("Checking:", fullName, phoneNumber, "Match:", isMatch);
        return isMatch;
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

  const professionOptions =
    data && Array.isArray(data)
      ? [...new Set(data.map((item) => item.profession))]
      : [];
  const specialityOptions =
    data && Array.isArray(data)
      ? [...new Set(data.map((item) => item.speciality))]
      : [];

  const roleOptions = ["Consultant", "Doctor", "Manager", "Admin"];

  return (
    <div className="bg-white font-montserrat p-6 rounded-lg shadow-md">
      <table className="table-auto w-full border-collapse bg-white shadow-sm rounded-lg">
        <thead>
          <tr className="text-gray-700 text-center">
            <th className="px-4 py-2 text-center">İsim</th>
            <th className="px-4 py-2 text-center">Soyisim</th>
            <th className="px-4 py-2 w-1/4 text-center">Eposta</th>
            <th className="px-4 py-2 text-center">İşe Giriş Tarihi</th>
            <th className="px-4 py-2 text-center">Rol</th>
            <th className="px-4 py-2 text-center">İşlem</th>
          </tr>
        </thead>

        <tbody>
          {currentData.map((row) => (
            <tr
              key={row.id}
              className="odd:bg-[#F7F6FE] even:bg-white hover:bg-green-50 text-center"
            >
              <td className="px-4 py-2 text-center">{row.firstName}</td>
              <td className="px-4 py-2 text-center">{row.lastName}</td>
              <td className="px-4 py-2 w-1/4 text-center">{row.email}</td>
              <td className="px-4 py-2 text-center">{row.hireDate}</td>
              <td className="px-4 py-2 text-center">
                <span className={getStatusClass(row.role)}>{row.role}</span>
              </td>
              <td className="flex flex-row justify-center text-sm items-center px-4 py-[14px] space-x-2">
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
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center transition-opacity duration-300 ease-in-out">
          <div
            className="p-6 rounded-[10px] w-[100%] px-12 py-8 transform scale-95 transition-transform duration-300 ease-out"
            style={{
              animation: "popupSlideIn 0.3s forwards",
            }}
          >
            <ViewPersonnelDetailsPopup
              data={selectedData}
              isEditable={isEditable}
              onClose={handleClosePopup}
              options={{
                profession: professionOptions,
                speciality: specialityOptions,
                role: roleOptions,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonnelTable;
