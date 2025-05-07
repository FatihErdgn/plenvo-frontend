// SingleAppointmentForm.jsx
import React, { useState, useEffect, useMemo } from "react";
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";
import AppointmentDatePicker from "./DatePicker";

export default function SingleAppointmentForm({
  onClose,
  options: { clinicOptions, doctorOptions, doctorList, genderOptions },
  prefilledData,
  onAddAppointment,
  appointments,
  servicesData,
}) {
  const initialState = prefilledData
    ? {
        clientFirstName: prefilledData.clientFirstName || "",
        clientLastName: prefilledData.clientLastName || "",
        age: prefilledData.age || "",
        gender: prefilledData.gender || "",
        phoneNumber: prefilledData.phoneNumber || "",
        clinic: prefilledData.clinic || "",
        doctor: prefilledData.doctor || "",
        appointmentType: prefilledData.appointmentType || "",
        serviceId: prefilledData.serviceId || "",
        // Eğer eski tarihi sıfırlamak istiyorsanız:
        datetime: "",
      }
    : {
        clientFirstName: "",
        clientLastName: "",
        age: "",
        gender: "",
        phoneNumber: "",
        clinic: "",
        doctor: "",
        appointmentType: "",
        serviceId: "",
        datetime: "",
      };

  const [formData, setFormData] = useState(initialState);

  const [dropdownOpen, setDropdownOpen] = useState({
    clinic: false,
    doctor: false,
    gender: false,
    appointmentType: false,
    serviceId: false,
  });
  const [alertState, setAlertState] = useState({
    message: "",
    severity: "",
    open: false,
  });

  // Reset service when appointment type changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      serviceId: ""
    }));
  }, [formData.appointmentType, formData.doctor]);

  // Filter services based on selected doctor and appointment type
  const filteredServices = useMemo(() => {
    if (!servicesData || !formData.doctor || !formData.appointmentType) return [];
    
    return servicesData.filter(service => 
      service.provider === formData.doctor &&
      service.serviceType === formData.appointmentType &&
      service.status === "Aktif"
    );
  }, [servicesData, formData.doctor, formData.appointmentType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.clientFirstName ||
      !formData.clientLastName ||
      // !formData.age ||
      !formData.gender ||
      !formData.phoneNumber ||
      !formData.clinic ||
      !formData.doctor ||
      !formData.datetime ||
      !formData.appointmentType
    ) {
      setAlertState({
        message: "Lütfen tüm alanları doldurun.",
        severity: "error",
        open: true,
      });
      return;
    }

    try {
      if (!formData.datetime) {
        setAlertState({
          message: "Lütfen tarih ve saat seçiniz.",
          severity: "error",
          open: true,
        });
        return;
      }

      // Tarih kontrolü
      if (formData.datetime < new Date()) {
        setAlertState({
          message: "Geçmiş tarihli randevu oluşturamazsınız.",
          severity: "error",
          open: true,
        });
        return;
      }

      const appointmentData = {
        ...formData,
        type: "single",
        // Tarihi ISO formatına çevir
        datetime: formData.datetime.toISOString(),
      };

      onAddAppointment(appointmentData);
      onClose();
    } catch (error) {
      console.error("Randevu oluşturulurken hata oluştu:", error);
      setAlertState({
        message: "Randevu oluşturulurken bir hata oluştu.",
        severity: "error",
        open: true,
      });
    }
  };

  // Dropdown aç/kapa
  const toggleDropdown = (key) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Dropdown seçim
  const handleSelect = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
    setDropdownOpen((prev) => ({
      ...prev,
      [key]: false,
    }));
  };

  // Doktor dropdown seçeneklerini, seçili kliniğe göre filtreleyelim:
  const filteredDoctorOptions = doctorList
    .filter((doctor) => {
      // Eğer bir klinik seçildiyse, sadece o kliniğe ait doktorları göster.
      // Klinik seçilmediyse tüm doktorlar gelsin.
      return formData.clinic
        ? doctor?.clinicId?.clinicName === formData.clinic
        : true;
    })
    .map((doctor) => (doctor?.firstName + " " + doctor?.lastName).trim());

  // Ortak dropdown (status, clinic, doctor)
  const renderDropdown = (label, key, options, direction = "down") => (
    <>
      <label className="text-gray-700 mb-2 block">{label}</label>
      <div className="relative mb-4 dropdown-container">
        <div
          className="px-4 py-2 border border-gray-300 hover:border-[#399AA1] hover:border-[2px] rounded-lg cursor-pointer bg-white flex justify-between items-center"
          onClick={() => toggleDropdown(key)}
        >
          {formData[key] || `${label} Seçin`}
          <span className="ml-2 transform transition-transform duration-200 opacity-50">
            {dropdownOpen[key] ? "▲" : "▼"}
          </span>
        </div>
        {dropdownOpen[key] && (
          <ul
            className={`absolute left-0 right-0 bg-white border border-gray-300 rounded-lg max-h-[7.5rem] overflow-auto z-10 ${
              direction === "up" ? "bottom-full mb-1" : "top-full mt-1"
            }`}
          >
            {options.map((option, idx) => (
              <li
                key={idx}
                className="px-4 py-2 hover:bg-[#007E85] hover:text-white cursor-pointer"
                onClick={() => handleSelect(key, option)}
              >
                {option}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );

  return (
    <>
      <Collapse in={alertState.open}>
        <Alert
          severity={alertState.severity}
          onClose={() => setAlertState({ ...alertState, open: false })}
        >
          {alertState.message}
        </Alert>
      </Collapse>
      <form onSubmit={handleSubmit}>
        {/* İsim */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Ad</label>
          <input
            type="text"
            name="clientFirstName"
            value={formData.clientFirstName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        {/* Soyisim */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Soyad</label>
          <input
            type="text"
            name="clientLastName"
            value={formData.clientLastName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        {/* Doğum Tarihi */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Yaş</label>
          <div className="flex gap-2">
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              placeholder=""
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>

        {/* Cinsiyet */}
        <div className="mb-4">
          {renderDropdown("Cinsiyet", "gender", genderOptions, "down")}
        </div>

        {/* Telefon */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Telefon</label>
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        {/* Klinik */}
        <div className="mb-4">
          {renderDropdown("Klinik", "clinic", clinicOptions, "down")}
        </div>

        {/* Doktor */}
        <div className="mb-4">
          {renderDropdown("Doktor", "doctor", filteredDoctorOptions, "down")}
        </div>

        {/* Randevu Tipi */}
        <div className="mb-4">
          {renderDropdown("Randevu Tipi", "appointmentType", ["Ön Görüşme", "Muayene"], "down")}
        </div>

        {/* Randevu Hizmeti */}
        <div className="mb-4">
          <label className="text-gray-700 mb-2 block">Randevu Hizmeti</label>
          <div className="relative mb-4 dropdown-container">
            <div
              className={`px-4 py-2 border border-gray-300 hover:border-[#399AA1] hover:border-[2px] rounded-lg cursor-pointer bg-white flex justify-between items-center ${
                !formData.appointmentType || !formData.doctor || filteredServices.length === 0 ? 'bg-gray-100' : ''
              }`}
              onClick={() => {
                if (formData.appointmentType && formData.doctor && filteredServices.length > 0) {
                  toggleDropdown('serviceId');
                }
              }}
            >
              {formData.serviceId ? 
                filteredServices.find(s => s._id === formData.serviceId)?.serviceName || "Hizmet Seçin" 
                : "Hizmet Seçin"}
              <span className="ml-2 transform transition-transform duration-200 opacity-50">
                {dropdownOpen.serviceId ? "▲" : "▼"}
              </span>
            </div>
            {dropdownOpen.serviceId && (
              <ul className="absolute left-0 right-0 bg-white border border-gray-300 rounded-lg max-h-[7.5rem] overflow-auto z-10 top-full mt-1">
                {filteredServices.map((service, idx) => (
                  <li
                    key={idx}
                    className="px-4 py-2 hover:bg-[#007E85] hover:text-white cursor-pointer"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        serviceId: service._id
                      }));
                      setDropdownOpen(prev => ({
                        ...prev,
                        serviceId: false
                      }));
                    }}
                  >
                    {service.serviceName}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {!formData.appointmentType && (
            <p className="text-amber-500 text-xs mt-1">
              Önce Randevu Tipi seçmelisiniz
            </p>
          )}
          {formData.appointmentType && !formData.doctor && (
            <p className="text-amber-500 text-xs mt-1">
              Önce Doktor seçmelisiniz
            </p>
          )}
          {formData.appointmentType && formData.doctor && filteredServices.length === 0 && (
            <p className="text-red-500 text-xs mt-1">
              {`"${formData.appointmentType}" tipi için tanımlı hizmet bulunamadı`}
            </p>
          )}
        </div>

        {/* Randevu Tarihi ve Saati */}
        <div className="mb-4">
          <AppointmentDatePicker
            selectedDate={formData.datetime}
            onDateChange={(date) =>
              setFormData((prev) => ({ ...prev, datetime: date }))
            }
            appointments={appointments}
            selectedClinic={formData.clinic}
            selectedDoctor={formData.doctor}
          />
        </div>

        {/* Butonlar */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2 hover:bg-gray-400"
          >
            İptal
          </button>
          <button
            type="submit"
            className="bg-[#399AA1] text-white px-4 py-2 rounded hover:bg-[#007E85]"
          >
            Onayla
          </button>
        </div>
      </form>
    </>
  );
}
