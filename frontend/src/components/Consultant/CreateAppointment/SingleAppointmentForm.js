// SingleAppointmentForm.jsx
import React, { useState } from "react";
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";

export default function SingleAppointmentForm({
  onClose,
  options: { clinicOptions, doctorOptions, genderOptions },
}) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    day: "",
    month: "",
    year: "",
    gender: "",
    phoneNumber: "",
    clinic: "",
    doctor: "",
    datetime: "",
  });
  const [dropdownOpen, setDropdownOpen] = useState({
    clinic: false,
    doctor: false,
    gender: false,
  });
  const [alertState, setAlertState] = useState({
    message: "",
    severity: "",
    open: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.day ||
      !formData.month ||
      !formData.year ||
      !formData.gender ||
      !formData.phoneNumber ||
      !formData.clinic ||
      !formData.doctor ||
      !formData.datetime
    ) {
      setAlertState({
        message: "Lütfen tüm alanları doldurun.",
        severity: "error",
        open: true,
      });
      return;
    }

    console.log("Form Data:", formData);
    setAlertState({
      message: "Başarılı bir şekilde eklendi.",
      severity: "success",
      open: true,
    });
  };

  // Dropdown aç/kapa
  const toggleDropdown = (key) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Dropdown seçim
  const handleSelect = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
    setDropdownOpen((prev) => ({
      ...prev,
      [key]: false,
    }));
  };

  // Ortak dropdown (status, clinic, doctor)
  const renderDropdown = (label, key, options, direction = "down") => (
    <>
      <label className="text-gray-700 mb-2 block">{label}</label>
      <div className="relative mb-4 dropdown-container">
        <div
          className="px-4 py-2 border border-gray-300 hover:border-[#399AA1] hover:border-[2px] rounded-lg cursor-pointer bg-white flex justify-between items-center"
          onClick={() => toggleDropdown(key)}
        >
          {formData[key] || `${label} Seçin`}
          <span className="ml-2 transform transition-transform duration-200 opacity-50">
            {dropdownOpen[key] ? "▲" : "▼"}
          </span>
        </div>
        {dropdownOpen[key] && (
          <ul
            className={`absolute left-0 right-0 bg-white border border-gray-300 rounded-lg max-h-[120px] overflow-auto z-10 ${
              direction === "up" ? "bottom-full mb-1" : "top-full mt-1"
            }`}
          >
            {options.map((option, idx) => (
              <li
                key={idx}
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
    <>
      <Collapse in={alertState.open}>
        <Alert
          severity={alertState.severity}
          onClose={() => setAlertState({ ...alertState, open: false })}
        >
          {alertState.message}
        </Alert>
      </Collapse>
      <form onSubmit={handleSubmit}>
        {/* İsim */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Ad</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        {/* Soyisim */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Soyad</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        {/* Doğum Tarihi */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Doğum Tarihi</label>
          <div className="flex gap-2">
            <input
              type="text"
              name="day"
              value={formData.day}
              onChange={handleInputChange}
              placeholder="Gün"
              className="w-1/3 px-3 py-2 border rounded"
              required
            />
            <input
              type="text"
              name="month"
              value={formData.month}
              onChange={handleInputChange}
              placeholder="Ay"
              className="w-1/3 px-3 py-2 border rounded"
              required
            />
            <input
              type="text"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              placeholder="Yıl"
              className="w-1/3 px-3 py-2 border rounded"
              required
            />
          </div>
        </div>

        {/* Cinsiyet */}
        <div className="mb-4">
          {renderDropdown("Cinsiyet", "gender", genderOptions, "down")}
        </div>

        {/* Telefon */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Telefon</label>
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        {/* Klinik */}
        <div className="mb-4">
          {renderDropdown("Klinik", "clinic", clinicOptions, "down")}
        </div>

        {/* Doktor */}
        <div className="mb-4">
          {renderDropdown("Doktor", "doctor", doctorOptions, "down")}
        </div>

        {/* Randevu Tarihi ve Saati */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">
            Randevu Tarihi ve Saati
          </label>
          <input
            type="datetime-local"
            name="datetime"
            value={formData.datetime}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        {/* Butonlar */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2 hover:bg-gray-400"
          >
            İptal
          </button>
          <button
            type="submit"
            className="bg-[#399AA1] text-white px-4 py-2 rounded hover:bg-[#007E85]"
          >
            Onayla
          </button>
        </div>
      </form>
    </>
  );
}
