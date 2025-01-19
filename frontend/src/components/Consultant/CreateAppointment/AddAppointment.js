import React, { useState, useEffect } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import SingleAppointmentForm from "./SingleAppointmentForm";
import GroupAppointmentForm from "./GroupAppointmentForm";

export default function AddAppointment({
  options: { clinicOptions, doctorOptions, genderOptions },
  prefilledData = null, // <-- tablo satırından gelecek veriler (opsiyonel)
}) {
  const [isPopUpOpen, setPopUpOpen] = useState(false);
  // Randevu tipi (single/group)
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

  // Popup açma
  const handleOpenPopup = () => {
    setPopUpOpen(true);

    // Eğer prefilledData varsa tipini direkt ata.
    // Yoksa kullanıcıya "Tek kişilik mi grup mu?" ekranı göster.
    if (prefilledData && prefilledData.type) {
      setAppointmentType(prefilledData.type);
    } else {
      setAppointmentType(null);
    }
  };

  const handleClosePopup = () => {
    setPopUpOpen(false);
    setAppointmentType(null);
  };

  // Bu butonu sadece "Randevu Ekle" için kullanıyorsanız, 
  // isterseniz metinini condition'a göre değiştirebilirsiniz (Örn. "Randevu Yenile"?)
  return (
    <div className="flex justify-center items-center font-poppins min-w-[160px]">
      {/* RANDEVU EKLE BUTONU */}
      <button
        onClick={handleOpenPopup}
        className="bg-[#399AA1] text-white px-4 py-3 rounded-[10px] hover:bg-[#007E85] shadow-md"
      >
        {prefilledData ? "Randevu Yenile" : "+ Randevu Ekle"}
      </button>

      {/* POPUP */}
      {isPopUpOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="relative bg-white p-6 rounded-[10px] shadow-lg w-[30%] max-h-[95vh] overflow-y-auto">
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
                    onClick={() => setAppointmentType("single")}
                    className="bg-[#399AA1] text-white px-4 py-2 rounded-md hover:bg-[#007E85]"
                  >
                    Tek Kişilik Randevu
                  </button>
                  <button
                    onClick={() => setAppointmentType("group")}
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
                  // prefilledData'yı form bileşenine gönderiyoruz
                  prefilledData={
                    prefilledData && prefilledData.type === "single"
                      ? prefilledData
                      : null
                  }
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
                  prefilledData={
                    prefilledData && prefilledData.type === "group"
                      ? prefilledData
                      : null
                  }
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
