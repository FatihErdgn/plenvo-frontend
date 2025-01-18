// AddAppointment.jsx
import React, { useState, useEffect } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import SingleAppointmentForm from "./SingleAppointmentForm";
import GroupAppointmentForm from "./GroupAppointmentForm";

export default function AddAppointment({
  options: {
    clinicOptions,
    doctorOptions,
    genderOptions,
  },
}) {
  const [isPopUpOpen, setPopUpOpen] = useState(false);
  const [appointmentType, setAppointmentType] = useState(null);

  // ESC tuşu dinleyicisi
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClosePopup();
      }
    };
    if (isPopUpOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPopUpOpen]);

  const handleOpenPopup = () => {
    setPopUpOpen(true);
    setAppointmentType(null); // Form seçimini sıfırla
  };

  const handleClosePopup = () => {
    setPopUpOpen(false);
    setAppointmentType(null);
  };

  // Tek Kişilik randevu formunu seç
  const handleSelectSingle = () => {
    setAppointmentType("single");
  };

  // Grup randevusu formunu seç
  const handleSelectGroup = () => {
    setAppointmentType("group");
  };

  return (
    <div className="flex justify-center items-center font-poppins min-w-[160px]">
      {/* RANDEVU EKLE BUTONU */}
      <button
        onClick={handleOpenPopup}
        className="bg-[#399AA1] text-white px-4 py-3 rounded-[10px] hover:bg-[#007E85] shadow-md"
      >
        + Randevu Ekle
      </button>

      {/* POPUP */}
      {isPopUpOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="relative bg-white p-6 rounded-[10px] shadow-lg w-[30%] max-h-[100vh] overflow-y-auto">
            {/* KAPAT BUTONU */}
            <button
              className="absolute top-4 right-4 text-red-500 hover:text-gray-600"
              onClick={handleClosePopup}
            >
              <IoIosCloseCircleOutline className="w-7 h-7" />
            </button>

            {/* Eğer henüz randevu tipi seçilmemişse, seçim butonlarını göster */}
            {!appointmentType && (
              <div>
                <h2 className="text-lg font-semibold mb-4 text-center">
                  Randevu Tipi Seçiniz
                </h2>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleSelectSingle}
                    className="bg-[#399AA1] text-white px-4 py-2 rounded-md hover:bg-[#007E85]"
                  >
                    Tek Kişilik Randevu
                  </button>
                  <button
                    onClick={handleSelectGroup}
                    className="bg-[#399AA1] text-white px-4 py-2 rounded-md hover:bg-[#007E85]"
                  >
                    Grup Randevusu
                  </button>
                </div>
              </div>
            )}

            {/* Tek Kişilik Randevu Formu */}
            {appointmentType === "single" && (
              <div>
                <h2 className="text-lg font-semibold mb-4 text-center">
                  Tek Kişilik Randevu
                </h2>
                <SingleAppointmentForm
                  onClose={handleClosePopup}
                  options={{
                    clinicOptions,
                    doctorOptions,
                    genderOptions,
                  }}
                />
              </div>
            )}

            {/* Grup Randevusu Formu */}
            {appointmentType === "group" && (
              <div>
                <h2 className="text-lg font-semibold mb-4 text-center">
                  Grup Randevusu
                </h2>
                <GroupAppointmentForm
                  onClose={handleClosePopup}
                  options={{
                    clinicOptions,
                    doctorOptions,
                    genderOptions,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
