// components/PersonnelTableWrapper.js
import React, { useCallback } from "react";
import { TableProvider, useTableContext } from "../../contexts/TableContext";
import GenericTable from "../Table/GenericTable";
import { LiaEdit } from "react-icons/lia";
import { IoEyeOutline } from "react-icons/io5";
import ViewPersonnelDetailsPopup from "./ViewPersonnelDetailsPopup";
import ExportExcel from "../../utils/ExportExcel";

export default function PersonnelTableWrapper({
  data,
  searchQuery,
  startDate,
  endDate,
}) {
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
      const clinic = item.clinic.toLowerCase();
      const _query = query.toLowerCase();
      return fullName.includes(_query) || userRole.includes(_query) || clinic.includes(_query);
    });
  }, []);

  const customDateFilterFn = useCallback((items, startDate, endDate) => {
    // eğer iki tarih de boş ya da geçersiz ise doğrudan items dön
    if (!startDate && !endDate) {
      return items;
    }

    return items.filter((item) => {
      const itemDate = new Date(item.hireDate);

      // eğer startDate veya endDate’den herhangi biri boşsa
      // ona göre filtreleyin, örneğin:
      const start = startDate ? new Date(startDate) : new Date("1970-01-01");
      const end = endDate ? new Date(endDate) : new Date("2999-12-31");

      return itemDate >= start && itemDate <= end;
    });
  }, []);

  // Tablonun kolon konfigürasyonu
  const columns = [
    { key: "firstName", label: "İsim" },
    { key: "lastName", label: "Soyisim" },
    { key: "clinic", label: "Klinik" },
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
      startDate={startDate}
      endDate={endDate}
      rowsPerPage={7}
      customFilterFn={customFilterFn}
      customDateFilterFn={customDateFilterFn}
    >
      <div className="font-montserrat bg-white p-6 rounded-lg shadow-md flex flex-col justify-between h-[79vh]">
        {/* Üst satır: Başlık (isteğe bağlı) + Excel butonu */}
        <div className="flex flex-row justify-between items-center mb-4">
          {/* Eğer başlık istemiyorsanız, boş bir <div /> veya <span /> bırakabilirsiniz */}
          <h2 className="text-lg font-semibold text-gray-700">
            Personel Listesi
          </h2>

          <ExportExcel fileName="PersonelListesi.xlsx" />
        </div>

        {/* Tablo alanı */}
        <div className="flex-1 overflow-y-auto">
          <GenericTable />
        </div>

        {/* Popup alanı */}
        <PersonnelPopupArea />
      </div>
    </TableProvider>
  );
}

// Aksiyon butonlarını ayrı bir component’te tanımlayabilirsiniz.
function PersonnelTableActions({ row }) {
  const { setSelectedData, setIsEditable, setIsPopupOpen } = useTableContext();

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
  const { data, isPopupOpen, setIsPopupOpen, selectedData, isEditable } =
    useTableContext();

  // Bu örnekte sadece context verisini aldık. Popup kapama:
  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  // Profesyon, specialty, role gibi opsiyonlar
  // Bu örnek için veriyi context içinden alabilir
  const professionOptions =
    data && Array.isArray(data)
      ? [...new Set(data.map((item) => item.profession))]
      : [];
  const specialityOptions =
    data && Array.isArray(data)
      ? [...new Set(data.map((item) => item.speciality))]
      : [];
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
