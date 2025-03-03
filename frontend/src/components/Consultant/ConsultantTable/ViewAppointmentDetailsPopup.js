// ViewAppointmentDetailsPopup.js
import React, { useState, useEffect } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { Alert, Collapse } from "@mui/material";
import { parse } from "date-fns";

export default function ViewAppointmentDetailsPopup({
  data,
  isEditable,
  onClose,
  options: { clinicOptions, doctorOptions, genderOptions },
  onEditAppointment,
}) {
  const [formData, setFormData] = useState(data || {});
  const [participants, setParticipants] = useState(
    data?.type === "group" && Array.isArray(data?.participants)
      ? data.participants
      : []
  );
  const [dropdownOpen, setDropdownOpen] = useState({
    status: false,
    gender: false,
    clinic: false,
    doctor: false,
  });
  const [alertState, setAlertState] = useState({
    message: "",
    severity: "",
    open: false,
  });

  // DropDown dışına tıklayınca kapanması
  useEffect(() => {
    const handleOutsideClick = (event) => {
      const dropdowns = document.querySelectorAll(".dropdown-container");
      let clickedInside = false;
      dropdowns.forEach((dropdown) => {
        if (dropdown.contains(event.target)) {
          clickedInside = true;
        }
      });
      if (!clickedInside) {
        setDropdownOpen({
          status: false,
          gender: false,
          clinic: false,
          doctor: false,
        });
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  // Alert otomatik kapanma
  useEffect(() => {
    if (alertState.open) {
      const timer = setTimeout(() => {
        setAlertState((prev) => ({ ...prev, open: false }));
      }, 5000); // 5 saniye sonra otomatik kapanır
      return () => clearTimeout(timer);
    }
  }, [alertState.open]);

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

  const formattedDate = (dateString) => {
    if (!dateString) return ""; // Eğer tarih boşsa hata vermemesi için boş string döndür
    const dateObj = new Date(dateString);
    if (isNaN(dateObj)) return ""; // Eğer geçersiz tarihse hata vermesin

    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");

    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  useEffect(() => {
    if (data?.datetime) {
      setFormData((prev) => ({
        ...prev,
        datetime: formattedDate(data.datetime), // hireDate'i formatlı olarak ata
      }));
    }
  }, [data?.datetime]);

  // Ortak input değişimi
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Grup katılımcısı değişimi
  const handleParticipantChange = (index, field, value) => {
    const updated = [...participants];
    updated[index] = { ...updated[index], [field]: value };
    setParticipants(updated);
  };

  // Randevuyu iptal etme butonu
  const handleCancelAppointment = async () => {
    if (!window.confirm("Randevuyu iptal etmek istediğinize emin misiniz?")) {
      return;
    }

    // Formdaki datetime değeri "dd.MM.yyyy HH:mm" formatında olabileceğinden ISO formatına çeviriyoruz
    const parsedDate = parse(formData.datetime, "dd.MM.yyyy HH:mm", new Date());
    const isoDate = new Date(parsedDate).toISOString();

    // Randevunun durumunu 'İptal Edildi' olarak güncelliyoruz
    const canceledData = {
      ...formData,
      status: "İptal Edildi",
      datetime: isoDate,
    };

    try {
      // API isteği gönderiliyor (PUT/PATCH işlemi)
      await onEditAppointment(canceledData);
      setFormData(canceledData);
      setAlertState({
        message: "Randevu iptal edildi.",
        severity: "info",
        open: true,
      });
    } catch (error) {
      console.error("Randevu iptal edilirken hata oluştu:", error);
      setAlertState({
        message: "Randevu iptal edilirken bir hata oluştu.",
        severity: "error",
        open: true,
      });
    }
  };

  // Form Submit (Kaydet)
  const handleEditSubmit = (e) => {
    e.preventDefault();

    // Öncelikle ortak alanları kontrol et
    if (
      !formData.status ||
      !formData.datetime ||
      !formData.clinicName ||
      !formData.doctorName
    ) {
      // console.log("formData", formData);
      setAlertState({
        message: "Lütfen (status, tarih, klinik, doktor) alanlarını doldurun.",
        severity: "error",
        open: true,
      });
      return;
    }

    // Tekil randevu validasyonu
    if (formData.type === "single") {
      if (
        !formData.clientFirstName?.trim() ||
        !formData.clientLastName?.trim() ||
        !formData.phoneNumber ||
        !formData.gender
        // !formData.age
      ) {
        setAlertState({
          message: "Lütfen tüm zorunlu alanları doldurun (isim, telefon vs.).",
          severity: "error",
          open: true,
        });
        return;
      }
    }
    // Grup randevu validasyonu
    else if (formData.type === "group") {
      if (!participants.length) {
        setAlertState({
          message: "En az bir katılımcı gerekiyor.",
          severity: "error",
          open: true,
        });
        return;
      }
      for (let i = 0; i < participants.length; i++) {
        const p = participants[i];
        if (
          !p.clientFirstName?.trim() ||
          !p.clientLastName?.trim() ||
          !p.phoneNumber ||
          !p.gender
          // !p.age
        ) {
          setAlertState({
            message: `Katılımcı #${i + 1} bilgilerini eksiksiz doldurun.`,
            severity: "error",
            open: true,
          });
          return;
        }
      }
    }

    const parsedDate = parse(formData.datetime, "dd.MM.yyyy HH:mm", new Date());

    const isoDate = new Date(parsedDate).toISOString();

    // Final veriyi oluştur
    const finalData =
      formData.type === "group"
        ? { ...formData, participants, datetime: isoDate }
        : { ...formData, datetime: isoDate };

    // Burada API isteği gönderebilirsiniz (PUT/PATCH).
    try {
      // console.log("formData", finalData);
      onEditAppointment(finalData);
    } catch (error) {
      console.error(error);
    }
    setAlertState({
      message: "Randevu başarıyla güncellendi.",
      severity: "success",
      open: true,
    });
  };

  const statusOptions = [
    "Açık",
    "Ödeme Bekleniyor",
    "Tamamlandı",
    "İptal Edildi",
  ];

  // Ortak dropdown (status, clinic, doctor)
  const renderDropdown = (label, key, options, direction = "down") => (
    <>
      <label className="text-gray-700 mb-2 block">{label}</label>
      <div className="relative mb-4 dropdown-container">
        <div
          className="px-4 py-2 border border-gray-300 hover:border-[#399AA1] hover:border-[2px] rounded-lg cursor-pointer bg-white flex justify-between items-center"
          onClick={() => toggleDropdown(key)}
        >
          {formData[key] || `Select ${label}`}
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

  // Gruplar için gender dropdown
  const renderParticipantGenderDropdown = (participantIndex) => {
    const isOpen = dropdownOpen[`gender-${participantIndex}`] || false;
    return (
      <div className="relative mb-2 dropdown-container">
        <div
          className="px-4 py-2 border border-gray-300 hover:border-[#399AA1] hover:border-[2px] rounded-lg cursor-pointer bg-white flex justify-between items-center"
          onClick={() =>
            setDropdownOpen((prev) => ({
              ...prev,
              [`gender-${participantIndex}`]: !isOpen,
            }))
          }
        >
          {participants[participantIndex].gender || "Seçiniz"}
          <span className="ml-2 transform transition-transform duration-200 opacity-50">
            {isOpen ? "▲" : "▼"}
          </span>
        </div>
        {isOpen && (
          <ul className="absolute left-0 right-0 bg-white border border-gray-300 rounded-lg max-h-[7.5rem] overflow-auto z-10 top-full mt-1">
            {genderOptions.map((g, idx) => (
              <li
                key={idx}
                className="px-4 py-2 hover:bg-[#007E85] hover:text-white cursor-pointer"
                onClick={() => {
                  handleParticipantChange(participantIndex, "gender", g);
                  setDropdownOpen((prev) => ({
                    ...prev,
                    [`gender-${participantIndex}`]: false,
                  }));
                }}
              >
                {g}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center  bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 sm:w-2/3 lg:w-1/2 relative">
        {/* Kapat butonu */}
        <button onClick={onClose} className="absolute top-3 right-3">
          <IoIosCloseCircleOutline className="w-6 h-6 text-gray-500 hover:text-gray-700" />
        </button>

        {/* Başlık */}
        <div className="flex justify-between items-center mb-4 pr-8">
          <h2 className="text-xl font-semibold">
            {isEditable
              ? "Edit Appointment Details"
              : "View Appointment Details"}
          </h2>
        </div>

        {/* Uyarı / Başarılı mesajları */}
        <Collapse in={alertState.open}>
          <Alert
            severity={alertState.severity}
            onClose={() => setAlertState({ ...alertState, open: false })}
          >
            {alertState.message}
          </Alert>
        </Collapse>

        <form
          onSubmit={handleEditSubmit}
          className="max-h-[80vh] overflow-auto pr-2"
        >
          {/* Randevu Tarihi/Saati */}
          <div className="mb-4">
            <label className="block text-gray-700">
              Randevu Tarihi ve Saati
            </label>
            <input
              type="text"
              name="datetime"
              value={formData.datetime || ""}
              disabled={!isEditable} // Artık enabled!
              onChange={handleInputChange} // Değişiklikleri state'e aktarır
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          {/* Klinik */}
          <div className="mb-4">
            {isEditable ? (
              renderDropdown("Klinik", "clinicName", clinicOptions)
            ) : (
              <>
                <label className="block text-gray-700">Klinik</label>
                <input
                  type="text"
                  name="clinicName"
                  value={formData.clinicName || ""}
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                />
              </>
            )}
          </div>

          {/* Doktor */}
          <div className="mb-4">
            {isEditable ? (
              renderDropdown("Doktor", "doctorName", doctorOptions)
            ) : (
              <div>
                <label className="block text-gray-700">Doktor</label>
                <input
                  type="text"
                  name="doctorName"
                  value={formData.doctorName || ""}
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                />
              </div>
            )}
          </div>

          <div className="mb-4">
            {isEditable ? (
              renderDropdown("Randevu Durumu", "status", statusOptions, "up")
            ) : (
              <>
                <label className="block text-gray-700">Randevu Durumu</label>
                <input
                  type="text"
                  name="status"
                  value={formData.status || ""}
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                />
              </>
            )}
          </div>

          {/* Tekil Randevu Alanları */}
          {formData.type === "single" && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700">First Name</label>
                <input
                  type="text"
                  name="clientFirstName"
                  value={formData.clientFirstName || ""}
                  onChange={handleInputChange}
                  disabled={!isEditable}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    isEditable
                      ? "border-gray-300"
                      : "bg-gray-100 border-transparent"
                  }`}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Last Name</label>
                <input
                  type="text"
                  name="clientLastName"
                  value={formData.clientLastName || ""}
                  onChange={handleInputChange}
                  disabled={!isEditable}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    isEditable
                      ? "border-gray-300"
                      : "bg-gray-100 border-transparent"
                  }`}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber || ""}
                  onChange={handleInputChange}
                  disabled={!isEditable}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    isEditable
                      ? "border-gray-300"
                      : "bg-gray-100 border-transparent"
                  }`}
                />
              </div>
              <div className="mb-4">
                {isEditable ? (
                  renderDropdown("Cinsiyet", "gender", genderOptions)
                ) : (
                  <>
                    <label className="block text-gray-700">Cinsiyet</label>
                    <input
                      type="text"
                      name="gender"
                      value={formData.gender || ""}
                      disabled
                      className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                    />
                  </>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age || ""}
                  onChange={handleInputChange}
                  disabled={!isEditable}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    isEditable
                      ? "border-gray-300"
                      : "bg-gray-100 border-transparent"
                  }`}
                />
              </div>
            </>
          )}

          {/* Grup Randevu Alanları */}
          {formData.type === "group" && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Katılımcılar</h3>
              {participants.map((p, idx) => (
                <div
                  key={idx}
                  className="border border-gray-300 rounded-md p-4 mb-4 relative"
                >
                  <div className="text-gray-600 mb-2">Katılımcı #{idx + 1}</div>
                  <div className="mb-2">
                    <label className="block text-gray-700">First Name</label>
                    <input
                      type="text"
                      value={p.clientFirstName || ""}
                      onChange={(e) =>
                        handleParticipantChange(
                          idx,
                          "clientFirstName",
                          e.target.value
                        )
                      }
                      disabled={!isEditable}
                      className={`w-full px-3 py-2 border rounded ${
                        isEditable
                          ? "border-gray-300"
                          : "bg-gray-100 border-transparent"
                      }`}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-gray-700">Last Name</label>
                    <input
                      type="text"
                      value={p.clientLastName || ""}
                      onChange={(e) =>
                        handleParticipantChange(
                          idx,
                          "clientLastName",
                          e.target.value
                        )
                      }
                      disabled={!isEditable}
                      className={`w-full px-3 py-2 border rounded ${
                        isEditable
                          ? "border-gray-300"
                          : "bg-gray-100 border-transparent"
                      }`}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-gray-700">Phone Number</label>
                    <input
                      type="text"
                      value={p.phoneNumber || ""}
                      onChange={(e) =>
                        handleParticipantChange(
                          idx,
                          "phoneNumber",
                          e.target.value
                        )
                      }
                      disabled={!isEditable}
                      className={`w-full px-3 py-2 border rounded ${
                        isEditable
                          ? "border-gray-300"
                          : "bg-gray-100 border-transparent"
                      }`}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-gray-700">Cinsiyet</label>
                    {isEditable ? (
                      renderParticipantGenderDropdown(idx)
                    ) : (
                      <input
                        type="text"
                        value={p.gender || ""}
                        disabled
                        className="w-full px-3 py-2 border rounded bg-gray-100"
                      />
                    )}
                  </div>
                  <div className="mb-2">
                    <label className="block text-gray-700">Age</label>
                    <input
                      type="number"
                      value={p.age || ""}
                      onChange={(e) =>
                        handleParticipantChange(idx, "age", e.target.value)
                      }
                      disabled={!isEditable}
                      className={`w-full px-3 py-2 border rounded ${
                        isEditable
                          ? "border-gray-300"
                          : "bg-gray-100 border-transparent"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Butonlar: Kaydet + Randevu İptal + (Kapat ise yukarıda) */}
          {isEditable && (
            <div className="flex justify-center mt-6 mb-2 gap-4">
              {/* Randevuyu İptal Et Butonu */}
              <button
                type="button"
                onClick={handleCancelAppointment}
                className="px-8 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 cursor-pointer"
              >
                Randevuyu İptal Et
              </button>

              {/* Kaydet Butonu */}
              {alertState.open ? (
                <button
                  type="submit"
                  className="px-8 py-2 bg-[#f0f0f0] text-white rounded-full cursor-not-allowed"
                  disabled
                >
                  Kaydet
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-8 py-2 bg-[#399AA1] text-white rounded-full hover:bg-[#007E85] cursor-pointer"
                >
                  Kaydet
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
