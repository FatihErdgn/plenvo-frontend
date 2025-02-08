import React, { useState, useEffect } from "react";
import ConsultantSearchContainer from "../components/SearchContainer";
import ConsultantTableWrapper from "../components/Consultant/ConsultantTable/ConsultantTableWrapper";
// import AddAppointment from "../components/Consultant/CreateAppointmentButton";
import AddAppointment from "../components/Consultant/CreateAppointment/AddAppointment";
// import appointmentData from "../appointmentData.json";
import DateFilter from "../components/DateFilter";
import {
  getAppointments,
  createAppointment,
} from "../services/appointmentService";
import { getUsers } from "../services/userService";

export default function ConsultantPage() {
  const [appointmentData, setAppointmentData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  // Bu tabloya özel dropdown verileri
  const clinicOptions = [
    ...new Set(
      userData.map(
        (item) => item?.clinicId?.clinicName || "Klinik Belirtilmedi"
      )
    ),
  ];
  const doctorOptions = [
    ...new Set(
      userData
        .filter((item) => item?.roleName === "doctor") // Sadece "doctor" olanları filtrele
        .map(
          (item) =>
            (item?.firstName + " " + item?.lastName).trim() ||
            "Klinik Belirtilmedi"
        )
    ),
  ];

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
            onAddAppointment={handleAddAppointment}
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
          fetchAppointments={fetchAppointments}
        />
      </div>
    </div>
  );
}
