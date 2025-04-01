import AddPersonnel from "../components/PersonnelManagement/CreatePersonnelButton";
import AddService from "../components/ServiceManagement/CreateServiceButton";
import SearchContainer from "../components/SearchContainer";
import { useEffect, useState } from "react";
import { getUsers, createUser } from "../services/userService";
import { getServices, createService } from "../services/serviceService";
import { FiArrowLeftCircle, FiArrowRightCircle } from "react-icons/fi";
import PersonnelTableWrapper from "../components/PersonnelManagement/PersonnelTableWrapper";
import ServiceManagementTableWrapper from "../components/ServiceManagement/ServiceManagementTableWrapper";
import DateFilter from "../components/DateFilter";

export default function PersonnelManagementPage() {
  const [userData, setUserData] = useState([]);
  const [servicesData, setServicesData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setUserData(response.data || []);
      // console.log("Personel alındı:", response.data);
    } catch (error) {
      console.error("Personelleri alırken hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await getServices();
      setServicesData(response.data || []);
      // console.log("Hizmetler alındı:", servicesData);
    } catch (error) {
      console.error("Hizmetleri alırken hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAddUser = async (userData) => {
    try {
      // console.log("📤 API'ye Gönderilen Veri:", userData);
      const newUser = await createUser(userData);
      setUserData((prevData) => [newUser.user, ...prevData]);
      await fetchUsers();
    } catch (error) {
      console.error("Personel eklenirken hata oluştu:", error);
    }
  };

  const handleAddService = async (serviceData) => {
    try {
      // console.log("📤 API'ye Gönderilen Veri:", serviceData);
      const newService = await createService(serviceData);
      setServicesData((prevData) => [newService, ...prevData]);
      await fetchServices();
    } catch (error) {
      console.error("Hizmet eklenirken hata oluştu:", error);
    }
  };

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

  const uniqueRoles = ["Admin", "Manager", "Consultant", "Doctor"];

  const uniqueClinics = [
    ...new Set(
      userData.map(
        (item) => item?.clinicId?.clinicName || "Klinik Belirtilmedi"
      )
    ),
  ];

  const uniqueProfessions = [
    ...new Set(
      userData.map((item) => item?.profession || "Meslek Belirtilmedi")
    ),
  ];

  const uniqueSpecialities = [
    ...new Set(
      userData.map((item) => item?.speciality || "Uzmanlık Belirtilmedi")
    ),
  ];

  const uniqueServiceNames = [
    ...new Set(servicesData.map((item) => item?.serviceName || "Hizmet Yok")),
  ];

  const uniqueProviders = [
    "Genel Hizmet",
    ...new Set(
      userData.map(
        (item) => item?.firstName + " " + item?.lastName || "Sağlayıcı Yok"
      )
    ),
  ];

  return (
    <div className="w-screen bg-[#f4f7fe] p-8 overflow-auto rounded-l-[2.5rem] relative z-20">
      {/* Başlık */}
      <div className="flex flex-col md:flex-row md:justify-between items-center mb-3">
        {isServiceModalOpen ? (
          <h1 className="text-3xl font-bold mb-3">Hizmet Yönetimi</h1>
        ) : (
          <h1 className="text-3xl font-bold mb-3">Personel Yönetimi</h1>
        )}
        <div className="flex flex-row justify-end gap-4 items-center">
          <SearchContainer onSearchChange={handleSearchChange} />
          <DateFilter
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
          />
          {isServiceModalOpen ? (
            <AddService
              onAddService={handleAddService}
              uniqueServiceNames={uniqueServiceNames}
              uniqueProviders={uniqueProviders}
            />
          ) : (
            <AddPersonnel
              onAddUser={handleAddUser}
              uniqueRoles={uniqueRoles}
              uniqueClinics={uniqueClinics}
              uniqueProfessions={uniqueProfessions}
              uniqueSpecialities={uniqueSpecialities}
              existingUsers={userData}
            />
          )}
        </div>
      </div>
      {/* İçerik */}
      {isServiceModalOpen ? (
        <>
          <ServiceManagementTableWrapper
            searchQuery={searchQuery}
            data={servicesData}
            startDate={startDate}
            endDate={endDate}
            loading={loading}
            fetchServices={fetchServices}
          />
          <div className="flex flex-row justify-start gap-4 mt-4">
            <button
              onClick={handleServiceModalOpen}
              className="font-poppins flex flex-row text-[#399AA1] font-semibold px-4 py-3 rounded-[0.625rem] hover:text-[#007E85]"
            >
              Personel Yönetimine Dön
              <FiArrowLeftCircle className="w-6 h-6 ml-2" />
            </button>
          </div>
        </>
      ) : (
        <>
          <PersonnelTableWrapper
            data={userData}
            searchQuery={searchQuery}
            startDate={startDate}
            endDate={endDate}
            loading={loading}
            fetchUsers={fetchUsers}
          />
          <div className="flex flex-row justify-end gap-4 mt-4">
            <button
              onClick={handleServiceModalOpen}
              className="font-poppins flex flex-row bg-[#399AA1] text-white px-4 py-3 rounded-[0.625rem] hover:bg-[#007E85] shadow-md"
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
