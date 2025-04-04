import React, { useState, useMemo, forwardRef } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isSameDay, format } from "date-fns";
import { FaRegCalendarAlt } from "react-icons/fa";
import tr from "date-fns/locale/tr";

registerLocale("tr", tr);

const WORKING_HOURS_START = 8;
const WORKING_HOURS_END = 21;

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
      // console.log("Klinik veya doktor seçilmedi:", selectedClinic, selectedDoctor);
      return [];
    }
    const filtered = (appointments || []).filter((appt) => {
      // Klinik ve doktor isimlerini karşılaştırırken, verileri normalize ediyoruz.
      const clinicMatch =
        appt.clinicName?.trim().toLowerCase() ===
        selectedClinic.trim().toLowerCase();
      const doctorMatch =
        appt.doctorName?.trim().toLowerCase() ===
        selectedDoctor.trim().toLowerCase();
      if (!clinicMatch || !doctorMatch) {
        // console.log("Eşleşmeyen randevu:", appt, "clinicMatch:", clinicMatch, "doctorMatch:", doctorMatch);
      }
      return clinicMatch && doctorMatch;
    });
    const parsed = filtered
      .map((appt) => {
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
      })
      .filter(Boolean);
    // console.log("Parsed appointments:", parsed);
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

    // Eğer bugünse, mevcut zamandan önceki saatleri devre dışı bırakıyoruz.
    if (selectedDate && isSameDay(selectedDate, new Date())) {
      const now = new Date();
      if (time < now) return false;
    }

    // Disable edilmesi gereken zaman olup olmadığını kontrol ediyoruz.
    const isDisabled = disabledTimesForSelectedDay.some(
      (t) => t.hour === hour && t.minute === minute
    );
    return !isDisabled;
  };

  // Güncellenmiş filterDate: Sadece yıl, ay, gün bazında karşılaştırma yapar.
  const filterDate = (date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const checkDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    return checkDate >= today;
  };

  // DatePicker için özel input bileşeni. Klinik ve doktor seçilmediyse tıklanamaz.
  const CustomInput = forwardRef(({ value, onClick }, ref) => (
    <button
      onClick={onClick}
      ref={ref}
      className="w-[18.75rem] px-3 py-2 rounded-lg flex items-center justify-between focus:outline-none"
      disabled={!selectedClinic || !selectedDoctor}
    >
      {selectedClinic && selectedDoctor ? (
        value || (
          <span className="text-gray-500 flex items-center">
            Tarih ve Saat Seçiniz
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
      <div className="flex items-center mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-[#007E85]">
        <FaRegCalendarAlt className="text-gray-500 ml-2" />
        <DatePicker
          locale="tr"
          selected={selectedDate}
          onChange={onDateChange}
          showTimeSelect
          timeIntervals={15}
          dateFormat="dd-MM-yyyy HH:mm"
          timeFormat="HH:mm"
          filterTime={filterTime}
          filterDate={filterDate}
          customInput={<CustomInput />}
          disabledKeyboardNavigation
          minDate={new Date()}
          minTime={
            selectedDate && isSameDay(selectedDate, new Date())
              ? new Date()
              : new Date(new Date().setHours(WORKING_HOURS_START, 0, 0, 0))
          }
          maxTime={new Date(new Date().setHours(WORKING_HOURS_END, 0, 0, 0))}
          className="w-[18.75rem] px-3 py-2 focus:outline-none"
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
