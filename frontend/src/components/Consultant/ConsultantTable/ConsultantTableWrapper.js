// components/ConsultantTableWrapper.js
import React, { useCallback, useState } from "react";
import { TableProvider, useTableContext } from "../../../contexts/TableContext";
import GenericTable from "../../Table/GenericTable";
import ExportExcel from "../../../utils/ExportExcel"; // <-- Excel'e aktarım butonunuz
import { LiaEdit } from "react-icons/lia";
import { IoEyeOutline } from "react-icons/io5";
import ViewAppointmentDetailsPopup from "./ViewAppointmentDetailsPopup";
import RebookAppointment from "./RebookAppointment";
import PaymentPopup from "./PayNowButton";
import servicesData from "../../../servicesData.json"; // <-- Hizmetlerinizi içeren JSON dosyası
import { useUser } from "../../../contexts/UserContext";

// Bu tabloya özel wrapper
export default function ConsultantTableWrapper({
  data,
  searchQuery,
  startDate,
  endDate,
  options: { clinicOptions, doctorOptions, genderOptions },
}) {
  // Duruma göre rozet/badge CSS'leri
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

  // Filtre fonksiyonu: searchQuery ile tabloyu filtreler
  const customFilterFn = useCallback((items, query) => {
    const _query = query.toLowerCase();
    return items.filter((item) => {
      const fullName = `${item.clientFirstName} ${item.clientLastName}`.toLowerCase();
      const phoneNumber = item.phoneNumber.toLowerCase();
      const status = item.status.toLowerCase();
      return (
        fullName.includes(_query) ||
        phoneNumber.includes(_query) ||
        status.includes(_query)
      );
    });
  }, []);

  const customDateFilterFn = useCallback((items, startDate, endDate) => {
    if (!startDate && !endDate) {
      return items;
    }
    return items.filter((item) => {
      const itemDate = new Date(item.appointmentDateTime);
      const start = startDate ? new Date(startDate) : new Date("1970-01-01");
      const end = endDate ? new Date(endDate) : new Date("2999-12-31");
      return itemDate >= start && itemDate <= end;
    });
  }, []);

  // Kolon konfigürasyonu:
  const columns = [
    { key: "clientFirstName", label: "İsim" },
    { key: "clientLastName", label: "Soyisim" },
    { key: "phoneNumber", label: "Cep Numarası" },
    { key: "appointmentDateTime", label: "Randevu Tarihi ve Saati" },
    {
      key: "status",
      label: "Durum",
      renderCell: (row) => (
        <span className={getStatusClass(row.status)}>{row.status}</span>
      ),
    },
    {
      key: "actions", // Excel'e giderken bu kolonu hariç bırakabilirsiniz
      label: "İşlem",
      renderCell: (row) => (
        <ConsultantActions
          row={row}
          options={{ clinicOptions, doctorOptions, genderOptions }}
          servicesData={servicesData}
        />
      ),
    },
  ];

  // Kolon konfigürasyonu:
  const excelColumns = [
    { key: "clientFirstName", label: "İsim" },
    { key: "clientLastName", label: "Soyisim" },
    { key: "age", label: "Yaş" },
    { key: "phoneNumber", label: "Cep Numarası" },
    { key: "appointmentDateTime", label: "Randevu Tarihi ve Saati" },
    {
      key: "status",
      label: "Durum",
      renderCell: (row) => (
        <span className={getStatusClass(row.status)}>{row.status}</span>
      ),
    },
    { key: "clinic", label: "Klinik" },
    { key: "doctor", label: "Doktor" },
    {
      key: "actions", // Excel'e giderken bu kolonu hariç bırakabilirsiniz
      label: "İşlem",
      renderCell: (row) => (
        <ConsultantActions
          row={row}
          options={{ clinicOptions, doctorOptions, genderOptions }}
          servicesData={servicesData}
        />
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
      rowsPerPage={8}
      customFilterFn={customFilterFn}
      customDateFilterFn={customDateFilterFn}
    >
      <div className="flex flex-col bg-white max-h-full justify-between font-montserrat p-6 rounded-lg shadow-md">
        {/* Üst satır: Başlık (isteğe bağlı) + Excel butonu */}
        <div className="flex flex-row justify-between items-center mb-4">
          {/* Eğer başlık istemiyorsanız, boş bir <div /> veya <span /> bırakabilirsin */}
          <h2 className="text-lg font-semibold text-gray-700">
            Randevu Listesi
          </h2>

          <ExportExcel fileName="RandevuListesi.xlsx" />
        </div>

        {/* Tablo alanı */}
        <div className="flex-1 overflow-y-auto">
          <GenericTable />
        </div>

        {/* Popup'ları render edecek alan */}
        <ConsultantPopupArea
          options={{
            clinicOptions,
            doctorOptions,
            genderOptions,
          }}
        />
      </div>
    </TableProvider>
  );
}

// Tablodaki action butonları
function ConsultantActions({
  row,
  options: { clinicOptions, doctorOptions, genderOptions },
  servicesData,
}) {
  const { setSelectedData, setIsEditable, setIsPopupOpen } = useTableContext();
  const [rebookOpen, setRebookOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const { userProfile, loading } = useUser();
  // console.log(userProfile);

  // **Veriler yüklenene kadar bekle**
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold text-gray-700">Yükleniyor...</p>
      </div>
    );
  }

  const handleReBook = () => {
    setRebookOpen(true);
  };

  const handlePayNow = () => {
    setPaymentOpen(true);
  };

  const getPrefilledData = () => {
    if (row.type === "group") {
      return {
        type: "group",
        clinic: row.clinic,
        doctor: row.doctor,
        // vs. ...
        participants: row.participants || [
          {
            clientFirstName: row.clientFirstName,
            clientLastName: row.clientLastName,
            phoneNumber: row.phoneNumber,
            gender: row.gender,
            age: row.age,
          },
        ],
      };
    } else {
      // Tek kişi
      return {
        type: "single",
        clientFirstName: row.clientFirstName,
        clientLastName: row.clientLastName,
        day: row.day,
        month: row.month,
        year: row.year,
        gender: row.gender,
        phoneNumber: row.phoneNumber,
        clinic: row.clinic,
        doctor: row.doctor,
        // appointmentDateTime? -> eğer row'dan alıyorsanız
        // ama yenilemede boş bırakmak istiyoruz
      };
    }
  };

  // Mevcut tabloda "Ödeme Yap", "Randevu Yenile" gibi butonlar da var.
  // Onları da dilediğiniz gibi ekleyebilirsiniz.

  const handleEditClick = () => {
    setSelectedData(row);
    if (
      row.status === "Tamamlandı" ||
      userProfile?.roleId?.roleName === "manager"
    ) {
      setIsEditable(false);
    } else {
      setIsEditable(true);
    }
    setIsPopupOpen(true);
  };

  const handleViewClick = () => {
    setSelectedData(row);
    setIsEditable(false);
    setIsPopupOpen(true);
  };

  // "payNow", "reBook" gibi aksiyonlar row.actions içinde tutuyorsunuz
  // getButtonClasses gibi bir fonksiyon da ekleyebilirsiniz
  const getButtonClasses = (enabled) => {
    return enabled
      ? "bg-[#399AA1] text-white px-4 py-[9px] rounded-[20px] hover:bg-[#007E85]"
      : "bg-gray-300 text-gray-500 px-4 py-[9px] rounded-[20px] cursor-not-allowed";
  };

  return (
    <div className="flex flex-row justify-center text-sm items-center px-4 py-[14px] space-x-2">
      <button
        className={getButtonClasses(row.actions?.payNow)}
        disabled={!row.actions?.payNow}
        onClick={handlePayNow}
      >
        Ödeme Yap
      </button>
      <PaymentPopup
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        row={row} // hasta/doktor verisi
        servicesData={servicesData} // JSON liste
      />
      <div>
        <button
          className={getButtonClasses(row.actions?.reBook)}
          disabled={!row.actions?.reBook}
          onClick={handleReBook}
        >
          Randevu Yenile
        </button>
        <RebookAppointment
          isOpen={rebookOpen}
          onClose={() => setRebookOpen(false)}
          prefilledData={getPrefilledData()}
          options={{ genderOptions, clinicOptions, doctorOptions }}
        />
      </div>
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

// Popup Alanı
function ConsultantPopupArea({
  options: { clinicOptions, doctorOptions, genderOptions },
}) {
  const { isPopupOpen, setIsPopupOpen, selectedData, isEditable } =
    useTableContext();

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  if (!isPopupOpen) return null;

  return (
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
            clinicOptions,
            doctorOptions,
            genderOptions,
          }}
        />
      </div>
    </div>
  );
}
