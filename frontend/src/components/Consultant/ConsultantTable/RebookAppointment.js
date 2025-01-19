import React, { useEffect } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import SingleAppointmentForm from "../CreateAppointment/SingleAppointmentForm";
import GroupAppointmentForm from "../CreateAppointment/GroupAppointmentForm";

/**
 * props:
 * - isOpen (boolean) => popup açık mı?
 * - onClose (fn) => popup'ı kapatmak için
 * - prefilledData (object) => { type: 'single' | 'group', ...FormAlanları }
 * - options => { clinicOptions, doctorOptions, genderOptions }
 */
export default function RebookAppointment({
  isOpen,
  onClose,
  prefilledData,
  options,
}) {
  // ESC ile kapatma
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null; // isOpen false ise hiç render etmeyelim

  return (
    // Arka plan (overlay)
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      {/* Popup kutusu */}
      <div className="relative bg-white p-6 rounded-[10px] shadow-lg w-[30%] max-h-[95vh] overflow-y-auto">
        {/* Kapat Butonu */}
        <button
          className="absolute top-4 right-4 text-red-500 hover:text-gray-600"
          onClick={onClose}
        >
          <IoIosCloseCircleOutline className="w-7 h-7" />
        </button>

        {/* Hangisi doldurulacak? */}
        {prefilledData?.type === "single" && (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-center">
              Tek Kişilik Randevuyu Yenile
            </h2>
            <SingleAppointmentForm
              onClose={onClose}
              options={options}
              // Formu önden dolduracak veri
              prefilledData={prefilledData}
            />
          </div>
        )}

        {prefilledData?.type === "group" && (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-center">
              Grup Randevusunu Yenile
            </h2>
            <GroupAppointmentForm
              onClose={onClose}
              options={options}
              // Formu önden dolduracak veri
              prefilledData={prefilledData}
            />
          </div>
        )}
      </div>
    </div>
  );
}
