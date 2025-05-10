import React, { useState, useEffect } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import SingleAppointmentForm from "./SingleAppointmentForm";
import GroupAppointmentForm from "./GroupAppointmentForm";

export default function AddAppointment({
  onAddAppointment, // <-- API'ye yeni randevu eklemek için kullanılacak fonksiyon
  options: { clinicOptions, doctorOptions, genderOptions, doctorList }, // <-- select input seçenekleri
  prefilledData = null, // <-- tablo satırından gelecek veriler (opsiyonel)
  appointments, // <-- randevu verileri
  servicesData, // <-- hizmet verileri
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
    <div className="flex justify-center items-center font-poppins min-w-[10rem]">
      {/* RANDEVU EKLE BUTONU */}
      <button
        onClick={handleOpenPopup}
        className="bg-[#399AA1] text-white px-4 py-3 rounded-[10px] hover:bg-[#007E85] shadow-md"
      >
        {prefilledData ? "Randevu Yenile" : "+ Randevu Ekle"}
      </button>

      {/* POPUP - Responsive genişlik düzenlemesi */}
      {isPopUpOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
          {/* Modal container with fixed rounded corners - not scrollable itself */}
          <div className="relative bg-white rounded-[10px] shadow-lg w-[95%] sm:w-[80%] md:w-[60%] lg:w-[40%] xl:w-[30%] max-h-[95vh] flex flex-col overflow-hidden">
            {/* KAPAT BUTONU */}
            <div className="sticky top-0 z-10 p-6 pb-0">
              <button
                className="absolute top-4 right-4 text-red-500 hover:text-gray-600"
                onClick={handleClosePopup}
              >
                <IoIosCloseCircleOutline className="w-7 h-7" />
              </button>
            </div>

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto p-6 pt-2">
              {/* Eğer henüz randevu tipi seçilmemişse, seçim butonlarını göster */}
              {!appointmentType && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-center">
                    Randevu Tipi Seçiniz
                  </h2>
                  <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-4">
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
                    appointments={appointments}
                    onClose={handleClosePopup}
                    options={{
                      clinicOptions,
                      doctorOptions,
                      doctorList,
                      genderOptions,
                    }}
                    prefilledData={
                      prefilledData && prefilledData.type === "single"
                        ? prefilledData
                        : null
                    }
                    onAddAppointment={onAddAppointment}
                    servicesData={servicesData}
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
                    appointments={appointments}
                    onClose={handleClosePopup}
                    options={{
                      clinicOptions,
                      doctorOptions,
                      doctorList,
                      genderOptions,
                    }}
                    prefilledData={
                      prefilledData && prefilledData.type === "group"
                        ? prefilledData
                        : null
                    }
                    onAddAppointment={onAddAppointment}
                    servicesData={servicesData}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
