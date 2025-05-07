import React, { useState, useEffect, useMemo } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";
import AppointmentDatePicker from "./DatePicker";

export default function GroupAppointmentForm({
  appointments,
  onClose,
  options: { clinicOptions, doctorOptions, doctorList, genderOptions },
  prefilledData,
  onAddAppointment,
  servicesData,
}) {
  // Katılımcılar
  const [participants, setParticipants] = useState(
    prefilledData?.participants
      ? prefilledData.participants
      : [
          {
            clientFirstName: "",
            clientLastName: "",
            phoneNumber: "",
            gender: "",
            age: "",
          },
        ]
  );

  // Grup seviyesindeki veriler
  const [groupData, setGroupData] = useState({
    clinic: prefilledData?.clinic || "",
    doctor: prefilledData?.doctor || "",
    appointmentType: prefilledData?.appointmentType || "",
    serviceId: prefilledData?.serviceId || "",
    datetime: "", // Tarihi boş bırakmak istiyorsanız
  });

  const [dropdownOpen, setDropdownOpen] = useState({
    // Grup için dropdown
    clinic: false,
    doctor: false,
    appointmentType: false,
    serviceId: false,
    // Katılımcı gender dropdown'ları için index bazlı tutmak gerekebilir:
    // Örn: { clinic: false, doctor: false, gender0: false, gender1: false, ... }
  });

  const [alertState, setAlertState] = useState({
    message: "",
    severity: "",
    open: false,
  });

  // Reset service when appointment type or doctor changes
  useEffect(() => {
    setGroupData(prev => ({
      ...prev,
      serviceId: ""
    }));
  }, [groupData.appointmentType, groupData.doctor]);

  // Filter services based on selected doctor and appointment type
  const filteredServices = useMemo(() => {
    if (!servicesData || !groupData.doctor || !groupData.appointmentType) return [];
    
    return servicesData.filter(service => 
      service.provider === groupData.doctor &&
      service.serviceType === groupData.appointmentType &&
      service.status === "Aktif"
    );
  }, [servicesData, groupData.doctor, groupData.appointmentType]);

  // Yeni katılımcı ekle
  const addParticipant = () => {
    setParticipants((prev) => [
      ...prev,
      {
        clientFirstName: "",
        clientLastName: "",
        phoneNumber: "",
        gender: "",
        age: "",
      },
    ]);
  };

  // Katılımcı çıkar
  const removeParticipant = (index) => {
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  };

  // Katılımcı input değişimi
  const handleParticipantChange = (index, e) => {
    const { name, value } = e.target;
    setParticipants((prev) => {
      const updated = [...prev];
      updated[index][name] = value;
      return updated;
    });
  };

  // Grup ortak alan değişimi
  const handleGroupDataChange = (e) => {
    const { name, value } = e.target;
    setGroupData((prev) => ({ ...prev, [name]: value }));
  };

  // Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    // Basit kontrol (örnek)
    if (
      participants.some(
        (p) => !p.clientFirstName || !p.clientLastName || !p.gender
      ) ||
      !groupData.clinic ||
      !groupData.doctor ||
      !groupData.datetime ||
      !groupData.appointmentType
    ) {
      setAlertState({
        message: "Lütfen tüm alanları doldurun.",
        severity: "error",
        open: true,
      });
      return;
    }

    try {
      if (!groupData.datetime) {
        setAlertState({
          message: "Lütfen tarih ve saat seçiniz.",
          severity: "error",
          open: true,
        });
        return;
      }

      if (participants.length < 2) {
        setAlertState({
          message:
            "Grup randevusu oluşturabilmek için en az 2 katılımcı ekleyin.",
          severity: "error",
          open: true,
        });
        return;
      }

      if (participants.length > 10) {
        setAlertState({
          message: "Bir grup randevusunda en fazla 10 katılımcı olabilir.",
          severity: "error",
          open: true,
        });
        return;
      }

      if (groupData.datetime < new Date()) {
        setAlertState({
          message: "Geçmiş bir tarih seçemezsiniz.",
          severity: "error",
          open: true,
        });
        return;
      }

      // Tüm veri
      const finalData = {
        ...groupData,
        participants: participants,
        type: "group",
        datetime: new Date(groupData.datetime).toISOString(),
      };

      onAddAppointment(finalData);
      onClose();
    } catch (error) {
      console.error("Grup randevu oluşturulurken hata oluştu:", error);
      setAlertState({
        message: "Grup randevu oluşturulurken bir hata oluştu.",
        severity: "error",
        open: true,
      });
    }
  };

  // Ortak dropdown aç/kapa
  const toggleDropdown = (dropdownKey) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [dropdownKey]: !prev[dropdownKey],
    }));
  };

  // Doktor dropdown seçeneklerini, seçili kliniğe göre filtreleyelim:
  const filteredDoctorOptions = doctorList
    .filter((doctor) => {
      // Eğer bir klinik seçildiyse, sadece o kliniğe ait doktorları göster.
      // Klinik seçilmediyse tüm doktorlar gelsin.
      return groupData.clinic
        ? doctor?.clinicId?.clinicName === groupData.clinic
        : true;
    })
    .map((doctor) => (doctor?.firstName + " " + doctor?.lastName).trim());

  /**
   * Grup seviyesindeki "clinic" ve "doctor" dropdown
   */
  const renderGroupDropdown = (label, key, options, direction = "down") => (
    <>
      <label className="text-gray-700 mb-2 block">{label}</label>
      <div className="relative mb-4 dropdown-container">
        <div
          className="px-4 py-2 border border-gray-300 hover:border-[#399AA1] hover:border-[2px] rounded-lg cursor-pointer bg-white flex justify-between items-center"
          onClick={() => toggleDropdown(key)}
        >
          {groupData[key] || `${label} Seçin`}
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
                onClick={() => {
                  setGroupData((prev) => ({ ...prev, [key]: option }));
                  setDropdownOpen((prev) => ({ ...prev, [key]: false }));
                }}
              >
                {option}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );

  /**
   * Katılımcı seviyesindeki "gender" dropdown
   * index parametresi hangi katılımcıya ait olduğunu gösterir.
   */
  const renderParticipantDropdown = (
    label,
    key,
    index,
    options,
    direction = "down"
  ) => {
    const dropdownKey = `gender${index}`;
    // her katılımcının gender dropdown'unu ayrı kontrol etmek için

    return (
      <>
        <label className="text-gray-700 mb-2 block">{label}</label>
        <div className="relative mb-4 dropdown-container">
          <div
            className="px-4 py-2 border border-gray-300 hover:border-[#399AA1] hover:border-[2px] rounded-lg cursor-pointer bg-white flex justify-between items-center"
            onClick={() => toggleDropdown(dropdownKey)}
          >
            {participants[index][key] || `${label} Seçin`}
            <span className="ml-2 transform transition-transform duration-200 opacity-50">
              {dropdownOpen[dropdownKey] ? "▲" : "▼"}
            </span>
          </div>
          {dropdownOpen[dropdownKey] && (
            <ul
              className={`absolute left-0 right-0 bg-white border border-gray-300 rounded-lg max-h-[7.5rem] overflow-auto z-10 ${
                direction === "up" ? "bottom-full mb-1" : "top-full mt-1"
              }`}
            >
              {options.map((option, idx) => (
                <li
                  key={idx}
                  className="px-4 py-2 hover:bg-[#007E85] hover:text-white cursor-pointer"
                  onClick={() => {
                    // Katılımcının gender alanını güncelle
                    setParticipants((prev) => {
                      const updated = [...prev];
                      updated[index][key] = option;
                      return updated;
                    });
                    // Dropdown'u kapat
                    setDropdownOpen((prev) => ({
                      ...prev,
                      [dropdownKey]: false,
                    }));
                  }}
                >
                  {option}
                </li>
              ))}
            </ul>
          )}
        </div>
      </>
    );
  };

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
        <h3 className="text-lg font-semibold mb-2">Katılımcılar</h3>

        {participants.map((p, index) => (
          <div key={index} className="mb-4 p-4 border rounded relative">
            {/* Sil butonu (ilk katılımcı hariç) */}
            {participants.length > 1 && (
              <button
                type="button"
                onClick={() => removeParticipant(index)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                <IoIosCloseCircleOutline className="w-5 h-5" />
              </button>
            )}
            <div className="mb-2">
              <label className="block text-gray-700 mb-1">Ad</label>
              <input
                type="text"
                name="clientFirstName"
                value={p.clientFirstName}
                onChange={(e) => handleParticipantChange(index, e)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 mb-1">Soyad</label>
              <input
                type="text"
                name="clientLastName"
                value={p.clientLastName}
                onChange={(e) => handleParticipantChange(index, e)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 mb-1">Telefon</label>
              <input
                type="text"
                name="phoneNumber"
                value={p.phoneNumber}
                onChange={(e) => handleParticipantChange(index, e)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div className="mb-2">
              {/*
                Katılımcının cinsiyet dropdown'u 
                => renderParticipantDropdown("Cinsiyet", "gender", index, genderOptions)
              */}
              {renderParticipantDropdown(
                "Cinsiyet",
                "gender",
                index,
                genderOptions
              )}
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 mb-1">Yaş</label>
              <input
                type="number"
                name="age"
                value={p.age}
                onChange={(e) => handleParticipantChange(index, e)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>
        ))}

        {/* Katılımcı Ekle */}
        <button
          type="button"
          onClick={addParticipant}
          className="mb-4 px-4 py-2 bg-[#399AA1] text-white rounded hover:bg-[#007E85]"
        >
          Katılımcı Ekle
        </button>

        {/* Grup ortak alanlar */}
        <div className="mb-4">
          {renderGroupDropdown("Klinik", "clinic", clinicOptions, "down")}
        </div>
        <div className="mb-4">
          {renderGroupDropdown(
            "Doktor",
            "doctor",
            filteredDoctorOptions,
            "down"
          )}
        </div>

        {/* Randevu Tipi */}
        <div className="mb-4">
          {renderGroupDropdown("Randevu Tipi", "appointmentType", ["Ön Görüşme", "Muayene"], "down")}
        </div>

        {/* Randevu Hizmeti */}
        <div className="mb-4">
          <label className="text-gray-700 mb-2 block">Randevu Hizmeti</label>
          <div className="relative mb-4 dropdown-container">
            <div
              className={`px-4 py-2 border border-gray-300 hover:border-[#399AA1] hover:border-[2px] rounded-lg cursor-pointer bg-white flex justify-between items-center ${
                !groupData.appointmentType || !groupData.doctor || filteredServices.length === 0 ? 'bg-gray-100' : ''
              }`}
              onClick={() => {
                if (groupData.appointmentType && groupData.doctor && filteredServices.length > 0) {
                  toggleDropdown('serviceId');
                }
              }}
            >
              {groupData.serviceId ? 
                filteredServices.find(s => s._id === groupData.serviceId)?.serviceName || "Hizmet Seçin" 
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
                      setGroupData(prev => ({
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
          {!groupData.appointmentType && (
            <p className="text-amber-500 text-xs mt-1">
              Önce Randevu Tipi seçmelisiniz
            </p>
          )}
          {groupData.appointmentType && !groupData.doctor && (
            <p className="text-amber-500 text-xs mt-1">
              Önce Doktor seçmelisiniz
            </p>
          )}
          {groupData.appointmentType && groupData.doctor && filteredServices.length === 0 && (
            <p className="text-red-500 text-xs mt-1">
              {`"${groupData.appointmentType}" tipi için tanımlı hizmet bulunamadı`}
            </p>
          )}
        </div>

        <div className="mb-4">
          <AppointmentDatePicker
            selectedDate={groupData.datetime}
            onDateChange={(date) =>
              setGroupData((prev) => ({ ...prev, datetime: date }))
            }
            appointments={appointments}
            selectedClinic={groupData.clinic}
            selectedDoctor={groupData.doctor}
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
