// components/ServiceManagementTableWrapper.js
import React, { useCallback } from "react";
import { TableProvider,useTableContext } from "../../contexts/TableContext";
import GenericTable from "../Table/GenericTable";
import { LiaEdit } from "react-icons/lia";
import ViewServiceDetailsPopup from "./ViewServiceDetailsPopup";

export default function ServiceManagementTableWrapper({ data, searchQuery }) {
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

  const customFilterFn = useCallback((items, query) => {
    return items.filter((item) => {
      const serviceName = item.serviceName.toLowerCase();
      const provider = item.provider.toLowerCase();
      const validityDate = item.validityDate.toLowerCase();
      const currency = item.currency.toLowerCase();
      const _query = query.toLowerCase();
      return (
        serviceName.includes(_query) ||
        provider.includes(_query) ||
        validityDate.includes(_query) ||
        currency.includes(_query)
      );
    });
  }, []);

  const columns = [
    { key: "serviceName", label: "Hizmet Adı" },
    { key: "provider", label: "Hizmet Sağlayıcı" },
    { key: "validityDate", label: "Hizmet Geçerlilik Tarihi" },
    {
      key: "status",
      label: "Durum",
      renderCell: (row) => (
        <span className={getStatusClass(row.status)}>{row.status}</span>
      ),
    },
    { key: "serviceFee", label: "Hizmet Bedeli" },
    { key: "currency", label: "Para Birimi" },
    {
      key: "actions",
      label: "İşlem",
      renderCell: (row) => <ServiceManagementActions row={row} />,
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
      <div className="font-montserrat bg-white p-6 rounded-lg shadow-md flex flex-col h-[79vh]">
        <GenericTable />
        <ServicePopupArea />
      </div>
    </TableProvider>
  );
}

function ServiceManagementActions({ row }) {
  const { setSelectedData, setIsPopupOpen, setIsEditable } = useTableContext();

  const handleEditClick = () => {
    setSelectedData(row);
    setIsEditable(true);
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
      {/* Örnek olarak "view" butonu devre dışı bırakıldı */}
    </div>
  );
}

function ServicePopupArea() {
  const {
    data,
    isPopupOpen,
    setIsPopupOpen,
    selectedData,
    // isEditable,
  } = useTableContext();

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const providerOptions = data && Array.isArray(data) ? [...new Set(data.map((item) => item.provider))] : [];
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
