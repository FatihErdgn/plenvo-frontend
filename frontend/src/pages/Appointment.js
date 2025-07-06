import React, { useState, useEffect } from "react";
import ConsultantSearchContainer from "../components/SearchContainer";
import ConsultantTableWrapper from "../components/Consultant/ConsultantTable/ConsultantTableWrapper";
import AddAppointment from "../components/Consultant/CreateAppointment/AddAppointment";
import DateFilter from "../components/DateFilter";
import {
  getAppointments,
  createAppointment,
} from "../services/appointmentService";
import { getUsers } from "../services/userService";
import { getServices } from "../services/serviceService";
import { FiArrowRightCircle, FiArrowLeftCircle } from "react-icons/fi";
import CalendarSchedulePage from "../components/Consultant/CalendarAppointments/CalendarAppointment";

export default function ConsultantPage() {
  const [appointmentData, setAppointmentData] = useState([]);
  const [appointmentDateData, setAppointmentDateData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [servicesData, setServicesData] = useState([]);
  const [calendarServicesData, setCalendarServicesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setUserData(response.data || []);
    } catch (error) {
      console.error("Personelleri alırken hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await getAppointments();
      setAppointmentData(response.data || []);
      const filteredAppointments = (response.data || []).filter(
        (appt) => appt.status !== "İptal Edildi"
      );
      setAppointmentDateData(filteredAppointments);
    } catch (error) {
      console.error("Randevuları alırken hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await getServices();
      const data = response.data || [];
      setServicesData(data);
      // calendarServicesData: serviceName içinde "Grup" geçenleri filtrele
      // const calendarData = data.filter((svc) =>
      //   svc.serviceName.toLowerCase().includes("grup") && svc.provider.toLowerCase() === "genel hizmet"
      // );
      // setCalendarServicesData(calendarData);
      setCalendarServicesData(data);
    } catch (error) {
      console.error("Hizmetleri alırken hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAddAppointment = async (appointmentData) => {
    try {
      const newAppointment = await createAppointment(appointmentData);
      setAppointmentData((prevData) => [
        newAppointment.appointment,
        ...prevData,
      ]);
      await fetchAppointments();
    } catch (error) {
      console.error("Randevu eklerken hata oluştu:", error);
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

  const handleCalendarModalOpen = () => {
    setIsCalendarModalOpen((prev) => !prev);
  };

  // Klinik seçenekleri (sadece klinik isimleri)
  const clinicOptions = [
    ...new Set(
      userData.map(
        (item) => item?.clinicId?.clinicName || "Klinik Belirtilmedi"
      )
    ),
  ];
  const appointmentTypeOptions = ["Ön Görüşme", "Muayene"];

  // Doktorlar için detaylı liste (filtreleme için kullanılacak)
  const doctorList = userData.filter(
    (item) => item?.roleName === "doctor" || item?.roleName === "admin"
  );
  const doctorOptions = [
    ...new Set(
      doctorList.map(
        (item) =>
          (item?.firstName + " " + item?.lastName).trim() ||
          "Doktor Bilgisi Yok"
      )
    ),
  ];

  const genderOptions = ["Erkek", "Kadın"];

  return (
    <div className={`w-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 ${isCalendarModalOpen ? 'p-2 md:p-4' : 'p-4 md:p-8'} overflow-hidden rounded-l-[2.5rem] relative z-20 h-screen`}>
      {/* Başlık ve Üst Alan - Sadece normal modda göster */}
      {!isCalendarModalOpen && (
        <div className="flex flex-col md:flex-row md:justify-between items-center mb-3">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">Randevu Yönetimi</h1>
          <div className="flex flex-wrap justify-center md:justify-end gap-2 md:gap-4 items-center w-full md:w-auto">
            <ConsultantSearchContainer onSearchChange={handleSearchChange} />
            <DateFilter
              onStartDateChange={handleStartDateChange}
              onEndDateChange={handleEndDateChange}
            />
            <AddAppointment
              onAddAppointment={handleAddAppointment}
              options={{
                clinicOptions,
                doctorOptions,
                doctorList,
                genderOptions,
                appointmentTypeOptions,
              }}
              appointments={appointmentDateData}
              servicesData={servicesData}
            />
          </div>
        </div>
      )}

      {/* İçerik */}
      {!isCalendarModalOpen ? (
        <div>
          <div className="flex-1 overflow-hidden">
            <ConsultantTableWrapper
              data={appointmentData}
              searchQuery={searchQuery}
              startDate={startDate}
              endDate={endDate}
              options={{
                clinicOptions,
                doctorOptions,
                genderOptions,
                appointmentTypeOptions,
              }}
              fetchAppointments={fetchAppointments}
              servicesData={servicesData}
            />
          </div>
          {/* Alt Buton */}
          <div className="flex flex-row justify-end gap-4 mt-4">
            <button
              onClick={handleCalendarModalOpen}
              className="font-poppins flex flex-row bg-[#399AA1] text-white px-4 py-3 rounded-[0.625rem] hover:bg-[#007E85] shadow-md"
            >
              <span className="md:inline hidden">Randevu Takvimleri</span>
              <span className="md:hidden inline">Takvim</span>
              <FiArrowRightCircle className="w-6 h-6 ml-2" />
            </button>
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-hidden">
            <CalendarSchedulePage servicesData={calendarServicesData} />
          </div>
          <div className="flex flex-row justify-start gap-4 mt-2">
            <button
              onClick={handleCalendarModalOpen}
              className="font-poppins flex flex-row text-[#399AA1] font-semibold px-4 py-3 rounded-[0.625rem] hover:text-[#007E85]"
            >
              <span className="md:inline hidden">Tablo Görünümüne Geç</span>
              <span className="md:hidden inline">Geri Dön</span>
              <FiArrowLeftCircle className="w-6 h-6 ml-2" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
