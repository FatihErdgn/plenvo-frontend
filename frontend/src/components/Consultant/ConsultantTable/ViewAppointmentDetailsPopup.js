// ViewAppointmentDetailsPopup.js
import React, { useState, useEffect } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { Alert, Collapse } from "@mui/material";
import { parse } from "date-fns";
import AppointmentDatePicker from "../CreateAppointment/DatePicker";
import { getAppointments } from "../../../services/appointmentService";

export default function ViewAppointmentDetailsPopup({
  data,
  isEditable,
  onClose,
  options: { clinicOptions, doctorOptions, genderOptions },
  onEditAppointment,
}) {
  const [formData, setFormData] = useState(data || {});
  const [appointmentData, setAppointmentData] = useState([]);
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
  // İptal popup’ı ve iptal nedeni state’leri
  const [isCancelPopupOpen, setIsCancelPopupOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

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
      }, 5000);
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

  const fetchAppointments = async () => {
    try {
      const response = await getAppointments();
      setAppointmentData(response.data || []);
    } catch (error) {
      console.error("Randevuları alırken hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Tarihi Date nesnesine çevirerek state'e atıyoruz.
  useEffect(() => {
    if (data?.datetime) {
      setFormData((prev) => ({
        ...prev,
        datetime: new Date(data.datetime), // Date nesnesi olarak saklıyoruz
      }));
    }
  }, [data?.datetime]);

  // DatePicker için tarih değişimlerini yönetecek fonksiyon
  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      datetime: date,
    }));
  };

  // Diğer input değişiklikleri
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

  // İptal et butonuna basıldığında popup’ı aç
  const handleCancelAppointment = () => {
    setIsCancelPopupOpen(true);
  };

  // Popup üzerindeki "İptal Et" butonuna basıldığında işlemi gerçekleştir
  const handleConfirmCancelAppointment = async () => {
    const isoDate =
      formData.datetime instanceof Date
        ? formData.datetime.toISOString()
        : new Date(formData.datetime).toISOString();

    const canceledData = {
      ...formData,
      status: "İptal Edildi",
      datetime: isoDate,
      statusComment: cancelReason,
    };

    try {
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
    setIsCancelPopupOpen(false);
    setCancelReason("");
  };

  // Form Submit (Kaydet)
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.status ||
      !formData.datetime ||
      !formData.clinicName ||
      !formData.doctorName
    ) {
      setAlertState({
        message: "Lütfen (status, tarih, klinik, doktor) alanlarını doldurun.",
        severity: "error",
        open: true,
      });
      return;
    }

    if (formData.type === "single") {
      if (
        !formData.clientFirstName?.trim() ||
        !formData.clientLastName?.trim() ||
        !formData.phoneNumber ||
        !formData.gender
      ) {
        setAlertState({
          message: "Lütfen tüm zorunlu alanları doldurun (isim, telefon vs.).",
          severity: "error",
          open: true,
        });
        return;
      }
    } else if (formData.type === "group") {
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

    const isoDate =
      formData.datetime instanceof Date
        ? formData.datetime.toISOString()
        : new Date(formData.datetime).toISOString();

    const finalData =
      formData.type === "group"
        ? { ...formData, participants, datetime: isoDate }
        : { ...formData, datetime: isoDate };

    try {
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

  const statusOptions = ["Açık", "Ödeme Bekleniyor", "Tamamlandı"];

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
    <>
      <div className="fixed inset-0 flex justify-center items-center bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 sm:w-2/3 lg:w-1/2 relative">
          <button onClick={onClose} className="absolute top-3 right-3">
            <IoIosCloseCircleOutline className="w-6 h-6 text-gray-500 hover:text-gray-700" />
          </button>

          <div className="flex justify-between items-center mb-4 pr-8">
            <h2 className="text-xl font-semibold">
              {isEditable
                ? "Edit Appointment Details"
                : "View Appointment Details"}
            </h2>
          </div>

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
            <div className="mb-4">
              <AppointmentDatePicker
                selectedDate={formData.datetime}
                onDateChange={handleDateChange}
                appointments={appointmentData}
                selectedClinic={formData.clinicName}
                selectedDoctor={formData.doctorName}
              />
            </div>

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

            <div className="mb-4">
              {!isEditable ? (
                <>
                  <label className="block text-gray-700">Eklenen Yorum</label>
                  <input
                    type="textarea"
                    name="statusComment"
                    value={formData.statusComment || ""}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    className={`w-full px-4 py-2 border rounded-lg ${
                      isEditable
                        ? "border-gray-300"
                        : "bg-gray-100 border-transparent"
                    }`}
                  />
                </>
              ) : null}
            </div>

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

            {formData.type === "group" && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Katılımcılar</h3>
                {participants.map((p, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-300 rounded-md p-4 mb-4 relative"
                  >
                    <div className="text-gray-600 mb-2">
                      Katılımcı #{idx + 1}
                    </div>
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
                      <label className="block text-gray-700">
                        Phone Number
                      </label>
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

            {isEditable && (
              <div className="flex justify-center mt-6 mb-2 gap-4">
                <button
                  type="button"
                  onClick={handleCancelAppointment}
                  className="px-8 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 cursor-pointer"
                >
                  Randevuyu İptal Et
                </button>
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

      {isCancelPopupOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-opacity-50">
          <div
            style={{ animation: "fadeIn 0.3s ease-out", width: "30%" }}
            className="bg-white p-6 rounded-lg shadow-xl relative"
          >
            <h3 className="text-lg font-semibold mb-4">
              Randevuyu iptal etmek istediğinize emin misiniz?
            </h3>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="İptal nedeni giriniz"
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setIsCancelPopupOpen(false)}
                className="px-4 py-2 border rounded-full cursor-pointer hover:bg-gray-100"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelAppointment}
                className="px-4 py-2 bg-red-500 text-white rounded-full cursor-pointer hover:bg-red-600"
              >
                İptal Et
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}
