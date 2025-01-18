// GroupAppointmentForm.jsx
import React, { useState } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";

export default function GroupAppointmentForm({
  onClose,
  options: { clinicOptions, doctorOptions, genderOptions },
}) {
  // Grup katılımcı bilgileri
  const [participants, setParticipants] = useState([
    {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      gender: "",
      age: "",
    },
  ]);

  // Grup için ortak alanlar
  const [groupData, setGroupData] = useState({
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

  // Yeni katılımcı ekle
  const addParticipant = () => {
    setParticipants((prev) => [
      ...prev,
      {
        firstName: "",
        lastName: "",
        phoneNumber: "",
        gender: "",
        age: "",
      },
    ]);
  };

  // Katılımcı çıkar
  const removeParticipant = (index) => {
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  };

  // Katılımcı input değişimi
  const handleParticipantChange = (index, e) => {
    const { name, value } = e.target;
    setParticipants((prev) => {
      const updated = [...prev];
      updated[index][name] = value;
      return updated;
    });
  };

  // Grup ortak alan değişimi
  const handleGroupDataChange = (e) => {
    const { name, value } = e.target;
    setGroupData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !participants.firstName ||
      !participants.lastName ||
      !participants.day ||
      !participants.month ||
      !participants.year ||
      !participants.gender ||
      !participants.phoneNumber ||
      !groupData.clinic ||
      !groupData.doctor ||
      !groupData.datetime
    ) {
      setAlertState({
        message: "Lütfen tüm alanları doldurun.",
        severity: "error",
        open: true,
      });
      return;
    }

    console.log("Form Data:", ...groupData, participants);
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
    setParticipants((prev) => ({
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
          {participants[key] || `${label} Seçin`}
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
        {/* Katılımcılar */}
        <h3 className="text-lg font-semibold mb-2">Katılımcılar</h3>

        {participants.map((p, index) => (
          <div key={index} className="mb-4 p-4 border rounded relative">
            {/* Sil butonu (ilk katılımcı hariç) */}
            {participants.length > 1 && (
              <button
                type="button"
                onClick={() => removeParticipant(index)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                <IoIosCloseCircleOutline className="w-5 h-5" />
              </button>
            )}
            <div className="mb-2">
              <label className="block text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={p.firstName}
                onChange={(e) => handleParticipantChange(index, e)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={p.lastName}
                onChange={(e) => handleParticipantChange(index, e)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={p.phoneNumber}
                onChange={(e) => handleParticipantChange(index, e)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div className="mb-2">
              {renderDropdown("Cinsiyet", "gender", genderOptions, "down")}
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 mb-1">Age</label>
              <input
                type="number"
                name="age"
                value={p.age}
                onChange={(e) => handleParticipantChange(index, e)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
          </div>
        ))}

        {/* Katılımcı Ekle */}
        <button
          type="button"
          onClick={addParticipant}
          className="mb-4 px-4 py-2 bg-[#399AA1] text-white rounded hover:bg-[#007E85]"
        >
          Katılımcı Ekle
        </button>

        {/* Ortak Alanlar (clinic, doctor, datetime) */}
        <div className="mb-4">
          {renderDropdown("Klinik", "clinic", clinicOptions, "down")}
        </div>
        <div className="mb-4">
          {renderDropdown("Doktor", "doctor", doctorOptions, "down")}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">
            Randevu Tarihi ve Saati
          </label>
          <input
            type="datetime-local"
            name="datetime"
            value={groupData.datetime}
            onChange={handleGroupDataChange}
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
