// components/PersonnelTableWrapper.js
import React, { useCallback } from "react";
import { TableProvider,useTableContext } from "../../contexts/TableContext";
import GenericTable from "../Table/GenericTable";
import { LiaEdit } from "react-icons/lia";
import { IoEyeOutline } from "react-icons/io5";
import ViewPersonnelDetailsPopup from "./ViewPersonnelDetailsPopup";

export default function PersonnelTableWrapper({ data, searchQuery }) {
  // Roller için badge css sınıfı
  const getStatusClass = (role) => {
    switch (role) {
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

  // Filtre fonksiyonu
  const customFilterFn = useCallback((items, query) => {
    return items.filter((item) => {
      const fullName = `${item.firstName} ${item.lastName}`.toLowerCase();
      const userRole = item.role.toLowerCase();
      const _query = query.toLowerCase();
      return fullName.includes(_query) || userRole.includes(_query);
    });
  }, []);

  // Tablonun kolon konfigürasyonu
  const columns = [
    { key: "firstName", label: "İsim" },
    { key: "lastName", label: "Soyisim" },
    { key: "email", label: "E-posta" },
    { key: "hireDate", label: "İşe Giriş Tarihi" },
    {
      key: "role",
      label: "Rol",
      renderCell: (row) => (
        <span className={getStatusClass(row.role)}>{row.role}</span>
      ),
    },
    {
      key: "actions",
      label: "İşlem",
      renderCell: (row) => <PersonnelTableActions row={row} />,
    },
  ];

  return (
    <TableProvider
      data={data}
      columns={columns}
      searchQuery={searchQuery}
      rowsPerPage={10}
      customFilterFn={customFilterFn}
    >
      <div className="font-montserrat bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
        <GenericTable />
        <PersonnelPopupArea />
      </div>
    </TableProvider>
  );
}

// Aksiyon butonlarını ayrı bir component’te tanımlayabilirsiniz.
function PersonnelTableActions({ row }) {
  const {
    setSelectedData,
    setIsEditable,
    setIsPopupOpen,
  } = useTableContext();

  const handleEditClick = () => {
    setSelectedData(row);
    setIsEditable(true);
    setIsPopupOpen(true);
  };

  const handleViewClick = () => {
    setSelectedData(row);
    setIsEditable(false);
    setIsPopupOpen(true);
  };

  return (
    <div className="flex flex-row justify-center text-sm items-center px-4 py-[14px] space-x-2">
      <button
        className="flex items-center justify-center text-red-500 px-2 py-2 rounded-full hover:bg-red-600 hover:text-white"
        disabled={!row.actions?.edit}
        aria-label="edit"
        onClick={handleEditClick}
      >
        <LiaEdit className="w-6 h-6" />
      </button>
      <button
        className="flex items-center justify-center text-gray-500 px-2 py-2 rounded-full hover:bg-gray-600 hover:text-white"
        disabled={!row.actions?.view}
        aria-label="View"
        onClick={handleViewClick}
      >
        <IoEyeOutline className="w-6 h-6" />
      </button>
    </div>
  );
}

// Pop-up alanı
function PersonnelPopupArea() {
  const {
    isPopupOpen,
    setIsPopupOpen,
    selectedData,
    isEditable,
  } = useTableContext();

  // Bu örnekte sadece context verisini aldık. Popup kapama:
  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  // Profesyon, specialty, role gibi opsiyonlar
  // Bu örnek için veriyi context içinden alabilir
  const professionOptions = ["Diyetisyen", "Psikolog", "Fizyoterapist"];
  const specialityOptions = ["Bel Fıtığı", "Obezite"];
  const roleOptions = ["Consultant", "Doctor", "Manager", "Admin"];

  if (!isPopupOpen) return null;

  return (
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
  );
}
