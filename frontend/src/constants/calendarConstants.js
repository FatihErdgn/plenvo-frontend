// Haftanın günleri - tam ve kısaltılmış versiyonlar
export const DAYS = [
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
  "Pazar",
];

// Mobil görünüm için kısaltılmış gün adları
export const DAYS_SHORT = [
  "Pt",
  "Sa",
  "Çr",
  "Pr",
  "Cu",
  "Ct",
  "Pz",
];

// Saat dilimleri - 15 dakikalık
export const TIME_SLOTS = [
  "09:00",
  "09:15",
  "09:30",
  "09:45",
  "10:00",
  "10:15",
  "10:30",
  "10:45",
  "11:00",
  "11:15",
  "11:30",
  "11:45",
  "12:00",
  "12:15",
  "12:30",
  "12:45",
  "13:00",
  "13:15",
  "13:30",
  "13:45",
  "14:00",
  "14:15",
  "14:30",
  "14:45",
  "15:00",
  "15:15",
  "15:30",
  "15:45",
  "16:00",
  "16:15",
  "16:30",
  "16:45",
  "17:00",
  "17:15",
  "17:30",
  "17:45",
  "18:00",
  "18:15",
  "18:30",
  "18:45",
  "19:00",
  "19:15",
  "19:30",
  "19:45",
  "20:00",
  "20:15",
  "20:30",
  "20:45",
];

// Modern renk paleti
export const COLORS = {
  primary: {
    50: '#e6f7f8',
    100: '#b3e8ea',
    200: '#80d9dc',
    300: '#4dcace',
    400: '#26b5ba',
    500: '#007E85',
    600: '#006b71',
    700: '#00595d',
    800: '#004649',
    900: '#003335',
  },
  secondary: {
    50: '#fef7e6',
    100: '#fce8b3',
    200: '#fad980',
    300: '#f8ca4d',
    400: '#f6bb26',
    500: '#f4ac00',
    600: '#d19600',
    700: '#ae8000',
    800: '#8b6a00',
    900: '#685400',
  },
  success: {
    50: '#e8f5e8',
    100: '#c3e6c3',
    200: '#9ed69e',
    300: '#79c679',
    400: '#5bb85b',
    500: '#3da93d',
    600: '#359235',
    700: '#2d7a2d',
    800: '#256225',
    900: '#1a4a1a',
  },
  warning: {
    50: '#fff7e6',
    100: '#ffe8b3',
    200: '#ffd980',
    300: '#ffca4d',
    400: '#ffbb26',
    500: '#ffac00',
    600: '#d99500',
    700: '#b37e00',
    800: '#8c6700',
    900: '#665000',
  },
  error: {
    50: '#ffeaea',
    100: '#ffcccc',
    200: '#ffadad',
    300: '#ff8f8f',
    400: '#ff7070',
    500: '#ff5252',
    600: '#d94545',
    700: '#b33838',
    800: '#8c2b2b',
    900: '#661e1e',
  },
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};

// Modern pastel renkler
export const PASTEL_COLORS = [
  "bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200",
  "bg-gradient-to-br from-pink-50 to-rose-100 border-pink-200",
  "bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200",
  "bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-200",
  "bg-gradient-to-br from-green-50 to-emerald-100 border-green-200",
  "bg-gradient-to-br from-cyan-50 to-teal-100 border-cyan-200",
  "bg-gradient-to-br from-orange-50 to-red-100 border-orange-200",
];

// Appointment types
export const APPOINTMENT_TYPES = [
  { value: "Ön Görüşme", label: "Ön Görüşme" },
  { value: "Rutin Görüşme", label: "Rutin Görüşme" },
  { value: "Muayene", label: "Muayene" },
];

// Participant count options
export const PARTICIPANT_COUNT_OPTIONS = [1, 2, 3, 4, 5, 6];

// Animation classes
export const ANIMATIONS = {
  fadeIn: "animate-fade-in",
  slideIn: "animate-slide-in",
  slideUp: "animate-slide-up",
  bounce: "animate-bounce",
  pulse: "animate-pulse",
};

// Layout breakpoints
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}; 