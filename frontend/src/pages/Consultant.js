import React, { useState } from "react";
import ConsultantSearchContainer from "../components/ConsultantSearchContainer";
import ConsultantTable from "../components/ConsultantTable";
import AddAppointment from "../components/CreateAppointmentButton";

export default function ConsultantPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div className="w-screen bg-white p-8 overflow-hidden rounded-l-[40px] relative z-20">
      {/* Başlık */}
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-3xl font-bold mb-6">Manage Appointments</h1>
        <div className="flex flex-row justify-end gap-4">
          <ConsultantSearchContainer onSearchChange={handleSearchChange} />
          <AddAppointment />
        </div>
      </div>
      {/* İçerik */}
      <div>
        <ConsultantTable searchQuery={searchQuery} />
      </div>
    </div>
  );
}
