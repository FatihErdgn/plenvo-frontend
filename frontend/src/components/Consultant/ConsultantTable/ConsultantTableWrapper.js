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
// import servicesData from "../../../servicesData.json"; // <-- Hizmetlerinizi içeren JSON dosyası
import { useUser } from "../../../contexts/UserContext";
import { updateAppointment } from "../../../services/appointmentService";

// Bu tabloya özel wrapper
export default function ConsultantTableWrapper({
  data,
  searchQuery,
  startDate,
  endDate,
  options: { clinicOptions, doctorOptions, genderOptions },
  fetchAppointments, // <-- API'den randevu verisi çekmek için kullanılacak fonksiyon
  servicesData,
}) {
  // Duruma göre rozet/badge CSS'leri
  const getStatusClass = (status) => {
    switch (status) {
      case "Açık":
        return "items-center justify-center bg-[#EBF9F1] border-[1px] border-[#41BC63] text-[#41BC63] py-2.5 px-4 max-w-36 min-w-16 rounded-full text-center";
      case "Ödeme Bekleniyor":
        return "items-center justify-center bg-[#FBF9F4] border-[1px] border-[#BC9241] text-[#BC9241] py-2.5 px-4 max-w-36 min-w-16 rounded-full text-center text-[0.875rem]";
      case "Tamamlandı":
        return "items-center justify-center bg-gray-100 border-[1px] border-gray-500 text-gray-500 py-2.5 px-4 w-[9.375rem] max-w-36 min-w-16 rounded-full text-center";
      case "İptal Edildi":
        return "items-center justify-center bg-[#FBF4F4] border-[1px] border-[#BC4141] text-[#BC4141] py-2.5 px-4 max-w-36 min-w-16 rounded-full text-center";
      default:
        return "";
    }
  };

  // console.log("data", data);

  // Filtre fonksiyonu: searchQuery ile tabloyu filtreler
  const customFilterFn = useCallback((items, query) => {
    const _query = query.toLowerCase();
    return items?.filter((item) => {
      const fullName = `${item?.clientFirstName ?? ""} ${
        item?.clientLastName ?? ""
      }`.toLowerCase();
      const phoneNumber = (item?.phoneNumber ?? "").toLowerCase();
      const status = (item?.status ?? "").toLowerCase();
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
      const itemDate = new Date(item.datetime);
      const start = startDate ? new Date(startDate) : new Date("1970-01-01");
      const end = endDate ? new Date(endDate) : new Date("2999-12-31");
      return itemDate >= start && itemDate <= end;
    });
  }, []);

  // Kolon konfigürasyonu:
  // columns tanımı
  const columns = [
    {
      key: "clientFirstName",
      label: "İsim",
      renderCell: (row) => {
        // Eğer randevu tipi grup ise, ilk katılımcının ismi dönsün
        if (
          row.type === "group" &&
          row.participants &&
          row.participants.length > 0
        ) {
          return (
            <span
              className="block w-[7.5rem] mx-auto text-center truncate"
              title={row.clientFirstName}
            >
              Grup
            </span>
          );
        }
        // Tek kişilik randevu için doğrudan row içindeki değeri dönelim
        return (
          <span
            className="block w-[7.5rem] mx-auto text-center truncate"
            title={row.clientFirstName}
          >
            {row.clientFirstName}
          </span>
        );
      },
    },
    {
      key: "clientLastName",
      label: "Soyisim",
      renderCell: (row) => {
        if (
          row.type === "group" &&
          row.participants &&
          row.participants.length > 0
        ) {
          return (
            <span
              className="block w-[9.375rem] mx-auto text-center truncate"
              title={row.clientLastName}
            >
              Randevusu
            </span>
          );
        }
        return (
          <span
            className="block w-[9.375rem] mx-auto text-center truncate"
            title={row.clientLastName}
          >
            {row.clientLastName}
          </span>
        );
      },
    },
    {
      key: "phoneNumber",
      label: "Cep Numarası",
      renderCell: (row) => {
        if (
          row.type === "group" &&
          row.participants &&
          row.participants.length > 0
        ) {
          return (
            <span
              className="block w-[9.375rem] mx-auto text-center truncate"
              title={row.phoneNumber}
            >
              {row.participants[0].phoneNumber}
            </span>
          );
        }
        return (
          <span
            className="block w-[9.375rem] mx-auto text-center truncate"
            title={row.phoneNumber}
          >
            {row.phoneNumber}
          </span>
        );
      },
    },
    {
      key: "datetime",
      label: "Randevu Tarihi ve Saati",
      renderCell: (row) => {
        const dateObj = new Date(row.datetime);
        const day = String(dateObj.getDate()).padStart(2, "0");
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const year = dateObj.getFullYear();
        const hour = String(dateObj.getHours()).padStart(2, "0");
        const minute = String(dateObj.getMinutes()).padStart(2, "0");
        return `${day}.${month}.${year} ${hour}:${minute}`;
      },
    },
    {
      key: "status",
      label: "Durum",
      renderCell: (row) => (
        <span className={getStatusClass(row.status)}>{row.status}</span>
      ),
    },
    {
      key: "actions",
      label: "İşlem",
      renderCell: (row) => (
        <ConsultantActions
          row={row}
          options={{ clinicOptions, doctorOptions, genderOptions }}
          servicesData={servicesData}
          fetchAppointments={fetchAppointments}
        />
      ),
    },
  ];

  // excel Kolon konfigürasyonu:
  const excelColumns = [
    {
      key: "clientFirstName",
      label: "İsim",
      renderCell: (row) => {
        if (
          row.type === "group" &&
          row.participants &&
          row.participants.length > 0
        ) {
          return row.participants[0].clientFirstName;
        }
        return row.clientFirstName;
      },
    },
    {
      key: "clientLastName",
      label: "Soyisim",
      renderCell: (row) => {
        if (
          row.type === "group" &&
          row.participants &&
          row.participants.length > 0
        ) {
          return row.participants[0].clientLastName;
        }
        return row.clientLastName;
      },
    },
    {
      key: "participants",
      label: "Katılımcılar",
      renderCell: (row) => {
        if (
          row.type === "group" &&
          row.participants &&
          row.participants.length > 0
        ) {
          return row.participants
            .map((p) => `${p.clientFirstName} ${p.clientLastName}`)
            .join(", ");
        }
        return "-";
      },
    },
    {
      key: "age",
      label: "Yaş",
      renderCell: (row) => {
        // Eğer grup randevusu ise, tüm katılımcıların yaşlarını virgülle ayrılmış şekilde döndür
        if (
          row.type === "group" &&
          row.participants &&
          row.participants.length > 0
        ) {
          return row.participants.map((p) => `${p.age}`).join(", ");
        }
        // Tek randevuda, eğer row.age tanımlı ise onu döndür
        if (row.type === "single" && row.age) {
          return row.age;
        }
        return "-";
      },
    },
    {
      key: "phoneNumber",
      label: "Cep Numarası",
      renderCell: (row) => {
        if (
          row.type === "group" &&
          row.participants &&
          row.participants.length > 0
        ) {
          return row.participants[0].phoneNumber;
        }
        return row.phoneNumber;
      },
    },
    {
      key: "datetime",
      label: "Randevu Tarihi ve Saati",
      renderCell: (row) => {
        const dateObj = new Date(row.datetime);
        const day = String(dateObj.getDate()).padStart(2, "0");
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const year = dateObj.getFullYear();
        const hour = String(dateObj.getHours()).padStart(2, "0");
        const minute = String(dateObj.getMinutes()).padStart(2, "0");
        return `${day}.${month}.${year} ${hour}:${minute}`;
      },
    },
    {
      key: "status",
      label: "Durum",
      renderCell: (row) => (
        <span className={getStatusClass(row.status)}>{row.status}</span>
      ),
    },
    { key: "clinicName", label: "Klinik" },
    { key: "doctorName", label: "Doktor" }, // Eğer doktor bilgisi farklı bir key'de tutuluyorsa ona göre düzenleyin.
    { key: "type", label: "Randevu Tipi" },
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
          fetchAppointments={fetchAppointments}
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
  fetchAppointments,
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
        age: row.age,
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
      ? "bg-[#399AA1] text-white px-4 py-[9px] rounded-[1.25rem] hover:bg-[#007E85]"
      : "bg-gray-300 text-gray-500 px-4 py-[9px] rounded-[1.25rem] cursor-not-allowed";
  };

  return (
    <div className="flex flex-row justify-center text-sm items-center px-4 py-[0.875rem] space-x-2">
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
        onPaymentSuccess={fetchAppointments} // Ödeme başarılı olduğunda çalışacak fonksiyon
      />
      {/* <div>
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
      </div> */}
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
  fetchAppointments,
}) {
  const { isPopupOpen, setIsPopupOpen, selectedData, isEditable } =
    useTableContext();

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleEditAppointment = async (formData) => {
    try {
      // console.log("Güncellenecek randevu verisi:", formData);
      await updateAppointment(formData._id, formData);
      fetchAppointments();
      setTimeout(() => {
        setIsPopupOpen(false);
      }, 500);
    } catch (error) {
      console.error(error);
    }
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
          onEditAppointment={handleEditAppointment}
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
