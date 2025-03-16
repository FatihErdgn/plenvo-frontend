// components/ServiceManagementTableWrapper.js
import React, { useCallback } from "react";
import { TableProvider, useTableContext } from "../../contexts/TableContext";
import GenericTable from "../Table/GenericTable";
import { LiaEdit } from "react-icons/lia";
import { MdDelete } from "react-icons/md";
import ViewServiceDetailsPopup from "./ViewServiceDetailsPopup";
import ExportExcel from "../../utils/ExportExcel";
import {
  softDeleteService,
  updateService,
} from "../../services/serviceService";

export default function ServiceManagementTableWrapper({
  data,
  searchQuery,
  startDate,
  endDate,
  fetchServices,
}) {
  const getStatusClass = (status) => {
    switch (status) {
      case "Aktif":
        return "inline-block bg-[#41BC63] border-[1px] border-[#41BC63] text-[#ffffff] py-[0.375rem] px-[0.75rem] rounded-md font-semibold text-sm";
      case "Pasif":
        return "inline-block bg-[#BC9241] border-[1px] border-[#BC9241] text-[#ffffff] py-[0.375rem] px-[0.75rem] rounded-md font-semibold text-sm";
      default:
        return "";
    }
  };

  const customFilterFn = useCallback((items, query) => {
    return items.filter((item) => {
      const serviceName = item.serviceName.toLowerCase();
      const provider = item.provider.toLowerCase();
      const validityDate = item.validityDate.toLowerCase();
      const currency = item.currencyName.toLowerCase();
      const _query = query.toLowerCase();
      return (
        serviceName.includes(_query) ||
        provider.includes(_query) ||
        validityDate.includes(_query) ||
        currency.includes(_query)
      );
    });
  }, []);

  const customDateFilterFn = useCallback((items, startDate, endDate) => {
    if (!startDate && !endDate) {
      return items;
    }

    return items.filter((item) => {
      const itemDate = new Date(item.validityDate);
      const start = startDate ? new Date(startDate) : new Date("1970-01-01");
      const end = endDate ? new Date(endDate) : new Date("2999-12-31");

      return itemDate >= start && itemDate <= end;
    });
  }, []);

  const columns = [
    { key: "serviceName", label: "Hizmet Adı" },
    { key: "provider", label: "Hizmet Sağlayıcı" },
    {
      key: "validityDate",
      label: "Hizmet Bedeli Başlangıç Tarihi",
      renderCell: (row) => {
        const dateObj = new Date(row.validityDate);
        const day = String(dateObj.getDate()).padStart(2, "0");
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const year = dateObj.getFullYear();

        return `${day}.${month}.${year}`;
      },
    },
    {
      key: "status",
      label: "Durum",
      renderCell: (row) => (
        <span className={getStatusClass(row.status)}>{row.status}</span>
      ),
    },
    { key: "serviceFee", label: "Hizmet Bedeli" },
    { key: "currencyName", label: "Para Birimi" },
    {
      key: "actions",
      label: "İşlem",
      renderCell: (row) => (
        <ServiceManagementActions row={row} fetchServices={fetchServices} />
      ),
    },
  ];

  const excelColumns = [
    { key: "serviceName", label: "Hizmet Adı" },
    { key: "provider", label: "Hizmet Sağlayıcı" },
    {
      key: "validityDate",
      label: "Hizmet Bedeli Başlangıç Tarihi",
      renderCell: (row) => {
        const dateObj = new Date(row.validityDate);
        const day = String(dateObj.getDate()).padStart(2, "0");
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const year = dateObj.getFullYear();

        return `${day}.${month}.${year}`;
      },
    },
    {
      key: "status",
      label: "Durum",
      renderCell: (row) => (
        <span className={getStatusClass(row.status)}>{row.status}</span>
      ),
    },
    { key: "serviceFee", label: "Hizmet Bedeli" },
    { key: "currencyName", label: "Para Birimi" },
  ];

  return (
    <TableProvider
      data={data}
      columns={columns}
      excelColumns={excelColumns}
      searchQuery={searchQuery}
      startDate={startDate}
      endDate={endDate}
      // rowsPerPage={10}
      customFilterFn={customFilterFn}
      customDateFilterFn={customDateFilterFn}
    >
      <div className="font-montserrat bg-white p-6 rounded-lg shadow-md flex flex-col h-[79vh]">
        {/* Üst satır: Başlık (isteğe bağlı) + Excel butonu */}
        <div className="flex flex-row justify-between items-center mb-4">
          {/* Eğer başlık istemiyorsanız, boş bir <div /> veya <span /> bırakabilirsiniz */}
          <h2 className="text-lg font-semibold text-gray-700">
            Hizmet Listesi
          </h2>

          <ExportExcel fileName="HizmetListesi.xlsx" />
        </div>

        {/* Tablo alanı */}
        <div className="flex-1 overflow-y-auto">
          <GenericTable />
        </div>
        <ServicePopupArea fetchServices={fetchServices} />
      </div>
    </TableProvider>
  );
}

function ServiceManagementActions({ row, fetchServices }) {
  const { setSelectedData, setIsPopupOpen, setIsEditable } = useTableContext();

  const handleEditClick = () => {
    setSelectedData(row);
    setIsEditable(true);
    setTimeout(() => {
      setIsPopupOpen(true);
    }, 100);
  };

  const handleDeleteService = async (id) => {
    if (window.confirm("Hizmeti silmek istediğinize emin misiniz?")) {
      try {
        await softDeleteService(id);
        fetchServices();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="flex flex-row justify-center text-sm items-center px-4 py-[0.875rem] space-x-2">
      <button
        className="flex items-center justify-center text-red-500 px-2 py-2 rounded-full hover:bg-red-600 hover:text-white"
        // disabled={!row.actions?.edit}
        aria-label="edit"
        onClick={handleEditClick}
      >
        <LiaEdit className="w-6 h-6" />
      </button>
      <button
        onClick={() => handleDeleteService(row._id)}
        className="text-red-500 px-2 py-2 rounded-full hover:bg-red-600 hover:text-white"
        title="Hizmeti Sil"
      >
        <MdDelete size={20} />
      </button>
      {/* Örnek olarak "view" butonu devre dışı bırakıldı */}
    </div>
  );
}

function ServicePopupArea({ fetchServices }) {
  const {
    data,
    isPopupOpen,
    setIsPopupOpen,
    selectedData,
    // isEditable,
  } = useTableContext();

  // Eğer seçili veri henüz yüklenmediyse (undefined/null ise) pop-up açılmasın
  if (!isPopupOpen || !selectedData) return null;

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleEditService = async (formData) => {
    try {
      // console.log("Güncellenecek servis verisi:", formData);
      await updateService(formData._id, formData);
      fetchServices();
      setTimeout(() => {
        setIsPopupOpen(false);
      }, 500);
    } catch (error) {
      console.error(error);
    }
  };

  const providerOptions =
    data && Array.isArray(data)
      ? [...new Set(data.map((item) => item.provider))]
      : [];
  const statusOptions = ["Aktif", "Pasif"];
  const currencyOptions = ["TRY", "USD", "EUR"];

  if (!isPopupOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center transition-opacity duration-300 ease-in-out">
      <div
        className="p-6 rounded-[10px] w-[100%] px-12 py-8 transform scale-95 transition-transform duration-300 ease-out"
        style={{
          animation: "popupSlideIn 0.3s forwards",
        }}
      >
        <ViewServiceDetailsPopup
          onEditService={handleEditService}
          data={selectedData}
          onClose={handleClosePopup}
          options={{
            provider: providerOptions,
            status: statusOptions,
            currency: currencyOptions,
          }}
        />
      </div>
    </div>
  );
}
