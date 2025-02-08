import React, { useState, useMemo, forwardRef } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isSameDay, format } from "date-fns";
import { FaRegCalendarAlt } from "react-icons/fa";
import tr from "date-fns/locale/tr";

registerLocale("tr", tr);

const WORKING_HOURS_START = 9;
const WORKING_HOURS_END = 17;

// 15 dakikaya yuvarlama fonksiyonu: Tarihi 15 dakikalık aralığa aşağı yuvarlar.
function roundTo15(date) {
  const coeff = 1000 * 60 * 15;
  return new Date(Math.floor(date.getTime() / coeff) * coeff);
}

const AppointmentDatePicker = ({
  selectedDate,
  onDateChange,
  appointments = [],
  selectedClinic,
  selectedDoctor,
}) => {
  // Seçili klinik ve doktora ait randevuları filtreleyip, tarihleri yerel saat olarak parse ediyoruz.
  const parsedAppointments = useMemo(() => {
    if (!selectedClinic || !selectedDoctor) {
      console.log("Klinik veya doktor seçilmedi:", selectedClinic, selectedDoctor);
      return [];
    }
    const filtered = (appointments || []).filter((appt) => {
      // Klinik ve doktor isimlerini karşılaştırırken, verileri normalize ediyoruz.
      const clinicMatch =
        appt.clinicName?.trim().toLowerCase() === selectedClinic.trim().toLowerCase();
      const doctorMatch =
        appt.doctorName?.trim().toLowerCase() === selectedDoctor.trim().toLowerCase();
      if (!clinicMatch || !doctorMatch) {
        console.log("Eşleşmeyen randevu:", appt, "clinicMatch:", clinicMatch, "doctorMatch:", doctorMatch);
      }
      return clinicMatch && doctorMatch;
    });
    const parsed = filtered.map((appt) => {
      try {
        // new Date() fonksiyonu UTC'yi otomatik olarak yerel saate çevirir.
        let parsedDate = new Date(appt.datetime);
        if (isNaN(parsedDate)) throw new Error("Invalid date");
        // Saniye ve milisaniyeleri sıfırlayarak, yuvarlama öncesi temizlik yapıyoruz.
        parsedDate.setSeconds(0, 0);
        parsedDate = roundTo15(parsedDate);
        return { ...appt, parsedDate };
      } catch (error) {
        console.error("Geçersiz tarih:", appt.datetime, error);
        return null;
      }
    }).filter(Boolean);
    console.log("Parsed appointments:", parsed);
    return parsed;
  }, [appointments, selectedClinic, selectedDoctor]);

  // Seçili gün için disable edilmesi gereken zamanları (saat ve dakika) topluyoruz.
  const disabledTimesForSelectedDay = useMemo(() => {
    if (!selectedDate || !selectedClinic || !selectedDoctor) return [];
    return parsedAppointments
      .filter((appt) => isSameDay(appt.parsedDate, selectedDate))
      .map((appt) => ({
        hour: appt.parsedDate.getHours(),
        minute: appt.parsedDate.getMinutes(),
      }));
  }, [selectedDate, parsedAppointments, selectedClinic, selectedDoctor]);

  // DatePicker’dan gelen aday zamanı kontrol ediyoruz.
  const filterTime = (time) => {
    const hour = time.getHours();
    const minute = time.getMinutes();

    // Mesai saatleri dışında seçim yapılamasın.
    if (hour < WORKING_HOURS_START || hour >= WORKING_HOURS_END) return false;

    // Disable edilmesi gereken zaman olup olmadığını kontrol ediyoruz.
    const isDisabled = disabledTimesForSelectedDay.some(
      (t) => t.hour === hour && t.minute === minute
    );
    return !isDisabled;
  };

  // Geçmiş tarihlerin seçilmesini engellemek için
  const filterDate = (date) => date >= new Date();

  // DatePicker için özel input bileşeni. Klinik ve doktor seçilmediyse tıklanamaz.
  const CustomInput = forwardRef(({ value, onClick }, ref) => (
    <button
      onClick={onClick}
      ref={ref}
      className="w-[300px] px-3 py-2 rounded-lg flex items-center justify-between focus:outline-none"
      disabled={!selectedClinic || !selectedDoctor}
    >
      {selectedClinic && selectedDoctor ? (
        value || (
          <span className="text-gray-500 flex items-center">
            Tarih ve Saat Seçiniz <FaRegCalendarAlt className="ml-2" />
          </span>
        )
      ) : (
        <span className="text-gray-400">Önce klinik ve doktor seçin</span>
      )}
    </button>
  ));

  return (
    <div className="mx-auto mt-5">
      <label className="block text-gray-700 mb-1 font-medium">
        Randevu Tarihi ve Saati
      </label>
      <div className="mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-[#007E85]">
        <DatePicker
          locale="tr"
          selected={selectedDate}
          onChange={onDateChange}
          showTimeSelect
          timeIntervals={15} // 15 dakikalık aralıklarla seçim yapılabilsin.
          dateFormat="dd-MM-yyyy HH:mm"
          timeFormat="HH:mm"
          filterTime={filterTime}
          filterDate={filterDate}
          customInput={<CustomInput />}
          className="w-[300px] px-3 py-2 focus:outline-none"
          disabledKeyboardNavigation
          minDate={new Date()}
        />
      </div>

      {selectedDate && (
        <div className="mt-2">
          Seçtiğiniz Tarih ve Saat:{" "}
          <span className="font-semibold">
            {format(selectedDate, "dd MMMM yyyy HH:mm", { locale: tr })}
          </span>
        </div>
      )}
    </div>
  );
};

export default AppointmentDatePicker;
