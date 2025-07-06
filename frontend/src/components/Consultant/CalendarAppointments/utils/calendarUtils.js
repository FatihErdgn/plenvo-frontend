import { format, addDays, startOfWeek, subWeeks, addWeeks, getDay, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { PASTEL_COLORS } from '../constants/calendarConstants';

// Tarih formatlamak için
export const formatDate = (date, formatStr) => {
  return format(date, formatStr, { locale: tr });
};

// Pazartesi başlangıçlı hafta başı hesaplama
export const getWeekStart = (date) => {
  const day = getDay(date);
  // Pazartesi = 1, Pazar = 0 olduğu için
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(date, diff);
};

// Randevu id'sine göre modern gradient renk seçimi
export const getPastelColor = (appointment) => {
  if (!appointment || !appointment.doctorId) return "";
  
  const doctorId = appointment.doctorId.toString();
  const participantNames = appointment.participants
    ? appointment.participants
        .map((p) => p.name.trim().toLowerCase())
        .sort()
        .join("")
    : "";
  
  const hashString = doctorId + participantNames;
  let sum = 0;
  for (let i = 0; i < hashString.length; i++) {
    sum += hashString.charCodeAt(i);
  }
  
  return PASTEL_COLORS[sum % PASTEL_COLORS.length];
};

// Türkiye telefon numarası formatını kontrol eden fonksiyon
export const validateTurkishPhoneNumber = (phone) => {
  if (!phone) return true; // Boş numara kabul edilebilir
  
  // 0 ile başlayan 10-11 haneli numara kontrolü
  const regex = /^0[5][0-9]{8,9}$/;
  return regex.test(phone);
};

// Haftadaki tarihleri hesapla
export const getWeekDates = (weekStart) => {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
};

// Tarih navigation fonksiyonları
export const getNavigationDates = (currentWeekStart) => ({
  previousWeek: () => subWeeks(currentWeekStart, 1),
  nextWeek: () => addWeeks(currentWeekStart, 1),
  currentWeek: () => getWeekStart(new Date()),
});

// TimeIndex'i saat ve dakikaya çevir
export const timeIndexToTime = (timeIndex) => {
  const hours = Math.floor(timeIndex / 4) + 9; // Her saat 4 slot, 09:00'dan başla
  const minutes = (timeIndex % 4) * 15; // 0, 15, 30, 45 dakika
  return { hours, minutes };
};

// Randevu tarihi hesaplama (UTC) - 15 dakikalık slotlar için
export const calculateAppointmentDate = (selectedDate, timeIndex) => {
  const { hours, minutes } = timeIndexToTime(timeIndex);
  
  return new Date(Date.UTC(
    selectedDate.getFullYear(),
    selectedDate.getMonth(), 
    selectedDate.getDate(),
    hours - 3, // TR saatini UTC'ye çevir (TR = UTC+3)
    minutes, 0, 0
  ));
};

// Randevu bulma fonksiyonu - multi-slot desteği ile
export const findAppointmentForCell = (appointments, dayIndex, timeIndex, cellDate) => {
  return appointments.find(
    (appt) => {
      const apptDate = new Date(appt.appointmentDate);
      const endTimeIndex = appt.endTimeIndex || appt.timeIndex;
      
      // Randevu bu hücreyi kapsıyor mu kontrol et
      return appt.dayIndex === dayIndex && 
             timeIndex >= appt.timeIndex &&
             timeIndex <= endTimeIndex &&
             isSameDay(apptDate, cellDate);
    }
  );
};

// Randevunun süresini dakika cinsinden hesapla
export const calculateAppointmentDuration = (startTimeIndex, endTimeIndex) => {
  const slotCount = (endTimeIndex - startTimeIndex) + 1;
  return slotCount * 15; // Her slot 15 dakika
};

// Randevu süresini formatla
export const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0 && mins > 0) {
    return `${hours} saat ${mins} dakika`;
  } else if (hours > 0) {
    return `${hours} saat`;
  } else {
    return `${mins} dakika`;
  }
};

// Sanal instance mi kontrol et
export const isVirtualInstance = (appointment) => {
  return appointment && appointment.isVirtualInstance;
};

// Classname builder utility
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

// Responsive breakpoint checker
export const useBreakpoint = (breakpoint) => {
  if (typeof window === 'undefined') return false;
  
  const queries = {
    sm: '(min-width: 640px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 1024px)',
    xl: '(min-width: 1280px)',
    '2xl': '(min-width: 1536px)',
  };
  
  return window.matchMedia(queries[breakpoint]).matches;
};

// Form validation utilities
export const validateForm = (formData) => {
  const errors = {};
  
  // Validate required fields
  if (!formData.appointmentType) {
    errors.appointmentType = 'Randevu tipi seçilmelidir';
  }
  
  if (!formData.participantNames || formData.participantNames.some(name => !name?.trim())) {
    errors.participantNames = 'Tüm katılımcı isimleri doldurulmalıdır';
  }
  
  if (!formData.participantPhones || formData.participantPhones.some(phone => !validateTurkishPhoneNumber(phone))) {
    errors.participantPhones = 'Geçerli telefon numaraları girilmelidir';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Animation helper
export const withAnimation = (baseClasses, animationClass) => {
  return `${baseClasses} ${animationClass}`;
};

// Color theme generator
export const generateColorTheme = (baseColor) => {
  const colors = {
    50: `${baseColor}-50`,
    100: `${baseColor}-100`,
    200: `${baseColor}-200`,
    300: `${baseColor}-300`,
    400: `${baseColor}-400`,
    500: `${baseColor}-500`,
    600: `${baseColor}-600`,
    700: `${baseColor}-700`,
    800: `${baseColor}-800`,
    900: `${baseColor}-900`,
  };
  
  return colors;
}; 