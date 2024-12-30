import React, { useState, useEffect } from "react";

const ClinicDoctorDropdown = () => {
  const [clinics, setClinics] = useState([]); // Klinik verileri
  const [doctors, setDoctors] = useState([]); // Doktor verileri
  const [selectedClinic, setSelectedClinic] = useState(""); // Seçilen klinik
  const [selectedDoctor, setSelectedDoctor] = useState(""); // Seçilen doktor

  // Klinik ve doktor verilerini backend'den çek
  useEffect(() => {
    // Klinik verilerini çek
    fetch("/api/clinics") // Backend endpoint
      .then((response) => response.json())
      .then((data) => setClinics(data))
      .catch((error) => console.error("Klinik verisi alınırken hata:", error));
  }, []);

  useEffect(() => {
    if (selectedClinic) {
      // Seçilen kliniğe göre doktorları filtrele
      fetch(`/api/doctors?clinic=${selectedClinic}`) // Backend endpoint
        .then((response) => response.json())
        .then((data) => setDoctors(data))
        .catch((error) =>
          console.error("Doktor verisi alınırken hata:", error)
        );
    } else {
      setDoctors([]);
    }
  }, [selectedClinic]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-gray-700 mb-2" htmlFor="clinic">
          Klinik Seçin:
        </label>
        <select
          id="clinic"
          name="clinic"
          value={selectedClinic}
          onChange={(e) => setSelectedClinic(e.target.value)}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="">Klinik Seçin</option>
          {clinics.map((clinic) => (
            <option key={clinic.id} value={clinic.id}>
              {clinic.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-gray-700 mb-2" htmlFor="doctor">
          Doktor Seçin:
        </label>
        <select
          id="doctor"
          name="doctor"
          value={selectedDoctor}
          onChange={(e) => setSelectedDoctor(e.target.value)}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
          disabled={!selectedClinic} // Klinik seçilmediği sürece doktor dropdown kapalı
        >
          <option value="">Doktor Seçin</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ClinicDoctorDropdown;
