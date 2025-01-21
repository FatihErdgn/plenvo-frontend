import React, { useState } from "react";
import ConsultantSearchContainer from "../components/SearchContainer";
import ConsultantTableWrapper from "../components/Consultant/ConsultantTable/ConsultantTableWrapper";
// import AddAppointment from "../components/Consultant/CreateAppointmentButton";
import AddAppointment from "../components/Consultant/CreateAppointment/AddAppointment";
import appointmentData from "../appointmentData.json";
import DateFilter from "../components/DateFilter";

export default function ConsultantPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  // Bu tabloya özel dropdown verileri
  const clinicOptions =
    appointmentData && Array.isArray(appointmentData)
      ? [...new Set(appointmentData.map((item) => item.clinic))]
      : [];
  const doctorOptions =
    appointmentData && Array.isArray(appointmentData)
      ? [...new Set(appointmentData.map((item) => item.doctor))]
      : [];
  const genderOptions = ["Erkek", "Kadın"];

  return (
    <div className="w-screen bg-[#f4f7fe] p-8 overflow-auto rounded-l-[40px] relative z-20">
      {/* Başlık */}
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-3xl font-bold mb-6">Randevuları Yönet</h1>
        <div className="flex flex-row justify-end gap-4 items-center">
          <ConsultantSearchContainer onSearchChange={handleSearchChange} />
          <DateFilter
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
          />
          <AddAppointment
            options={{
              clinicOptions,
              doctorOptions,
              genderOptions,
            }}
          />
        </div>
      </div>
      {/* İçerik */}
      <div>
        <ConsultantTableWrapper
          data={appointmentData}
          searchQuery={searchQuery}
          startDate={startDate} 
          endDate={endDate}
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
