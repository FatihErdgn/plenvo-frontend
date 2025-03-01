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
    currency: currencyOptions,
  },
}) {
  const [formData, setFormData] = useState(data || {});
  const [dropdownOpen, setDropdownOpen] = useState({
    provider: false,
    status: false,
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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      !formData.status
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
    <div className="fixed inset-0 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Servis Ayrıntılarını Düzenle
          </h2>
          <button onClick={onClose}>
            <IoIosCloseCircleOutline className="w-6 h-6 text-gray-500 hover:text-gray-700" />
          </button>
        </div>
        <Collapse in={alertState.open}>
          <Alert
            severity={alertState.severity}
            onClose={() => setAlertState({ ...alertState, open: false })} // Manuel kapanma
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
            {renderDropdown(
              "Para Birimi",
              "currencyName",
              currencyOptions,
              "up"
            )}
          </div>
          <div className="flex justify-center">
            {alertState.open ? (
              <button
                type="submit"
                className="px-12 py-2 bg-[#f0f0f0] text-white rounded-full cursor-not-allowed"
                disabled
              >
                Kaydet
              </button>
            ) : (
              <button
                type="submit"
                className="px-12 py-2 bg-[#399AA1] text-white rounded-full hover:bg-[#007E85] cursor-pointer"
              >
                Kaydet
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
