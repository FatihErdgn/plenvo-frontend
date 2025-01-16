import React, { useState } from "react";
import ConsultantSearchContainer from "../components/SearchContainer";
import ConsultantTableWrapper from "../components/Consultant/ConsultantTableWrapper";
import AddAppointment from "../components/Consultant/CreateAppointmentButton";
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
  }

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  }

  return (
    <div className="w-screen bg-[#f4f7fe] p-8 overflow-hidden rounded-l-[40px] relative z-20">
      {/* Başlık */}
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-3xl font-bold mb-6">Randevuları Yönet</h1>
        <div className="flex flex-row justify-end gap-4 items-center">
          <ConsultantSearchContainer onSearchChange={handleSearchChange} />
          <DateFilter onStartDateChange={handleStartDateChange} onEndDateChange={handleEndDateChange} />
          <AddAppointment />
        </div>
      </div>
      {/* İçerik */}
      <div>
        <ConsultantTableWrapper
          data={appointmentData}
          searchQuery={searchQuery}
          startDate={startDate}
          endDate={endDate}
        />
      </div>
    </div>
  );
}
