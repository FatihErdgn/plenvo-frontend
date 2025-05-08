// ViewPersonnelDetailsPopup.js
import React, { useState, useEffect } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { Alert, Collapse } from "@mui/material";

export default function ViewServiceDetailsPopup({
  data,
  onClose,
  onEditService,
  options: {
    provider: providerOptions,
    status: statusOptions,
    serviceType: serviceTypeOptions,
    currency: currencyOptions,
  },
}) {
  const [formData, setFormData] = useState(data || {});
  const [dropdownOpen, setDropdownOpen] = useState({
    provider: false,
    status: false,
    serviceType: false,
    currency: false,
  });
  const [alertState, setAlertState] = useState({
    message: "",
    severity: "",
    open: false,
  });

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const dropdowns = document.querySelectorAll(".dropdown-container");
      let clickedInside = false;

      dropdowns.forEach((dropdown) => {
        if (dropdown.contains(event.target)) {
          clickedInside = true;
        }
      });

      if (!clickedInside) {
        setDropdownOpen({
          provider: false,
          status: false,
          serviceType: false,
          currency: false,
        });
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const toggleDropdown = (key) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelect = (key, value) => {
    setFormData((prev) => {
      const updatedData = { ...prev, [key]: value };
      setDropdownOpen((prev) => ({
        ...prev,
        [key]: false,
      }));
      return updatedData;
    });
  };

  const formattedDate = (dateString) => {
    if (!dateString) return ""; // Eğer tarih boşsa hata vermemesi için boş string döndür
    const dateObj = new Date(dateString);
    if (isNaN(dateObj)) return ""; // Eğer geçersiz tarihse hata vermesin

    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();

    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (data?.validityDate) {
      setFormData((prev) => ({
        ...prev,
        validityDate: formattedDate(data.validityDate), // hireDate'i formatlı olarak ata
      }));
    }
  }, [data?.validityDate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.serviceName ||
      !formData.provider ||
      !formData.validityDate ||
      !formData.serviceFee ||
      !formData.currencyName ||
      !formData.status ||
      !formData.serviceType
    ) {
      setAlertState({
        message: "Lütfen tüm alanları doldurun.",
        severity: "error",
        open: true,
      });
      return;
    }
    try {
      // console.log("formData", formData);
      onEditService(formData);
    } catch (error) {
      console.error(error);
    }
    setAlertState({
      message: "Randevu başarıyla güncellendi.",
      severity: "success",
      open: true,
    });
  };

  useEffect(() => {
    if (alertState.open) {
      const timer = setTimeout(() => {
        setAlertState((prev) => ({ ...prev, open: false }));
      }, 5000); // 5 saniye sonra otomatik kapanır

      return () => clearTimeout(timer); // Temizleme işlemi
    }
  }, [alertState.open]);

  const renderDropdown = (label, key, options, direction = "down") => (
    <>
      <label htmlFor={key} className="text-gray-700 mb-2 block">
        {label}
      </label>
      <div className="relative mb-4 dropdown-container">
        <div
          className="px-4 py-2 border border-gray-300 hover:border-[#399AA1] hover:border-[2px] rounded-lg cursor-pointer bg-white flex justify-between items-center"
          onClick={() => toggleDropdown(key)}
        >
          {formData[key] || `Select ${label}`}
          <span className="ml-2 transform transition-transform duration-200 opacity-50">
            {dropdownOpen[key] ? "▲" : "▼"}
          </span>
        </div>
        {dropdownOpen[key] && (
          <ul
            className={`absolute left-0 right-0 bg-white border border-gray-300 rounded-lg max-h-[7.5rem] overflow-auto z-10 ${
              direction === "up" ? "bottom-full mb-1" : "top-full mt-1"
            }`}
          >
            {options.map((option, index) => (
              <li
                key={index}
                className="px-4 py-2 hover:bg-[#007E85] hover:text-white cursor-pointer"
                onClick={() => handleSelect(key, option)}
              >
                {option}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full md:w-4/5 lg:w-3/5 xl:w-1/2 max-h-[90vh] overflow-y-auto z-50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg md:text-xl font-semibold">
            Servis Ayrıntılarını Düzenle
          </h2>
          <button onClick={onClose}>
            <IoIosCloseCircleOutline className="w-6 h-6 text-gray-500 hover:text-gray-700" />
          </button>
        </div>
        <Collapse in={alertState.open}>
          <Alert
            severity={alertState.severity}
            onClose={() => setAlertState({ ...alertState, open: false })}
          >
            {alertState.message}
          </Alert>
        </Collapse>
        <form onSubmit={handleEditSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Hizmet Adı</label>
            <input
              type="text"
              name="serviceName"
              value={formData.serviceName || ""}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg border-gray-300"
            />
          </div>
          <div className="mb-4">
            {renderDropdown("Hizmet Sağlayıcı", "provider", providerOptions)}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">
              Hizmet Bedeli Başlangıç Tarihi
            </label>
            <input
              type="date"
              name="validityDate"
              value={formData.validityDate || ""}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg border-gray-300"
            />
          </div>
          <div className="mb-4">
            {renderDropdown("Durum", "status", statusOptions)}
          </div>
          {/* <div className="mb-4">
            <label className="block text-gray-700">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age || ""}
              onChange={handleInputChange}
              disabled={!isEditable}
              className={`w-full px-4 py-2 border rounded-lg ${
                isEditable
                  ? "border-gray-300"
                  : "border-transparent bg-gray-100"
              }`}
            />
          </div> */}
          <div className="mb-4">
            <label className="block text-gray-700">Hizmet Bedeli</label>
            <input
              type="number"
              name="serviceFee"
              value={formData.serviceFee || ""}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg border-gray-300"
            />
          </div>
          <div className="mb-4">
            {renderDropdown("Hizmet Tipi", "serviceType", serviceTypeOptions)}
          </div>
          <div className="mb-4">
            {renderDropdown(
              "Para Birimi",
              "currencyName",
              currencyOptions,
              "up"
            )}
          </div>
          
          <div className="mb-6 mt-8 p-4 border border-[#e8f4f5] bg-[#f8fdfd] rounded-lg shadow-sm">
            <h4 className="text-[#399AA1] font-medium mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              SMS Hatırlatıcı Ayarı
            </h4>
            <label className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  name="isSmsReminderActive"
                  checked={formData.isSmsReminderActive || false}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className={formData.isSmsReminderActive ? 'w-10 h-5 bg-[#399AA1] rounded-full shadow-inner transition-colors duration-300 ease-in-out' : 'w-10 h-5 bg-gray-200 rounded-full shadow-inner transition-colors duration-300 ease-in-out group-hover:bg-gray-300'}></div>
                <div className={`absolute left-0 top-0 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ease-in-out transform ${formData.isSmsReminderActive ? 'translate-x-5' : ''}`}></div>
              </div>
              <div>
                <span className="text-gray-700 font-medium">Bu hizmet için hatırlatıcı SMS gönderilsin mi?</span>
                <p className="text-gray-500 text-xs mt-1">Bu seçenek açıksa, bu hizmet için oluşturulan randevular için müşterilere WhatsApp üzerinden hatırlatıcı mesaj gönderilecektir.</p>
              </div>
            </label>
          </div>
          
          <div className="flex justify-center mt-6">
            {alertState.open ? (
              <button
                type="submit"
                className="w-full sm:w-auto px-8 sm:px-12 py-2 bg-[#f0f0f0] text-white rounded-full cursor-not-allowed"
                disabled
              >
                Kaydet
              </button>
            ) : (
              <button
                type="submit"
                className="w-full sm:w-auto px-8 sm:px-12 py-2 bg-[#399AA1] text-white rounded-full hover:bg-[#007E85] cursor-pointer"
              >
                Kaydet
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Overlay arka plan */}
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
    </div>
  );
}
