// SingleAppointmentForm.jsx
import React, { useState, useEffect, useMemo } from "react";
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";
import AppointmentDatePicker from "./DatePicker";

// Required field indicator component
const RequiredIndicator = () => (
  <span className="text-red-500 ml-1">*</span>
);

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
  const [formErrors, setFormErrors] = useState({});

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
    
    // Clear error when field is filled
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.clientFirstName) errors.clientFirstName = "Ad alanı zorunludur";
    if (!formData.clientLastName) errors.clientLastName = "Soyad alanı zorunludur";
    if (!formData.gender) errors.gender = "Cinsiyet alanı zorunludur";
    if (!formData.phoneNumber) errors.phoneNumber = "Telefon alanı zorunludur";
    if (!formData.clinic) errors.clinic = "Klinik alanı zorunludur";
    if (!formData.doctor) errors.doctor = "Doktor alanı zorunludur";
    if (!formData.appointmentType) errors.appointmentType = "Randevu Tipi alanı zorunludur";
    if (!formData.datetime) errors.datetime = "Tarih ve saat seçilmelidir";
    
    // ServiceId is required only if there are available services for the selected appointment type
    if (filteredServices.length > 0 && !formData.serviceId) {
      errors.serviceId = "Randevu Hizmeti alanı zorunludur";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setAlertState({
        message: "Lütfen gerekli alanları doldurun.",
        severity: "error",
        open: true,
      });
      return;
    }

    try {
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
    
    // Clear error when field is filled
    if (formErrors[key]) {
      setFormErrors(prev => ({
        ...prev,
        [key]: null
      }));
    }
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
  const renderDropdown = (label, key, options, direction = "down", isRequired = false) => (
    <>
      <label className="text-gray-700 mb-2 block">
        {label}
        {isRequired && <RequiredIndicator />}
      </label>
      <div className="relative mb-4 dropdown-container">
        <div
          className={`px-4 py-2 border ${formErrors[key] ? 'border-red-500' : 'border-gray-300'} hover:border-[#399AA1] hover:border-[2px] rounded-lg cursor-pointer bg-white flex justify-between items-center`}
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
        {formErrors[key] && (
          <p className="text-red-500 text-xs mt-1">{formErrors[key]}</p>
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
          <label className="block text-gray-700 mb-1">
            Ad
            <RequiredIndicator />
          </label>
          <input
            type="text"
            name="clientFirstName"
            value={formData.clientFirstName}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border ${formErrors.clientFirstName ? 'border-red-500' : 'border-gray-300'} rounded`}
            required
          />
          {formErrors.clientFirstName && (
            <p className="text-red-500 text-xs mt-1">{formErrors.clientFirstName}</p>
          )}
        </div>
        {/* Soyisim */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">
            Soyad
            <RequiredIndicator />
          </label>
          <input
            type="text"
            name="clientLastName"
            value={formData.clientLastName}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border ${formErrors.clientLastName ? 'border-red-500' : 'border-gray-300'} rounded`}
            required
          />
          {formErrors.clientLastName && (
            <p className="text-red-500 text-xs mt-1">{formErrors.clientLastName}</p>
          )}
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
          {renderDropdown("Cinsiyet", "gender", genderOptions, "down", true)}
        </div>

        {/* Telefon */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">
            Telefon
            <RequiredIndicator />
          </label>
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border ${formErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'} rounded`}
            required
          />
          {formErrors.phoneNumber && (
            <p className="text-red-500 text-xs mt-1">{formErrors.phoneNumber}</p>
          )}
        </div>

        {/* Klinik */}
        <div className="mb-4">
          {renderDropdown("Klinik", "clinic", clinicOptions, "down", true)}
        </div>

        {/* Doktor */}
        <div className="mb-4">
          {renderDropdown("Doktor", "doctor", filteredDoctorOptions, "down", true)}
        </div>

        {/* Randevu Tipi */}
        <div className="mb-4">
          {renderDropdown("Randevu Tipi", "appointmentType", ["Ön Görüşme", "Muayene"], "down", true)}
        </div>

        {/* Randevu Hizmeti */}
        <div className="mb-4">
          <label className="text-gray-700 mb-2 block">
            Randevu Hizmeti
            {filteredServices.length > 0 && <RequiredIndicator />}
          </label>
          <div className="relative mb-4 dropdown-container">
            <div
              className={`px-4 py-2 border ${formErrors.serviceId ? 'border-red-500' : 'border-gray-300'} hover:border-[#399AA1] hover:border-[2px] rounded-lg cursor-pointer bg-white flex justify-between items-center ${
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
                      
                      // Clear error when field is filled
                      if (formErrors.serviceId) {
                        setFormErrors(prev => ({
                          ...prev,
                          serviceId: null
                        }));
                      }
                    }}
                  >
                    {service.serviceName}
                  </li>
                ))}
              </ul>
            )}
            {formErrors.serviceId && (
              <p className="text-red-500 text-xs mt-1">{formErrors.serviceId}</p>
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
            onDateChange={(date) => {
              setFormData((prev) => ({ ...prev, datetime: date }));
              
              // Clear error when field is filled
              if (formErrors.datetime) {
                setFormErrors(prev => ({
                  ...prev,
                  datetime: null
                }));
              }
            }}
            appointments={appointments}
            selectedClinic={formData.clinic}
            selectedDoctor={formData.doctor}
          />
          {formErrors.datetime && (
            <p className="text-red-500 text-xs mt-1">{formErrors.datetime}</p>
          )}
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
