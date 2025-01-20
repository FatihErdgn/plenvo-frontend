import React, { useState, useMemo,forwardRef } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getHours, getMinutes, isSameDay, parse, format } from "date-fns";
import { FaRegCalendarAlt } from "react-icons/fa";
import tr from "date-fns/locale/tr";
registerLocale("tr", tr);

// Randevu verisi (örnek)
const appointments = [
  {
    id: 1,
    appointmentDateTime: "23-Jan-2025 10:00:00",
  },
];

// Tarih format pattern
const DATE_TIME_PATTERN = "dd-MMM-yyyy HH:mm:ss";

// Mesai aralığı
const WORKING_HOURS_START = 9; // 09:00
const WORKING_HOURS_END = 17; // 17:00

const AppointmentDatePicker = () => {
  const [selectedDate, setSelectedDate] = useState(null);

  // Randevuları Date tipine parse et
  const parsedAppointments = useMemo(() => {
    return appointments.map((appt) => {
      try {
        const parsedDate = parse(
          appt.appointmentDateTime,
          DATE_TIME_PATTERN,
          new Date()
        );
        return { ...appt, parsedDate };
      } catch (error) {
        console.error("Tarih parse edilemedi:", appt.appointmentDateTime);
        return appt;
      }
    });
  }, []);

  // Seçilen gün ile aynı güne düşen randevuların saat/dakika bilgilerini yakala
  const disabledTimesForSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    return parsedAppointments
      .filter(
        (appt) => appt.parsedDate && isSameDay(appt.parsedDate, selectedDate)
      )
      .map((appt) => ({
        hour: getHours(appt.parsedDate),
        minute: getMinutes(appt.parsedDate),
      }));
  }, [selectedDate, parsedAppointments]);

  // Saatleri filtrele
  const filterTime = (time) => {
    const hour = getHours(time);
    const minute = getMinutes(time);

    // Mesai saatleri dışını kapat
    if (hour < WORKING_HOURS_START || hour >= WORKING_HOURS_END) {
      return false;
    }

    // Aynı gün ve saatte randevu varsa kapat
    const isTimeDisabled = disabledTimesForSelectedDay.some(
      (disabledTime) =>
        disabledTime.hour === hour && disabledTime.minute === minute
    );
    return !isTimeDisabled;
  };

  // Tarih filtrele (örnek: bugünden önceyi kapat)
  const filterDate = (date) => {
    const now = new Date();
    return date >= now;
  };

  const CustomInput = forwardRef(({ value, onClick }, ref) => (
    <button
      onClick={onClick}
      ref={ref}
      className="w-[300px] px-3 py-2 rounded-lg flex items-center justify-between focus:outline-none"
    >
      {value || (
        <span className="text-gray-500 flex items-center">
          Tarih ve Saat Seçiniz <FaRegCalendarAlt className="ml-2" />
        </span>
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
          onChange={(date) => setSelectedDate(date)}
          showTimeSelect
          dateFormat="dd-MM-yyyy HH:mm"
          timeFormat="HH:mm"
          filterTime={filterTime}
          filterDate={filterDate}
          customInput={<CustomInput />}
          // Tailwind ile benzer input stili
          className="w-[300px] px-3 py-2 focus:outline-none"
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
