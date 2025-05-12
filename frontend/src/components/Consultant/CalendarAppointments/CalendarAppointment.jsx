import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import {
  getCalendarAppointments,
  createCalendarAppointment,
  updateCalendarAppointment,
  deleteCalendarAppointment,
} from "../../../services/calendarAppointmentService";
import { getUsers, getProfile } from "../../../services/userService";
import PaymentPopup from "../ConsultantTable/PayNowButton"; // Ödeme popup'ı component'i
import { FaMoneyBills } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";
import usePaymentStatus from "../../../hooks/usePaymentStatus"; // Custom hook
import { IoIosCloseCircleOutline } from "react-icons/io";
import ReadOnlyPaymentPopup from "../ConsultantTable/ReadOnlyPayNowButton";
import { format, addDays, startOfWeek, subWeeks, addWeeks, getDay, parse, isValid, parseISO, addMonths, startOfMonth, setWeek, endOfMonth, eachWeekOfInterval, getWeeksInMonth } from 'date-fns';
import { tr } from 'date-fns/locale';
import { FaChevronLeft, FaChevronRight, FaRegCalendarAlt } from "react-icons/fa";

// Required field indicator component
const RequiredIndicator = () => (
  <span className="text-red-500 ml-1">*</span>
);

// Haftanın günleri - tam ve kısaltılmış versiyonlar
const DAYS = [
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
  "Pazar",
];

// Mobil görünüm için kısaltılmış gün adları
const DAYS_SHORT = [
  "Pt",
  "Sa",
  "Çr",
  "Pr",
  "Cu",
  "Ct",
  "Pz",
];

// Saat dilimleri
const TIME_SLOTS = [
  "09:00-09:50",
  "10:00-10:50",
  "11:00-11:50",
  "12:00-12:50",
  "13:00-13:50",
  "14:00-14:50",
  "15:00-15:50",
  "16:00-16:50",
  "17:00-17:50",
  "18:00-18:50",
  "19:00-19:50",
  "20:00-20:50",
];

// Yardımcı fonksiyon: Randevu id'sine göre pastel renk seçimi yapar.
const getPastelColor = (appointment) => {
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
  const pastelColors = [
    "bg-blue-100",
    "bg-pink-100",
    "bg-purple-100",
    "bg-yellow-100",
    "bg-green-100",
    "bg-indigo-100",
    "bg-orange-100",
  ];
  return pastelColors[sum % pastelColors.length];
};

// Yardımcı fonksiyon: Tarih formatlamak için
const formatDate = (date, formatStr) => {
  return format(date, formatStr, { locale: tr });
};

// Pazartesi başlangıçlı hafta başı hesaplama
const getWeekStart = (date) => {
  const day = getDay(date);
  // Pazartesi = 1, Pazar = 0 olduğu için
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(date, diff);
};

// Türkiye telefon numarası formatını kontrol eden yardımcı fonksiyon
const validateTurkishPhoneNumber = (phone) => {
  if (!phone) return true; // Boş numara kabul edilebilir
  
  // 0 ile başlayan 10-11 haneli numara kontrolü
  const regex = /^0[5][0-9]{8,9}$/;
  return regex.test(phone);
};

// PaymentStatusCell: Randevuya ait ödeme durumunu kontrol eder.
function PaymentStatusCell({
  appointment,
  onClickPayNow,
  refreshTrigger,
  fetchAppointments,
  preventAutoPopup
}) {
  const { completed, halfPaid, totalPaid, isExpired } = usePaymentStatus(
    appointment._id,
    refreshTrigger
  );
  const [viewPaymentOpen, setViewPaymentOpen] = useState(false);
  
  // İlk mount sonrası oluşan değişiklikleri izleyen ref
  const initialRenderRef = useRef(true);
  const lastCompletedRef = useRef(completed);
  
  // Tamamlanma durumu değişince ve bu ilk render değilse ve preventAutoPopup aktif değilse
  useEffect(() => {
    // İlk mount sırasında (ilk render) hiçbir şey yapma
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      lastCompletedRef.current = completed;
      return;
    }
    
    // Tamamlanma durumu false'dan true'ya değiştiyse ve preventAutoPopup aktif değilse
    // Bu, bir ödeme işlemi sonrası "completed" durumunun değiştiğini gösterir
    if (completed && !lastCompletedRef.current && preventAutoPopup) {
      // Otomatik popup açılmasını engelle
      setViewPaymentOpen(false);
    }
    
    lastCompletedRef.current = completed;
  }, [completed, preventAutoPopup]);

  // Ödeme periyodu sona ermişse özel bir durum gösterilmeli
  if (isExpired) {
    return (
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClickPayNow();
          }}
          title="Ödeme periyodu dolmuş! Yeni ödeme gerekiyor."
          className="absolute top-1 right-1 bg-orange-500 hover:bg-orange-600 text-white text-xs px-1 py-0.5 rounded"
        >
          <FaMoneyBills className="w-[1.25rem] h-[1.25rem]" />
        </button>
        <div className="text-sm font-medium pr-8">
          {appointment.participants.map((p) => p.name).join(" - ")}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {completed ? (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Sadece manuel tıklamalarda açılsın
              setViewPaymentOpen(true);
            }}
            title={`Toplam Ödenen Miktar: ${totalPaid} TL`}
            className="absolute top-0.5 right-0.5"
          >
            <IoCheckmarkDoneCircleSharp className="text-green-600 w-6 h-6 hover:text-green-700" />
          </button>
          {viewPaymentOpen && (
            <div
              className="fixed text-center inset-0 bg-black bg-opacity-50 z-50"
              onClick={(e) => e.stopPropagation()}
              style={{ pointerEvents: "all" }}
            >
              <ReadOnlyPaymentPopup
                isOpen={viewPaymentOpen}
                onClose={() => setViewPaymentOpen(false)}
                row={appointment}
                onRefreshAppointments={fetchAppointments}
              />
            </div>
          )}
        </>
      ) : halfPaid ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClickPayNow();
          }}
          title={`Yarım Ödeme - Toplam Ödenen: ${totalPaid} TL`}
          className="absolute top-0.5 right-0.5 text-red-500 hover:text-red-700"
        >
          <FaCheckCircle className="w-5 h-5" />
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClickPayNow();
          }}
          className="absolute top-1 right-1 bg-[#399AA1] hover:bg-[#007E85] text-white text-xs px-1 py-0.5 rounded"
        >
          <FaMoneyBills className="w-[1.25rem] h-[1.25rem]" />
        </button>
      )}
      <div className="text-sm font-medium pr-8">
        {appointment.participants.map((p) => p.name).join(" - ")}
      </div>
    </div>
  );
}

export default function CalendarSchedulePage({ servicesData }) {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [doctorList, setDoctorList] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [participantCount, setParticipantCount] = useState(1);
  const [participantNames, setParticipantNames] = useState([""]);
  const [participantPhones, setParticipantPhones] = useState([""]);
  const [phoneErrors, setPhoneErrors] = useState([]); // Telefon numarası validasyon hataları
  const [description, setDescription] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false); // Ödeme popup kontrolü
  const [paymentRefreshTrigger, setPaymentRefreshTrigger] = useState(0); // Ödeme durumunu yenilemek için
  const [isRecurring, setIsRecurring] = useState(true); // Randevunun tekrarlı olup olmadığı
  const [endDate, setEndDate] = useState(null); // Tekrarlı randevunun bitiş tarihi
  const [updateAllInstances, setUpdateAllInstances] = useState(false); // Tüm seriyi mi güncelliyoruz?
  const [showDeleteOptionsModal, setShowDeleteOptionsModal] = useState(false); // Silme seçenekleri popup
  const [deleteMode, setDeleteMode] = useState("single"); // Seçilen silme modu
  const [appointmentType, setAppointmentType] = useState(""); // Randevu Tipi
  const [selectedService, setSelectedService] = useState(""); // Randevu Hizmeti
  
  // Eski uyarı state'i yerine yeni state'ler ekliyoruz
  const [showRutinDeleteWarning, setShowRutinDeleteWarning] = useState(false); // Rutin Görüşme için uzun uyarı
  const [showSimpleDeleteWarning, setShowSimpleDeleteWarning] = useState(false); // Diğer tipler için basit uyarı

  // Yeni: Hücre tıklama sonrası seçim modunu yönetmek için
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [showRebookModal, setShowRebookModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState({
    dayIndex: null,
    timeIndex: null,
  });
  // Seçilen randevudan bookingId alınacaksa bu state'e kaydedilir
  const [rebookBookingId, setRebookBookingId] = useState(null);

  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Ay seçimi için yeni state
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Component içinde yeni state ekleme
  const [participantError, setParticipantError] = useState(false);

  // Ödeme sonrası otomatik popup'ı engelleyen bayrak - true olduğunda popup engellenir
  const [preventAutoPopup, setPreventAutoPopup] = useState(false);

  const [formErrors, setFormErrors] = useState({
    appointmentType: false,
    selectedService: false,
    participantNames: [],
    participantPhones: []
  });

  // console.log(servicesData);

  // Kullanıcı profilini al
  useEffect(() => {
    (async () => {
      const profileRes = await getProfile();
      if (profileRes.success) {
        setLoggedInUser(profileRes.user);
      }
    })();
  }, []);

  // Danışman listesini getir (admin/manager/superadmin/consultant ise)
  useEffect(() => {
    if (
      loggedInUser &&
      ["admin", "manager", "superadmin", "consultant"].includes(
        loggedInUser.roleId?.roleName
      )
    ) {
      (async () => {
        const userRes = await getUsers();
        if (userRes.success) {
          const docs = userRes.data.filter(
            (u) =>
              u.roleId?.roleName === "doctor" || u.roleId?.roleName === "admin"
          );
          setDoctorList(docs);
        }
      })();
    }
  }, [loggedInUser]);

  // Seçilen (veya kendi) doktora ait randevuları çek - tarih filtresiyle
  useEffect(() => {
    if (!loggedInUser) return;
    let doctorIdToFetch = "";
    if (loggedInUser.roleId?.roleName === "doctor") {
      doctorIdToFetch = loggedInUser._id;
    } else if (
      ["admin", "manager", "superadmin", "consultant"].includes(
        loggedInUser.roleId?.roleName
      )
    ) {
      if (!selectedDoctor) return;
      doctorIdToFetch = selectedDoctor;
    }
    if (doctorIdToFetch) {
      (async () => {
        // Tarih filtresini ekle
        const res = await getCalendarAppointments(
          doctorIdToFetch, 
          currentWeekStart.toISOString()
        );
        if (res.success) {
          setAppointments(res.data);
          setPaymentRefreshTrigger((prev) => prev + 1);
        }
      })();
    }
  }, [loggedInUser, selectedDoctor, currentWeekStart]);

  // Tarih değiştirme fonksiyonları
  const goToPreviousWeek = () => {
    setCurrentWeekStart(prevDate => subWeeks(prevDate, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(prevDate => addWeeks(prevDate, 1));
  };

  const goToSpecificWeek = (date) => {
    setCurrentWeekStart(getWeekStart(date));
    setShowDatePicker(false);
  };

  // Ay değiştirme fonksiyonu
  const goToMonth = (date) => {
    setCurrentMonth(date);
    // Ayın ilk haftasına git
    const firstWeekStart = startOfWeek(startOfMonth(date), { weekStartsOn: 1 }); // Pazartesi başlangıç
    setCurrentWeekStart(firstWeekStart);
    setShowMonthPicker(false);
    setShowDatePicker(true); // Hafta seçiciyi görünür yap
  };
  
  // Mevcut ayı göstermek için formatla
  const formatMonthName = (date) => {
    return formatDate(date, "MMMM yyyy");
  };

  // Haftadaki tarihleri hesapla
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // Ortak hücre tıklama fonksiyonu:
  // Eğer hücrede randevu varsa direkt düzenleme moduna, yoksa seçim modalına yönlendir.
  const handleCellClick = (dayIndex, timeIndex, appt) => {
    if (loggedInUser?.roleId?.roleName === "doctor") return;
    
    // Tarih ve saat hesaplayalım
    const appointmentDate = new Date(weekDates[dayIndex]);
    appointmentDate.setHours(9 + Math.floor(timeIndex));
    appointmentDate.setMinutes(0);
    
    setSelectedCell({ dayIndex, timeIndex, appointmentDate });
    
    if (appt) {
      // Varolan randevu varsa; düzenleme moduna geç
      setEditMode(true);
      setSelectedAppointment(appt);
      setParticipantCount(appt.participants ? appt.participants.length : 1);
      
      // İsim ve telefon bilgilerini ayarla
      if (appt.participants) {
        // Katılımcı isimleri
        setParticipantNames(appt.participants.map((p) => p.name || ""));
        
        // Katılımcı telefon numaraları
        setParticipantPhones(appt.participants.map((p) => p.phone || ""));
        
        // Telefon hatalarını sıfırla
        setPhoneErrors(appt.participants.map(() => ""));
      } else {
        setParticipantNames([""]);
        setParticipantPhones([""]);
        setPhoneErrors([""]);
      }
      
      setDescription(appt.description || "");
      setIsRecurring(appt.isRecurring !== undefined ? appt.isRecurring : true);
      setEndDate(appt.endDate);
      setUpdateAllInstances(false);
      setAppointmentType(appt.appointmentType || ""); // Randevu Tipini ayarla
      setSelectedService(appt.serviceId || "");
      setShowModal(true);
    } else {
      // Eğer randevu yoksa, seçenek modalını aç
      setSelectedAppointment(null);
      setShowModal(false);
      setShowChoiceModal(true);
    }
  };

  // Telefon numarası girişi için handler
  const handlePhoneChange = (index, value) => {
    const newPhones = [...participantPhones];
    newPhones[index] = value;
    setParticipantPhones(newPhones);
    
    // Clear error when field is filled correctly
    if (value && validateTurkishPhoneNumber(value)) {
      const newErrors = {...formErrors};
      newErrors.participantPhones[index] = false;
      setFormErrors(newErrors);
    }
    
    // Telefon formatını kontrol et
    const newPhoneErrors = [...phoneErrors];
    if (value && !validateTurkishPhoneNumber(value)) {
      newPhoneErrors[index] = "Telefon 0 ile başlamalı ve 05XX XXX XX XX formatında olmalıdır";
    } else {
      newPhoneErrors[index] = "";
    }
    setPhoneErrors(newPhoneErrors);
  };

  // Reset service selection when appointment type changes
  useEffect(() => {
    setSelectedService("");
  }, [appointmentType]);

  // Optimize getSelectedDoctorName with useMemo
  const getSelectedDoctorName = useCallback(() => {
    if (!loggedInUser) return "Yükleniyor...";
    if (loggedInUser.roleId?.roleName === "doctor") {
      return `${loggedInUser.firstName} ${loggedInUser.lastName}`;
    } else if (
      ["admin", "manager", "superadmin", "consultant"].includes(loggedInUser.roleId?.roleName)
    ) {
      const doc = doctorList.find((d) => d._id === selectedDoctor);
      return doc ? `${doc.firstName} ${doc.lastName}` : "Danışman Seçiniz";
    }
    return "Kullanıcı Rolü Tanımsız";
  }, [loggedInUser, selectedDoctor, doctorList]);

  // Filter services based on selected doctor with useMemo for performance
  const filteredServices = useMemo(() => {
    if (!servicesData || !selectedDoctor) return [];
    
    const doctorName = getSelectedDoctorName();
    
    // Filter by both doctor name and serviceType matching appointmentType
    return servicesData.filter(service => 
      service.provider === doctorName &&
      service.serviceType === appointmentType &&
      service.status === "Aktif"
    );
  }, [servicesData, selectedDoctor, appointmentType, getSelectedDoctorName]);

  // Handle service selection change with useCallback
  const handleServiceChange = useCallback((serviceId) => {
    setSelectedService(serviceId);
  }, []);

  // Memoize appointment fetching to avoid redundant fetches
  const refreshAppointments = useCallback(async (doctorId) => {
    // Önce engelleyici flag'i aktif et
    setPreventAutoPopup(true);
    
    const res = await getCalendarAppointments(doctorId, currentWeekStart.toISOString());
    if (res.success) {
      setAppointments(res.data);
      setPaymentRefreshTrigger((prev) => prev + 1);
      setSelectedAppointment(null);
      setRebookBookingId(null);
    }
    
    // Belirli bir süre sonra flag'i devre dışı bırak (3 saniye daha uzun bir süre)
    setTimeout(() => {
      setPreventAutoPopup(false);
    }, 3000);
  }, [currentWeekStart]);

  // Add back getFilteredServices for backward compatibility
  const getFilteredServices = useCallback(() => {
    return filteredServices;
  }, [filteredServices]);

  // Optimize form data reset with useCallback
  const resetFormData = useCallback(() => {
    setParticipantCount(1);
    setParticipantNames([""]);
    setParticipantPhones([""]);
    setPhoneErrors([""]);
    setDescription("");
    setRebookBookingId(null);
    setIsRecurring(true);
    setEndDate(null);
    setUpdateAllInstances(false);
    setAppointmentType("");
    setSelectedService("");
  }, []);

  // "Yeni Randevu Oluştur" butonuna basınca: Form modalını varsayılan şekilde açar.
  const handleNewAppointment = () => {
    setEditMode(false);
    if (!selectedAppointment) {
      setSelectedAppointment({
        dayIndex: selectedCell.dayIndex,
        timeIndex: selectedCell.timeIndex,
        appointmentDate: selectedCell.appointmentDate,
        participants: [],
      });
    }
    resetFormData();
    setShowChoiceModal(false);
    setShowModal(true);
  };

  // "Randevu Yinele" butonuna basınca: Varolan randevuların listesini gösteren modalı açar.
  const handleRebookAppointment = () => {
    setShowChoiceModal(false);
    setShowRebookModal(true);
    setEditMode(false);
  };

  // Randevu Yinele listesinden bir randevu seçildiğinde:
  const selectRebookAppointment = (appt) => {
    // Eğer appt.bookingId varsa o değeri al, yoksa appt._id'yi kullan
    setRebookBookingId(appt.bookingId || appt._id);

    // Önemli: Randevu tarihini seçilen hücrenin gün ve saat indeksine göre yeniden hesapla
    const newAppointmentDate = new Date(weekDates[selectedCell.dayIndex]);
    newAppointmentDate.setHours(9 + Math.floor(selectedCell.timeIndex));
    newAppointmentDate.setMinutes(0);
    newAppointmentDate.setSeconds(0);

    setSelectedAppointment({
      ...appt,
      dayIndex: selectedCell.dayIndex,
      timeIndex: selectedCell.timeIndex,
      appointmentDate: newAppointmentDate // Yeni hesaplanmış tarih
    });
    
    setParticipantCount(appt.participants ? appt.participants.length : 1);
    
    // İsim ve telefon bilgilerini ayarla
    if (appt.participants) {
      // Katılımcı isimleri
      setParticipantNames(appt.participants.map((p) => p.name || ""));
      
      // Katılımcı telefon numaraları
      setParticipantPhones(appt.participants.map((p) => p.phone || ""));
      
      // Telefon hatalarını sıfırla
      setPhoneErrors(appt.participants.map(() => ""));
    } else {
      setParticipantNames([""]);
      setParticipantPhones([""]);
      setPhoneErrors([""]);
    }
    
    setDescription(appt.description || "");
    setIsRecurring(appt.isRecurring !== undefined ? appt.isRecurring : true);
    setEndDate(appt.endDate);
    setUpdateAllInstances(false);
    setAppointmentType(appt.appointmentType || "");
    setSelectedService(appt.serviceId || "");
    setShowRebookModal(false);
    setShowModal(true);
  };

  // Kişi sayısı değiştiğinde isimleri ve telefonları güncelleme
  const handleParticipantCountChange = (count) => {
    setParticipantCount(count);
    const currentNames = [...participantNames];
    const currentPhones = [...participantPhones];
    const currentPhoneErrors = [...phoneErrors];
    
    while (currentNames.length < count) {
      currentNames.push("");
      currentPhones.push("");
      currentPhoneErrors.push("");
    }
    
    currentNames.splice(count);
    currentPhones.splice(count);
    currentPhoneErrors.splice(count);
    
    setParticipantNames(currentNames);
    setParticipantPhones(currentPhones);
    setPhoneErrors(currentPhoneErrors);
  };

  // Validate the form before submitting
  const validateForm = () => {
    let isValid = true;
    const errors = {
      appointmentType: false,
      selectedService: false,
      participantNames: Array(participantCount).fill(false),
      participantPhones: Array(participantCount).fill(false)
    };

    // Validate appointment type
    if (!appointmentType) {
      errors.appointmentType = true;
      isValid = false;
    }

    // Validate service selection only if services are available for the selected type
    if (appointmentType && filteredServices.length > 0 && !selectedService) {
      errors.selectedService = true;
      isValid = false;
    }

    // Validate participant names
    participantNames.forEach((name, index) => {
      if (!name || name.trim() === '') {
        errors.participantNames[index] = true;
        isValid = false;
      }
    });

    // Validate phone numbers
    participantPhones.forEach((phone, index) => {
      if (!phone || !validateTurkishPhoneNumber(phone)) {
        errors.participantPhones[index] = true;
        isValid = false;
      }
    });

    setFormErrors(errors);
    return isValid;
  };

  // Update handleSubmit to use validateForm
  const handleSubmit = async () => {
    if (!selectedAppointment) return;
    
    if (!validateForm()) {
      return;
    }
    
    const doctorId =
      loggedInUser?.roleId?.roleName === "doctor"
        ? loggedInUser._id
        : selectedDoctor;
        
    // Randevu tarihini kontrol et - eğer tanımlı değilse, seçilen hücreye göre oluştur
    let appointmentDate = selectedAppointment.appointmentDate;
    
    if (!appointmentDate) {
      const newDate = new Date(weekDates[selectedAppointment.dayIndex]);
      newDate.setHours(9 + Math.floor(selectedAppointment.timeIndex));
      newDate.setMinutes(0);
      newDate.setSeconds(0);
      appointmentDate = newDate;
    }
        
    const payload = {
      dayIndex: selectedAppointment.dayIndex,
      timeIndex: selectedAppointment.timeIndex,
      doctorId,
      participants: participantNames.map((name, index) => ({ 
        name, 
        phone: participantPhones[index] || "" 
      })),
      description,
      appointmentDate: appointmentDate,
      isRecurring, // Tekrarlı randevu ayarı
      endDate, // Bitiş tarihi
      appointmentType, // Randevu Tipi
      serviceId: selectedService || null // Randevu Hizmeti - boş string yerine null gönder
    };

    if (rebookBookingId) {
      payload.bookingId = rebookBookingId;
    }

    // Sanal instance için güncelleme yapılıyorsa
    if (editMode && selectedAppointment._id && selectedAppointment._id.includes("_instance_")) {
      payload.updateAllInstances = updateAllInstances;
    }

    try {
      if (editMode) {
        const res = await updateCalendarAppointment(
          selectedAppointment._id,
          payload
        );
        if (res.success) {
          refreshAppointments(doctorId);
          setShowModal(false);
        }
      } else {
        const res = await createCalendarAppointment(payload);
        if (res.success) {
          refreshAppointments(doctorId);
          setShowModal(false);
        }
      }
    } catch (err) {
      // API hatası olursa
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert('Randevu kaydedilirken bir hata oluştu.');
      }
    }
  };

  // Sil
  const handleDelete = async () => {
    if (!selectedAppointment) return;
    
    // Sanal instance için silme işlemini başlat
    if (selectedAppointment._id && selectedAppointment._id.includes("_instance_")) {
      setShowDeleteOptionsModal(true);
    } else {
      // Orijinal randevu için randevu tipine göre uygun uyarıyı göster
      if (selectedAppointment.appointmentType === "Rutin Görüşme") {
        // Rutin Görüşme tipli randevu için uzun uyarı göster
        setShowRutinDeleteWarning(true);
      } else {
        // Diğer randevu tipleri için basit onay uyarısı göster
        setShowSimpleDeleteWarning(true);
      }
    }
  };

  // Orijinal randevu silme işlemini onayla - Rutin Görüşme için
  const confirmRutinDelete = async () => {
      const doctorId =
        loggedInUser?.roleId?.roleName === "doctor"
          ? loggedInUser._id
          : selectedDoctor;
          
      const res = await deleteCalendarAppointment(selectedAppointment._id);
      if (res.success) {
        // Silme başarılı olduğunda bookingId'yi sıfırla
        setRebookBookingId(null);
        refreshAppointments(doctorId);
      setShowRutinDeleteWarning(false);
        setShowModal(false);
      }
  };
  
  // Diğer randevular için basit silme onayı
  const confirmSimpleDelete = async () => {
    const doctorId =
      loggedInUser?.roleId?.roleName === "doctor"
        ? loggedInUser._id
        : selectedDoctor;
        
    const res = await deleteCalendarAppointment(selectedAppointment._id);
    if (res.success) {
      // Silme başarılı olduğunda bookingId'yi sıfırla
      setRebookBookingId(null);
      refreshAppointments(doctorId);
      setShowSimpleDeleteWarning(false);
      setShowModal(false);
    }
  };

  // Seçilen silme modu ile randevuyu sil
  const confirmDelete = async () => {
    const doctorId =
      loggedInUser?.roleId?.roleName === "doctor"
        ? loggedInUser._id
        : selectedDoctor;
        
    const res = await deleteCalendarAppointment(selectedAppointment._id, deleteMode);
    
    if (res.success) {
      refreshAppointments(doctorId);
      setShowDeleteOptionsModal(false);
      setShowModal(false);
    }
  };

  // Hücredeki randevuyu bul
  const findAppointmentForCell = (dayIndex, timeIndex) => {
    return appointments.find(
      (appt) => appt.dayIndex === dayIndex && appt.timeIndex === timeIndex
    );
  };

  // Sanal instance mi kontrol et
  const isVirtualInstance = (appointment) => {
    return appointment && appointment.isVirtualInstance;
  };

  // Danışman seçili mi kontrolü için yardımcı fonksiyon
  const isDoctorSelected = () => {
    return selectedDoctor !== "";
  };

  return (
    <div className="bg-[#f4f7fe] font-montserrat p-6 rounded-lg shadow-md w-full h-full bg-white">
      {/* Üst kısım: Danışman seçimi ve tarih kontrolü */}
      <div className="flex justify-between items-center mb-4">
        {/* Danışman seçimi */}
        {loggedInUser?.roleId?.roleName !== "doctor" && (
          <div className="mb-0">
            <label className="mr-2 font-medium">Danışman Seç:</label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="border p-1 cursor-pointer rounded-md"
            >
              <option value="">Danışman Seçiniz</option>
              {doctorList.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.firstName} {doc.lastName}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Tarih Kontrolü - Danışman seçili değilse devre dışı */}
        <div className="flex items-center space-x-2 relative">
          <button 
            onClick={isDoctorSelected() ? goToPreviousWeek : undefined}
            className={`p-2 rounded-full ${
              isDoctorSelected() 
                ? "hover:bg-gray-200 cursor-pointer" 
                : "opacity-50 cursor-not-allowed"
            }`}
            disabled={!isDoctorSelected()}
          >
            <FaChevronLeft />
          </button>
          
          <button 
            onClick={isDoctorSelected() ? () => setShowDatePicker(!showDatePicker) : undefined}
            className={`flex items-center space-x-1 bg-white p-2 px-3 rounded-md border ${
              isDoctorSelected() 
                ? "hover:bg-gray-100 cursor-pointer" 
                : "opacity-50 cursor-not-allowed"
            }`}
            disabled={!isDoctorSelected()}
          >
            <FaRegCalendarAlt />
            <span>
              {formatDate(currentWeekStart, "d MMM")} - {formatDate(addDays(currentWeekStart, 6), "d MMM yyyy")}
            </span>
          </button>
          
          <button 
            onClick={isDoctorSelected() ? goToNextWeek : undefined}
            className={`p-2 rounded-full ${
              isDoctorSelected() 
                ? "hover:bg-gray-200 cursor-pointer" 
                : "opacity-50 cursor-not-allowed"
            }`}
            disabled={!isDoctorSelected()}
          >
            <FaChevronRight />
          </button>
          
          {/* Tarih Seçici Popup - yalnızca isDoctorSelected() true ise göster */}
          {showDatePicker && isDoctorSelected() && (
            <div className="absolute top-12 right-0 bg-white rounded-lg shadow-lg border p-4 z-20 w-auto min-w-[300px]">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-center font-medium text-gray-700">Hafta Seçin</h3>
                
                {/* Ay seçme butonu - ekledik */}
                <button
                  onClick={() => {
                    setShowMonthPicker(true);
                    setShowDatePicker(false);
                  }}
                  className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded-md flex items-center"
                >
                  <span>{formatMonthName(currentMonth)}</span>
                  <FaChevronRight className="ml-1 text-xs" />
                </button>
              </div>
              
              {/* Hafta grid görünümü */}
              <div className="grid grid-cols-3 gap-2">
                {(() => {
                  // İçinde bulunduğumuz haftadan önceki 4 hafta ve sonraki 7 hafta (toplam 12 hafta)
                  const weeksToShow = 12;
                  const pastWeeksToShow = 4; // Geçmişteki hafta sayısı
                  
                  // Şu anki haftadan 4 hafta geriye git (başlangıç noktası)
                  const startDate = subWeeks(currentWeekStart, pastWeeksToShow);
                  
                  return Array.from({ length: weeksToShow }, (_, weekOffset) => {
                    const weekStartDate = addWeeks(startDate, weekOffset);
                    const weekEndDate = addDays(weekStartDate, 6);
                    
                    const isCurrentWeek = 
                      format(weekStartDate, 'yyyy-MM-dd') === format(currentWeekStart, 'yyyy-MM-dd');
                    
                    return (
                      <button
                        key={`week-${weekOffset}`}
                        onClick={() => goToSpecificWeek(weekStartDate)}
                        className={`
                          p-2 text-center rounded-md transition-colors
                          ${isCurrentWeek 
                            ? 'bg-[#007E85] text-white' 
                            : 'bg-gray-100 hover:bg-[#c6eef0] text-gray-800'}
                        `}
                      >
                        <div className="text-sm font-medium">
                          {formatDate(weekStartDate, "d MMM")}
                        </div>
                        <div className="text-xs">
                          - {formatDate(weekEndDate, "d MMM")}
                        </div>
                      </button>
                    );
                  });
                })()}
              </div>
              
              <div className="mt-4 flex justify-between">
                <button 
                  onClick={() => goToSpecificWeek(getWeekStart(new Date()))} 
                  className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded"
                >
                  Bugün
                </button>
                <button 
                  onClick={() => setShowDatePicker(false)} 
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded"
                >
                  Kapat
                </button>
              </div>
            </div>
          )}
          
          {/* Ay Seçici Popup - yalnızca isDoctorSelected() true ise göster */}
          {showMonthPicker && isDoctorSelected() && (
            <div className="absolute top-12 right-0 bg-white rounded-lg shadow-lg border p-4 z-20 w-auto min-w-[300px]">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-center font-medium text-gray-700">Ay Seçin</h3>
                
                {/* Hafta seçme geri butonu */}
                <button
                  onClick={() => {
                    setShowMonthPicker(false);
                    setShowDatePicker(true);
                  }}
                  className="text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 px-2 py-1 rounded-md"
                >
                  Hafta Seçimine Dön
                </button>
              </div>
              
              {/* Ay grid görünümü */}
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 24 }, (_, monthOffset) => {
                  // 12 ay geriden başla (1 yıl önce) ve 2 yıl ileriye kadar göster (toplam 24 ay)
                  const targetMonth = addMonths(new Date(), monthOffset - 12);
                  const isCurrentMonth = 
                    format(targetMonth, 'yyyy-MM') === format(currentMonth, 'yyyy-MM');
                  
                  return (
                    <button
                      key={`month-${monthOffset}`}
                      onClick={() => goToMonth(targetMonth)}
                      className={`
                        p-2 text-center rounded-md transition-colors
                        ${isCurrentMonth 
                          ? 'bg-[#007E85] text-white' 
                          : 'bg-gray-100 hover:bg-[#c6eef0] text-gray-800'}
                      `}
                    >
                      <div className="text-sm font-medium">
                        {formatDate(targetMonth, "MMM")}
                      </div>
                      <div className="text-xs">
                        {formatDate(targetMonth, "yyyy")}
                      </div>
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-4 flex justify-between">
                <button 
                  onClick={() => goToMonth(new Date())} 
                  className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded"
                >
                  Bu Ay
                </button>
                <button 
                  onClick={() => setShowMonthPicker(false)} 
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded"
                >
                  Kapat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Uyarı Mesajı - Danışman seçilmediğinde göster */}
      {!isDoctorSelected() && loggedInUser?.roleId?.roleName !== "doctor" && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 mb-4 rounded-md text-center">
          Takvimi görüntülemek için lütfen bir danışman seçin
        </div>
      )}

      {/* Takvim tablosu - Danışman seçili değilse gri tonlama yap */}
      <div 
        className={`md:max-h-[43.75rem] overflow-auto ${!isDoctorSelected() ? "opacity-50" : ""} 
        overflow-x-auto md:overflow-x-hidden border rounded-lg`}
      >
        <table className="table-fixed w-full border-collapse border border-gray-300 min-w-[750px] md:min-w-0">
          <thead>
            <tr>
              <th
                colSpan={DAYS.length + 1}
                className="border border-gray-300 p-2 bg-[#007E85] text-white text-lg font-semibold text-center"
              >
                {getSelectedDoctorName()}
              </th>
            </tr>
            <tr>
              <th className="border border-gray-300 p-2 bg-gray-50 w-[15%]"></th>
              {DAYS.map((day, index) => (
                <th
                  key={index}
                  className="border border-gray-300 p-2 bg-gray-50 text-center w-[calc(85%/7)]"
                >
                  <div>
                    {/* Masaüstünde tam isim, mobilde kısaltılmış isim */}
                    <span className="hidden md:inline">{day}</span>
                    <span className="md:hidden">{DAYS_SHORT[index]}</span>
                  </div>
                  <div className="text-xs font-normal mt-1 text-gray-500">
                    {formatDate(weekDates[index], "d MMM")}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((slot, timeIndex) => (
              <tr key={timeIndex}>
                <td className="border border-gray-300 p-2 bg-[#F7F6FE] text-center font-medium">
                  {slot}
                </td>
                {DAYS.map((day, dayIndex) => {
                  const appt = findAppointmentForCell(dayIndex, timeIndex);
                  return (
                    <td
                      key={dayIndex}
                      onClick={isDoctorSelected() ? () => handleCellClick(dayIndex, timeIndex, appt) : undefined}
                      className={`relative border border-gray-300 p-2 md:p-2 h-[60px] md:h-auto ${
                        appt ? getPastelColor(appt) : "bg-white"
                      } ${
                        isDoctorSelected() ? "cursor-pointer" : "cursor-not-allowed"
                      }`}
                      title={
                        !isDoctorSelected()
                          ? "Danışman seçiniz"
                          : appt && appt.description
                          ? `Randevu Açıklaması: ${appt.description}`
                          : ""
                      }
                    >
                      {appt ? (
                        <PaymentStatusCell
                          appointment={appt}
                          onClickPayNow={() => {
                            if (isDoctorSelected()) {
                              setSelectedAppointment(appt);
                              setPaymentOpen(true);
                            }
                          }}
                          refreshTrigger={paymentRefreshTrigger}
                          fetchAppointments={() => {
                            const doctorId =
                              loggedInUser?.roleId?.roleName === "doctor"
                                ? loggedInUser._id
                                : selectedDoctor;
                            refreshAppointments(doctorId);
                          }}
                          preventAutoPopup={preventAutoPopup}
                        />
                      ) : (
                        <div className="text-gray-400 italic">Boş</div>
                      )}

                      {/* Sanal Instance Göstergesi */}
                      {appt && isVirtualInstance(appt) && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-blue-400" title="Tekrarlı Randevu"></div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Seçim Modalı: Hücrede randevu yoksa iki seçenek sunar */}
      {showChoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded shadow-md w-80">
            <h2 className="text-lg font-bold mb-4 text-center">
              Randevu Oluşturun/Yineleyin
            </h2>
            <div className="flex justify-around">
              <button
                onClick={handleNewAppointment}
                className="bg-[#399AA1] hover:bg-[#007E85] text-white text-sm px-4 py-2 rounded-lg mr-2"
              >
                Yeni Randevu Oluştur
              </button>
              <button
                onClick={handleRebookAppointment}
                className="bg-orange-500 hover:bg-orange-700 text-white text-sm px-4 py-2 rounded-lg"
              >
                Randevu Yinele
              </button>
            </div>
            <button
              onClick={() => setShowChoiceModal(false)}
              className="mt-4 w-full bg-gray-300 hover:bg-gray-400 hover:text-white px-4 py-2 rounded"
            >
              Vazgeç
            </button>
          </div>
        </div>
      )}

      {/* Randevu Yinele Modalı: Varolan randevuların listesini gösterir */}
      {showRebookModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50"
          onClick={() => setShowRebookModal(false)} // Modal dışına tıklanınca kapanır
        >
          <div
            className="relative bg-white p-4 rounded shadow-md w-96 max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()} // Modal içindeki tıklamalar kapanmayı tetiklemesin
          >
            <button
              onClick={() => setShowRebookModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
            >
              <IoIosCloseCircleOutline className="text-red-500 hover:text-gray-500" />
            </button>
            <h2 className="text-xl font-bold mb-4 text-center">
              Randevu Yinele - Seçiniz
            </h2>
            {appointments.length > 0 ? (
              appointments
                .slice()
                .sort(
                  (a, b) => a.dayIndex - b.dayIndex || a.timeIndex - b.timeIndex
                )
                .map((appt) => (
                  <div
                    key={appt._id}
                    className="p-2 border-b cursor-pointer hover:bg-gray-100"
                    onClick={() => selectRebookAppointment(appt)}
                  >
                    <div>
                      <span className="font-semibold">
                        Gün: {DAYS[appt.dayIndex]}, Saat:{" "}
                        {TIME_SLOTS[appt.timeIndex]}
                      </span>
                    </div>
                    <div className="text-sm">
                      {appt.participants.map((p) => p.name).join(" - ")}
                    </div>
                    {appt.description && (
                      <div className="text-xs text-gray-600">
                        {appt.description}
                      </div>
                    )}
                  </div>
                ))
            ) : (
              <div className="text-center text-gray-500">
                Randevu bulunamadı.
              </div>
            )}
            <button
              onClick={() => setShowRebookModal(false)}
              className="mt-4 w-full bg-gray-300 hover:bg-gray-400 hover:text-white px-4 py-2 rounded"
            >
              Vazgeç
            </button>
          </div>
        </div>
      )}

      {/* Randevu Modalı: Yeni randevu oluşturma veya düzenleme formu */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded shadow-md w-96 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-2">
              {editMode
                ? "Randevu Düzenle"
                : rebookBookingId
                ? "Randevu Yinele"
                : "Yeni Randevu Oluştur"}
            </h2>
            {/* Danışman Adı */}
            <div className="mb-2">
              <label className="block font-medium">Danışman</label>
              <input
                type="text"
                value={getSelectedDoctorName()}
                readOnly
                className="border p-1 w-full cursor-pointer rounded-md"
              />
            </div>
            {/* Açıklama Alanı */}
            <div className="mb-2">
              <label className="block font-medium">Açıklama</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border p-1 w-full cursor-pointer rounded-md resize-none"
                rows="3"
                placeholder="Randevu ile ilgili açıklama giriniz..."
              />
            </div>
            
            {/* Tekrarlı Randevu Seçeneği */}
            <div className="mb-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-[#007E85] rounded"
                />
                <span className="text-gray-700">Tekrarlı Randevu</span>
              </label>
            </div>
            
            {/* Tekrarlı Randevu Bitiş Tarihi */}
            {isRecurring && (
              <div className="mb-2">
                <label className="block font-medium">Bitiş Tarihi (Opsiyonel)</label>
                <input
                  type="date"
                  value={endDate ? new Date(endDate).toISOString().split('T')[0] : ""}
                  onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                  className="border p-1 w-full cursor-pointer rounded-md"
                  placeholder="Sonsuza kadar tekrarlanır"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Boş bırakırsanız, randevu siz silene kadar tekrarlanacaktır.
                </p>
              </div>
            )}
            
            {/* Tekrarlı Randevu Güncelleme Seçeneği */}
            {editMode && selectedAppointment && isVirtualInstance(selectedAppointment) && (
              <div className="mb-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={updateAllInstances}
                    onChange={(e) => setUpdateAllInstances(e.target.checked)}
                    className="form-checkbox h-4 w-4 text-[#007E85] rounded"
                  />
                  <span className="text-gray-700">Tüm gelecek randevuları güncelle</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Seçiliyse tüm tekrarlı randevular güncellenecek, değilse sadece bu tarih için güncellenir.
                </p>
              </div>
            )}
            
            {/* Randevu Tipi Dropdown */}
            <div className="mb-2">
              <label className="block font-medium">
                Randevu Tipi
                <RequiredIndicator />
              </label>
              <select
                value={appointmentType}
                onChange={(e) => {
                  setAppointmentType(e.target.value);
                  // Clear appointment type error
                  setFormErrors(prev => ({...prev, appointmentType: false}));
                }}
                className={`border p-1 w-full cursor-pointer rounded-md ${
                  formErrors.appointmentType ? 'border-red-500 bg-red-50' : ''
                }`}
              >
                <option value="">Seçiniz</option>
                <option value="Ön Görüşme">Ön Görüşme</option>
                <option value="Rutin Görüşme">Rutin Görüşme</option>
                <option value="Muayene">Muayene</option>
              </select>
              {formErrors.appointmentType && (
                <p className="text-red-500 text-xs mt-1">Randevu tipi seçilmelidir</p>
              )}
            </div>
            
            {/* Randevu Hizmeti Dropdown */}
            <div className="mb-2">
              <label className="block font-medium">
                Randevu Hizmeti
                {appointmentType && filteredServices.length > 0 && <RequiredIndicator />}
              </label>
              <div className="flex flex-col">
                <select
                  value={selectedService}
                  onChange={(e) => {
                    handleServiceChange(e.target.value);
                    // Clear service error
                    setFormErrors(prev => ({...prev, selectedService: false}));
                  }}
                  className={`border p-1 w-full cursor-pointer rounded-md ${
                    !appointmentType ? "bg-gray-100" : formErrors.selectedService ? 'border-red-500 bg-red-50' : ''
                  }`}
                  disabled={!appointmentType || filteredServices.length === 0}
                >
                  <option value="">Seçiniz</option>
                  {filteredServices.map((service) => (
                    <option key={service._id} value={service._id}>
                      {service.serviceName}
                    </option>
                  ))}
                </select>
                {!appointmentType && (
                  <p className="text-amber-500 text-xs mt-1">
                    Önce Randevu Tipi seçmelisiniz
                  </p>
                )}
                {appointmentType && filteredServices.length === 0 && (
                  <p className="text-red-500 text-xs mt-1">
                    {`"${appointmentType}" tipi için tanımlı hizmet bulunamadı`}
                  </p>
                )}
                {formErrors.selectedService && (
                  <p className="text-red-500 text-xs mt-1">Randevu hizmeti seçilmelidir</p>
                )}
              </div>
            </div>
            
            {/* Kişi Sayısı */}
            <div className="mb-2">
              <label className="block font-medium">Kişi Sayısı</label>
              <select
                value={participantCount}
                onChange={(e) =>
                  handleParticipantCountChange(parseInt(e.target.value))
                }
                className="border p-1 w-full cursor-pointer rounded-md"
              >
                {[1, 2, 3, 4, 5, 6].map((cnt) => (
                  <option key={cnt} value={cnt}>
                    {cnt}
                  </option>
                ))}
              </select>
            </div>
            {/* Kişi İsimleri ve Telefon Numaraları */}
            {Array.from({ length: participantCount }, (_, i) => (
              <div key={i} className="mb-4">
                <div className="mb-2">
                <label className="block text-sm font-medium">
                  Kişi {i + 1} Adı
                  <RequiredIndicator />
                </label>
                <input
                  type="text"
                  value={participantNames[i] || ""}
                  onChange={(e) => {
                    const newNames = [...participantNames];
                    newNames[i] = e.target.value;
                    setParticipantNames(newNames);
                    
                    // Clear name error when field is filled
                    if (e.target.value.trim() !== '') {
                      const newErrors = {...formErrors};
                      newErrors.participantNames[i] = false;
                      setFormErrors(newErrors);
                      setParticipantError(false);
                    }
                  }}
                  className={`border p-1 w-full cursor-pointer rounded-md ${
                    formErrors.participantNames[i] || (participantError && (!participantNames[i] || participantNames[i].trim() === ''))
                    ? 'border-red-500 bg-red-50' 
                    : ''
                  }`}
                />
                {(formErrors.participantNames[i] || (participantError && (!participantNames[i] || participantNames[i].trim() === ''))) && (
                  <p className="text-red-500 text-xs mt-1">Hasta ismi boş olamaz</p>
                )}
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Kişi {i + 1} Telefon
                    <RequiredIndicator />
                  </label>
                  <input
                    type="text"
                    value={participantPhones[i] || ""}
                    onChange={(e) => handlePhoneChange(i, e.target.value)}
                    className={`border p-1 w-full cursor-pointer rounded-md ${
                      formErrors.participantPhones[i] || phoneErrors[i] ? 'border-red-500 bg-red-50' : ''
                    }`}
                    placeholder="05XX XXX XX XX"
                  />
                  {phoneErrors[i] && (
                    <p className="text-red-500 text-xs mt-1">{phoneErrors[i]}</p>
                  )}
                  {formErrors.participantPhones[i] && !phoneErrors[i] && (
                    <p className="text-red-500 text-xs mt-1">Telefon numarası gereklidir</p>
                  )}
                  {!phoneErrors[i] && !formErrors.participantPhones[i] && (
                    <p className="text-gray-500 text-xs mt-1">
                      Telefon numarası 0 ile başlamalıdır (Örn: 05XX XXX XX XX)
                    </p>
                  )}
                </div>
              </div>
            ))}
            {/* Butonlar */}
            <div className="flex justify-end gap-2 mt-4">
              {editMode && (
                <button
                  onClick={handleDelete}
                  className="bg-red-500 text-white px-4 py-1 rounded"
                >
                  Sil
                </button>
              )}
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 px-4 py-1 rounded"
              >
                Vazgeç
              </button>
              {loggedInUser?.roleId?.roleName !== "doctor" && (
                <button
                  onClick={handleSubmit}
                  className="bg-[#007E85] text-white hover:bg-[#00696F] px-4 py-1 rounded"
                >
                  Kaydet
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ödeme Popup'ı */}
      {paymentOpen && (
        <div className="flex flex-row justify-center text-sm items-center px-4 py-[0.875rem] space-x-2">
          <PaymentPopup
            isOpen={paymentOpen}
            onClose={() => {
              setPaymentOpen(false);
              
              // Ödeme popup'ını kapattığımızda otomatik ReadOnly popup'ı engelle
              setPreventAutoPopup(true);
              
              // Daha uzun bir süre (3 saniye) engelleyici aktif kalsın
              setTimeout(() => {
                setPreventAutoPopup(false); 
              }, 3000);
            }}
            servicesData={servicesData}
            row={selectedAppointment}
            onPaymentSuccess={() => {
              // Önce engelleyici flag'i aktif et
              setPreventAutoPopup(true);
              
              const doctorId =
                loggedInUser?.roleId?.roleName === "doctor"
                  ? loggedInUser._id
                  : selectedDoctor;
              refreshAppointments(doctorId);
            }}
            isCalendar={true}
          />
        </div>
      )}

      {/* Silme Seçenekleri Popup */}
      {showDeleteOptionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <button
              onClick={() => setShowDeleteOptionsModal(false)}
              className="absolute top-2 right-2 text-red-500 hover:text-gray-600"
            >
              <IoIosCloseCircleOutline className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Randevu Silme Seçenekleri</h2>
            
            <p className="mb-4 text-gray-600">
              Tekrarlı randevuyu silme şeklini seçin:
            </p>
            
            <div className="space-y-3 mb-6">
              <label className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="deleteMode"
                  value="single"
                  checked={deleteMode === "single"}
                  onChange={() => setDeleteMode("single")}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium text-gray-800">Sadece bu tarihi sil</p>
                  <p className="text-sm text-gray-500">Bu tarih için randevu iptal edilir, diğer tarihler etkilenmez</p>
                </div>
              </label>
              
              <label className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="deleteMode"
                  value="afterThis"
                  checked={deleteMode === "afterThis"}
                  onChange={() => setDeleteMode("afterThis")}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium text-gray-800">Bu tarihten sonrakileri sil</p>
                  <p className="text-sm text-gray-500">Bu tarih ve sonraki tüm tekrarlar iptal edilir</p>
                </div>
              </label>
              
              <label className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="deleteMode"
                  value="allSeries"
                  checked={deleteMode === "allSeries"}
                  onChange={() => setDeleteMode("allSeries")}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium text-gray-800">Tüm tekrarlı randevuları sil</p>
                  <p className="text-sm text-gray-500">Bu randevunun tüm geçmiş ve gelecek tekrarları silinir</p>
                </div>
              </label>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteOptionsModal(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md text-gray-800"
              >
                İptal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-md text-white"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Rutin Görüşme Randevu Silme Uyarısı */}
      {showRutinDeleteWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <button
              onClick={() => setShowRutinDeleteWarning(false)}
              className="absolute top-2 right-2 text-red-500 hover:text-gray-600"
            >
              <IoIosCloseCircleOutline className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Rutin Görüşme Silme Uyarısı</h2>
            
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-gray-700 leading-relaxed">
                Bu, tarafınızdan oluşturulan orijinal bir Rutin Görüşme randevusudur. Bu randevuyu sildiğinizde, buna bağlı tüm tekrarlı randevular da silinecektir.
              </p>
              <p className="mt-2 text-gray-700 leading-relaxed">
                İlerleyen tarihlerde aynı randevuyu tekrar oluşturmanız gerekebilir.
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRutinDeleteWarning(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md text-gray-800"
              >
                İptal Et
              </button>
              <button
                onClick={confirmRutinDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-md text-white"
              >
                Randevuyu Sil
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Basit Randevu Silme Onayı */}
      {showSimpleDeleteWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <button
              onClick={() => setShowSimpleDeleteWarning(false)}
              className="absolute top-2 right-2 text-red-500 hover:text-gray-600"
            >
              <IoIosCloseCircleOutline className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Randevu Silme Onayı</h2>
            
            <p className="mb-6 text-gray-700">
              Bu randevuyu silmek istediğinize emin misiniz?
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSimpleDeleteWarning(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md text-gray-800"
              >
                İptal Et
              </button>
              <button
                onClick={confirmSimpleDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-md text-white"
              >
                Randevuyu Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
