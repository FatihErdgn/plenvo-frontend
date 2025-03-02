// components/DoctorFilter.js

import React, { useState, useEffect, useRef } from "react";

export default function DoctorFilter({ doctors, selectedDoctor, onSelectDoctor }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Dış tıklamalarda dropdown kapansın
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSelect = (doctorId) => {
    onSelectDoctor(doctorId);
    setDropdownOpen(false);
  };

  // Seçili doktor varsa adını göster, yoksa placeholder
  let displayText = "Doktor Seçin";
  if (selectedDoctor) {
    const selected = doctors.find((d) => d._id === selectedDoctor);
    if (selected) {
      displayText = `${selected.firstName} ${selected.lastName}`;
    }
  }

  return (
    <div className="relative mb-3 dropdown-container" ref={dropdownRef}>
      <label className="text-gray-700 mb-2 block">Doktor Seç</label>
      <div
        className="px-4 py-2 border border-gray-300 rounded-lg bg-white flex justify-between items-center cursor-pointer hover:border-[#007E85]"
        onClick={toggleDropdown}
      >
        {displayText}
        <span className="ml-2 transform transition-transform duration-200 opacity-50">
          {dropdownOpen ? "▲" : "▼"}
        </span>
      </div>
      {dropdownOpen && (
        <ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg max-h-40 overflow-auto z-10">
          <li
            className="px-4 py-2 hover:bg-[#007E85] hover:text-white cursor-pointer"
            onClick={() => handleSelect("")}
          >
            Tümü
          </li>
          {doctors.map((doctor) => (
            <li
              key={doctor._id}
              className="px-4 py-2 hover:bg-[#007E85] hover:text-white cursor-pointer"
              onClick={() => handleSelect(doctor._id)}
            >
              {doctor.firstName} {doctor.lastName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
