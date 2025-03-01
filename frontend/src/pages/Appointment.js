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
import { FiArrowRightCircle } from "react-icons/fi";

export default function ConsultantPage() {
  const [appointmentData, setAppointmentData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [servicesData, setServicesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

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
      // console.log("Randevular alındı:", response.data);
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
      setServicesData(response.data || []);
      // console.log("Hizmetler alındı:", servicesData);
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
      // console.log("📤 API'ye Gönderilen Veri:", appointmentData);
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

  // Doktorlar için detaylı liste (filtreleme için kullanılacak)
  const doctorList = userData.filter((item) => item?.roleName === "doctor");
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
    <div className="w-screen bg-[#f4f7fe] p-8 overflow-auto rounded-l-[2.5rem] relative z-20">
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
            onAddAppointment={handleAddAppointment}
            options={{
              clinicOptions,
              doctorOptions,
              doctorList,
              genderOptions,
            }}
            appointments={appointmentData}
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
          fetchAppointments={fetchAppointments}
          servicesData={servicesData}
        />
      </div>
      <div className="flex flex-row justify-end gap-4 mt-4">
        <button
          onClick={handleCalendarModalOpen}
          className="font-poppins flex flex-row bg-[#399AA1] text-white px-4 py-3 rounded-[0.625rem] hover:bg-[#007E85] shadow-md"
        >
          Randevu Takvimleri
          <FiArrowRightCircle className="w-6 h-6 ml-2" />
        </button>
      </div>
    </div>
  );
}
