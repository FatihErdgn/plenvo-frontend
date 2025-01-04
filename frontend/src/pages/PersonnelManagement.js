import PersonnelTable from "../components/PersonnelManagement/PersonnelTable";
import AddPersonnel from "../components/PersonnelManagement/CreatePersonnelButton";
import SearchContainer from "../components/SearchContainer";
import { useState } from "react";

export default function PersonnelManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div className="w-screen bg-white p-8 overflow-hidden rounded-l-[40px] relative z-20">
      {/* Başlık */}
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-3xl font-bold mb-6">Manage Personnel</h1>
        <div className="flex flex-row justify-end gap-4">
          <SearchContainer onSearchChange={handleSearchChange} />
          <AddPersonnel />
        </div>
      </div>
      {/* İçerik */}
      <div>
        <PersonnelTable searchQuery={searchQuery} />
      </div>
    </div>
  );
}
