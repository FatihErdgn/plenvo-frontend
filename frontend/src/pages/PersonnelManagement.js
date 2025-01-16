import AddPersonnel from "../components/PersonnelManagement/CreatePersonnelButton";
import AddService from "../components/ServiceManagement/CreateServiceButton";
import SearchContainer from "../components/SearchContainer";
import { useState } from "react";
import personnelData from "../personnelData.json";
import servicesData from "../servicesData.json";
import { FiArrowLeftCircle, FiArrowRightCircle } from "react-icons/fi";
import PersonnelTableWrapper from "../components/PersonnelManagement/PersonnelTableWrapper";
import ServiceManagementTableWrapper from "../components/ServiceManagement/ServiceManagementTableWrapper";
import DateFilter from "../components/DateFilter";

export default function PersonnelManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value); 
  };

  const handleServiceModalOpen = () => {
    if (isServiceModalOpen) {
      setIsServiceModalOpen(false);
      return;
    } else {
      setIsServiceModalOpen(true);
    }
  };

  return (
    <div className="w-screen bg-[#f4f7fe] p-8 overflow-hidden rounded-l-[40px] relative z-20">
      {/* Başlık */}
      <div className="flex flex-row justify-between items-center">
        {isServiceModalOpen ? (
          <h1 className="text-3xl font-bold mb-6">Hizmet Yönetimi</h1>
        ) : (
          <h1 className="text-3xl font-bold mb-6">Personel Yönetimi</h1>
        )}
        <div className="flex flex-row justify-end gap-4 items-center">
          <SearchContainer onSearchChange={handleSearchChange} />
          <DateFilter onStartDateChange={handleStartDateChange} onEndDateChange={handleEndDateChange} />
          {isServiceModalOpen ? <AddService /> : <AddPersonnel />}
        </div>
      </div>
      {/* İçerik */}
      {isServiceModalOpen ? (
        <>
          {/* <ServiceManagementTable
            searchQuery={searchQuery}
            data={servicesData}
          /> */}
          <ServiceManagementTableWrapper
            searchQuery={searchQuery}
            data={servicesData}
            startDate={startDate}
            endDate={endDate}
          />
          <div className="flex flex-row justify-start gap-4 mt-4">
            <button
              onClick={handleServiceModalOpen}
              className="font-poppins flex flex-row text-[#399AA1] font-semibold px-4 py-3 rounded-[10px] hover:text-[#007E85]"
            >
              Personel Yönetimine Dön
              <FiArrowLeftCircle className="w-6 h-6 ml-2" />
            </button>
          </div>
        </>
      ) : (
        <>
          {/* <PersonnelTable searchQuery={searchQuery} data={personnelData} /> */}
          <PersonnelTableWrapper
            data={personnelData}
            searchQuery={searchQuery}
            startDate={startDate}
            endDate={endDate}
          />
          <div className="flex flex-row justify-end gap-4 mt-4">
            <button
              onClick={handleServiceModalOpen}
              className="font-poppins flex flex-row bg-[#399AA1] text-white px-4 py-3 rounded-[10px] hover:bg-[#007E85] shadow-md"
            >
              Hizmetleri Yönet
              <FiArrowRightCircle className="w-6 h-6 ml-2" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
