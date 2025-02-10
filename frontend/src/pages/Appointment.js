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

export default function ConsultantPage() {
  const [appointmentData, setAppointmentData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [servicesData, setServicesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
      console.log("Randevular alındı:", response.data);
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
      console.log("Hizmetler alındı:", response.data);
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
      console.log("📤 API'ye Gönderilen Veri:", appointmentData);
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

  // Klinik seçenekleri (sadece klinik isimleri)
  const clinicOptions = [
    ...new Set(
      userData.map(
        (item) => item?.clinicId?.clinicName || "Klinik Belirtilmedi"
      )
    ),
  ];

  // Doktorlar için detaylı liste (filtreleme için kullanılacak)
  const doctorList = userData.filter(
    (item) => item?.roleName === "doctor"
  );
  // İsteğe bağlı: tüm doktor isimlerini de içeren basit liste oluşturabilirsin.
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
    <div className="w-screen bg-[#f4f7fe] overflow-auto rounded-l-[40px] relative z-20">
      {/* İçeriği ortalamak ve genişliği sınırlamak için container */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Başlık */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 md:mb-6">
            Randevuları Yönet
          </h1>
          <div className="flex flex-col md:flex-row justify-end gap-4 items-center w-full md:w-auto">
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
      </div>
    </div>
  );
}
