// components/PersonnelTableWrapper.js
import React, { useCallback } from "react";
import { TableProvider, useTableContext } from "../../contexts/TableContext";
import GenericTable from "../Table/GenericTable";
import { LiaEdit } from "react-icons/lia";
import { IoEyeOutline } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import ViewPersonnelDetailsPopup from "./ViewPersonnelDetailsPopup";
import ExportExcel from "../../utils/ExportExcel";
import { deleteUser, updateUser } from "../../services/userService";
import { useUser } from "../../contexts/UserContext";

export default function PersonnelTableWrapper({
  data,
  searchQuery,
  startDate,
  endDate,
  fetchUsers,
}) {
  // Roller için badge css sınıfı
  const getStatusClass = (role) => {
    switch (role) {
      case "manager":
        return "inline-block bg-[#41BC63] border-[1px] border-[#41BC63] text-[#ffffff] py-[6px] px-[12px] rounded-md font-semibold text-sm";
      case "consultant":
        return "inline-block bg-[#BC9241] border-[1px] border-[#BC9241] text-[#ffffff] py-[6px] px-[12px] rounded-md font-semibold text-sm";
      case "admin":
        return "inline-block bg-[#BC4141] border-[1px] border-[#BC4141] text-[#ffffff] py-[6px] px-[12px] rounded-md font-semibold text-sm";
      case "doctor":
        return "inline-block bg-[#025E86] border-[1px] border-[#025E86] text-[#ffffff] py-[6px] px-[12px] rounded-md font-semibold text-sm";
      default:
        return "";
    }
  };

  // Filtre fonksiyonu
  const customFilterFn = useCallback((items, query) => {
    return items.filter((item) => {
      const fullName = `${item?.firstName ?? ""} ${
        item?.lastName ?? ""
      }`.toLowerCase();
      const userRole = item.roleName?.toLowerCase();
      const clinic = item.clinicName?.toLowerCase();
      const _query = query.toLowerCase();
      return (
        fullName?.includes(_query) ||
        userRole?.includes(_query) ||
        clinic?.includes(_query)
      );
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
    { key: "clinicName", label: "Klinik" },
    { key: "userMail", label: "E-posta" },
    {
      key: "hireDate",
      label: "İşe Giriş Tarihi",
      renderCell: (row) => {
        const dateObj = new Date(row.hireDate);
        const day = String(dateObj.getDate()).padStart(2, "0");
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const year = dateObj.getFullYear();

        return `${day}.${month}.${year}`;
      },
    },
    {
      key: "roleName",
      label: "Rol",
      renderCell: (row) => (
        <span className={getStatusClass(row.roleName)}>{row.roleName}</span>
      ),
    },
    {
      key: "actions",
      label: "İşlem",
      renderCell: (row) => (
        <PersonnelTableActions row={row} fetchUsers={fetchUsers} />
      ),
    },
  ];

  // Tablonun kolon konfigürasyonu
  const excelColumns = [
    { key: "firstName", label: "İsim" },
    { key: "lastName", label: "Soyisim" },
    { key: "clinicName", label: "Klinik" },
    { key: "profession", label: "Meslek" },
    { key: "speciality", label: "Uzmanlık" },
    { key: "salary", label: "Maaş" },
    { key: "phoneNumber", label: "Telefon Numarası" },
    { key: "userMail", label: "E-posta" },
    {
      key: "hireDate",
      label: "İşe Giriş Tarihi",
      renderCell: (row) => {
        const dateObj = new Date(row.hireDate);
        const day = String(dateObj.getDate()).padStart(2, "0");
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const year = dateObj.getFullYear();

        return `${day}.${month}.${year}`;
      },
    },
    {
      key: "roleName",
      label: "Rol",
      renderCell: (row) => (
        <span className={getStatusClass(row.role)}>{row.role}</span>
      ),
    },
  ];

  return (
    <TableProvider
      data={data}
      columns={columns}
      excelColumns={excelColumns}
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
        <PersonnelPopupArea fetchUsers={fetchUsers} />
      </div>
    </TableProvider>
  );
}

// Aksiyon butonlarını ayrı bir component’te tanımlayabilirsiniz.
function PersonnelTableActions({ row, fetchUsers }) {
  const { setSelectedData, setIsEditable, setIsPopupOpen } = useTableContext();
  // **Context'ten userProfile'ı al**
  const { userProfile } = useUser();
  const handleEditClick = () => {
    setSelectedData(row);
    setIsEditable(true);

    // 100ms gecikmeyle pop-up aç, böylece `selectedData` yüklenmiş olur
    setTimeout(() => {
      setIsPopupOpen(true);
    }, 100);
  };

  const handleViewClick = () => {
    setSelectedData(row);
    setIsEditable(false);

    setTimeout(() => {
      setIsPopupOpen(true);
    }, 100);
  };

  // Soft Delete İşlemi
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?"))
      return;
    try {
      if (userId !== userProfile._id) {
        await deleteUser(userId);
        fetchUsers(); // Güncellenmiş veriyi çek
      } else {
        alert("Kendi hesabınızı silemezsiniz.");
      }
    } catch (error) {
      console.error("Silme işlemi sırasında hata oluştu:", error);
    }
  };

  return (
    <div className="flex flex-row justify-center text-sm items-center px-4 py-[14px] space-x-2">
      <button
        className="flex items-center justify-center text-red-500 px-2 py-2 rounded-full hover:bg-red-600 hover:text-white"
        // disabled={!row.actions?.edit}
        aria-label="edit"
        onClick={handleEditClick}
      >
        <LiaEdit className="w-6 h-6" />
      </button>
      <button
        className="flex items-center justify-center text-gray-500 px-2 py-2 rounded-full hover:bg-gray-600 hover:text-white"
        // disabled={!row.actions?.view}
        aria-label="View"
        onClick={handleViewClick}
      >
        <IoEyeOutline className="w-6 h-6" />
      </button>
      <button
        onClick={() => handleDeleteUser(row._id)}
        className="text-red-500 px-2 py-2 rounded-full hover:bg-red-600 hover:text-white"
        title="Kullanıcıyı Sil"
      >
        <MdDelete size={20} />
      </button>
    </div>
  );
}

// Pop-up alanı
function PersonnelPopupArea({ fetchUsers }) {
  const { data, isPopupOpen, setIsPopupOpen, selectedData, isEditable } =
    useTableContext();

  // Eğer seçili veri henüz yüklenmediyse (undefined/null ise) pop-up açılmasın
  if (!isPopupOpen || !selectedData) return null;

  // Pop-up kapama fonksiyonu
  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleEditUser = async (updatedUserData) => {
    try {
      // 1) Kullanıcı güncelleme işlemi
      console.log(
        "handleEditUser çağrıldı. Güncellenecek veri:",
        updatedUserData
      );
      await updateUser(updatedUserData._id, updatedUserData);
      fetchUsers();

      // 3) Pop-up'ı kapatabilirsiniz:
      setTimeout(() => {
        setIsPopupOpen(false);
      }, 500);
    } catch (err) {
      console.error("Kullanıcı güncelleme hatası:", err);
      // Hata gösterimi yapabilirsiniz
    }
  };

  // Veriler boş olabilir, bu yüzden ?. operatörünü kullanıyoruz
  const professionOptions =
    data && Array.isArray(data)
      ? [...new Set(data.map((item) => item.profession ?? "Bilinmiyor"))]
      : [];

  const specialityOptions =
    data && Array.isArray(data)
      ? [...new Set(data.map((item) => item.speciality ?? "Bilinmiyor"))]
      : [];

  const clinicOptions =
    data && Array.isArray(data)
      ? [...new Set(data.map((item) => item.clinic ?? "Bilinmiyor"))]
      : [];

  const roleOptions = ["Consultant", "Doctor", "Manager", "Admin"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center transition-opacity duration-300 ease-in-out">
      <div
        className="p-6 rounded-[10px] w-[100%] px-12 py-8 transform scale-95 transition-transform duration-300 ease-out"
        style={{
          animation: "popupSlideIn 0.3s forwards",
        }}
      >
        <ViewPersonnelDetailsPopup
          onEditUser={handleEditUser}
          data={selectedData}
          isEditable={isEditable}
          onClose={handleClosePopup}
          options={{
            profession: professionOptions,
            speciality: specialityOptions,
            clinic: clinicOptions,
            role: roleOptions,
          }}
        />
      </div>
    </div>
  );
}
