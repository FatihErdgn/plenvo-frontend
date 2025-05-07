import React, { useEffect, useState } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import {
  createPayment,
  updatePayment, // updatePayment fonksiyonunu da ekliyoruz
  getPaymentsByAppointment,
} from "../../../services/paymentService";

/**
 * PaymentPopup bileşeni
 * Props:
 * - isOpen: Popup açık mı?
 * - onClose: Popup'ı kapatma fonksiyonu
 * - row: Randevu (appointment) bilgileri (appointmentId, doktor, hasta bilgileri vb.)
 * - servicesData: Hizmetlerin listesini içeren JSON (doktor hizmetleri ve "Genel Hizmet" kayıtları)
 * - onPaymentSuccess: (Opsiyonel) Ödeme başarılı olduktan sonra çağrılacak callback (örn. randevuları yeniden sorgulamak için)
 */
export default function PaymentPopup({
  isOpen,
  onClose,
  row,
  servicesData,
  onPaymentSuccess,
  isCalendar,
}) {
  // Doktora ait hizmeti bul (doktor adı ve "Aktif" durumu kontrolü)
  let matchedService = null;

  // Tekrarlı randevularda (recurringParentId varsa), doktor ve randevu tipi bilgilerini yönet
  const appointmentData = { ...row };

  // Tekrarlı randevu instanclarında doktorName ve appointmentType eksik olabilir
  // Bu durumda eksik verileri doldur
  useEffect(() => {
    // Randevu tipi ve doktor adı eksikse ve ID'de "_instance_" varsa tekrarlı randevu olabilir
    const isRecurringInstance = row._id && row._id.includes("_instance_");

    if (
      isCalendar &&
      isRecurringInstance &&
      (!row.appointmentType || !row.doctorName)
    ) {
      // Takvim randevusunda eksik veri varsa ana randevudan bilgileri almak için
      // Parent ID'yi tanımla
      const parentId = row._id?.split("_instance_")[0];

      if (parentId) {
        // Burada normalde API'ye istek atıp ana randevuyu getirmek gerekebilir
        // Ancak basit bir çözüm olarak UI'da gösterilen alanları dolduralım

        // Eğer doktor ID'si varsa ama adı yoksa sadece UI için ekleyelim
        if (
          row.doctorId &&
          !row.doctorName &&
          row.doctorFirstName &&
          row.doctorLastName
        ) {
          appointmentData.doctorName = `${row.doctorFirstName} ${row.doctorLastName}`;
        }

        // Eğer appointmentType yoksa ve parent formdan geliyorsa göster
        if (!row.appointmentType && row.recurringParentType) {
          appointmentData.appointmentType = row.recurringParentType;
        } else if (!row.appointmentType) {
          // Varsayılan olarak "Muayene" tipini kullan
          appointmentData.appointmentType = "Muayene";
        }

        // Eğer artık randevu tipi ve doktor adı varsa, uyarıyı kaldır
        if (appointmentData.appointmentType && appointmentData.doctorName) {
          setShowAppointmentTypeWarning(false);
        }
      }
    }
  }, [row, isCalendar]);

  if (isCalendar) {
    // Önce serviceId'ye göre hizmeti bul (varsa)
    if (appointmentData?.serviceId) {
      matchedService = servicesData.find(
        (s) => s._id === appointmentData.serviceId && s.status === "Aktif"
      );
    }
    // Eğer serviceId ile hizmet bulunamadıysa, appointmentType'a göre ara
    else if (appointmentData?.appointmentType) {
      // Randevu tipi seçiliyse, SADECE o tipe uygun hizmeti ara
      matchedService = servicesData.find(
        (s) =>
          s.provider === appointmentData?.doctorName &&
          s.status === "Aktif" &&
          s.serviceType === appointmentData.appointmentType // serviceType ile appointmentType eşleşmeli
      );

      // Eşleşen hizmet yoksa matchedService null kalacak, ücreti 0 TL olacak
    } else {
      // Randevu tipi seçili değilse, matchedService null olmalı (ücret 0 TL olacak)
      matchedService = null;
    }
  } else {
    // Takvim randevusu değilse (ConsultantTable için), normal hizmet seçimi
    matchedService = servicesData.find(
      (s) => s.provider === appointmentData.doctorName && s.status === "Aktif"
    );
  }

  const initialDoctorFee = matchedService ? matchedService.serviceFee : 0;

  let clientFirstName = "";
  let clientLastName = "";
  let doctorName = "";
  let allNames = "";
  if (isCalendar) {
    allNames =
      appointmentData?.participants?.map((p) => p.name).join(" - ") || "";
    doctorName = appointmentData?.doctorName;
  } else {
    clientFirstName = appointmentData.clientFirstName;
    clientLastName = appointmentData.clientLastName;
    doctorName = appointmentData.doctorName;
  }

  // Ek hizmetler: "Genel Hizmet" sağlayıcısı ve aktif olanlar
  const extraServices = servicesData.filter(
    (s) => s.provider === "Genel Hizmet" && s.status === "Aktif"
  );

  // Bileşen state'leri
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [paymentMode, setPaymentMode] = useState(null); // "full" veya "partial"
  const [paymentType, setPaymentType] = useState(null); // "nakit", "kredi", "sigorta", "IBAN"
  const [partialAmount, setPartialAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [sumPaid, setSumPaid] = useState(0);
  const [existingPayment, setExistingPayment] = useState(null);
  const [showAppointmentTypeWarning, setShowAppointmentTypeWarning] =
    useState(false); // Randevu tipi uyarısı
  
  // Önceki/süresi dolmuş ödeme bilgisi
  const [previousPaymentInfo, setPreviousPaymentInfo] = useState(null);

  // Yeni: Ödeme periyodu seçimi
  const [paymentPeriod, setPaymentPeriod] = useState("single"); // "single", "monthly", "quarterly", "biannual"
  const [showRecurringOptions, setShowRecurringOptions] = useState(false); // Tekrarlı seçenekleri göster/gizle

  // Sadece "Rutin Görüşme" randevu tipinde ek hizmet seçildiğinde doktor ücreti sıfırlansın
  // Diğer randevu tipleri (Ön Görüşme, Muayene vb.) için sıfırlanmamalı
  const doctorFee =
    isCalendar &&
    selectedExtras.length > 0 &&
    appointmentData.appointmentType === "Rutin Görüşme"
      ? 0
      : initialDoctorFee;

  // Eğer daha önce ödeme yapılmışsa, toplam tutar Payment belgesindeki serviceFee üzerinden alınır.
  // Aksi halde, toplam tutar doktor ücreti + seçilen ek hizmetlerin toplamıdır.
  const totalCost = existingPayment
    ? Number(existingPayment.serviceFee)
    : doctorFee + selectedExtras.reduce((acc, svc) => acc + svc.serviceFee, 0);
  // Kalan tutar = (toplam ücret) - (daha önce ödenen)
  const remainingAmount = Math.max(totalCost - sumPaid, 0);

  // ESC tuşuna basıldığında popup'ı kapat
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Popup açıldığında ilgili randevuya ait ödeme kayıtlarını getir
  useEffect(() => {
    async function fetchPayments() {
      try {
        const res = await getPaymentsByAppointment(row._id);
        // console.log("Önceki ödemeler alındı:", res);
        if (res.payments && res.payments.length > 0) {
          const payments = res.payments;
          
          // Ödemeleri isValid durumuna göre ayır
          const validPayments = payments.filter(payment => payment.isValid === true);
          const expiredPayments = payments.filter(payment => payment.isValid === false);
          
          // Ödemeleri isCompleted durumuna göre de ayır (tamamlanmış ve kısmi ödemeler)
          const completedPayments = payments.filter(payment => payment.isCompleted === true);
          const partialPayments = payments.filter(payment => payment.isValid === true && payment.isCompleted === false);
          
          // Toplam ödenen miktarı hesapla - ÖNEMLİ: Sadece geçerli ödemeleri hesaba kat
          const totalPaid = validPayments.reduce(
            (acc, payment) => acc + Number(payment.paymentAmount),
            0
          );
          setSumPaid(totalPaid);
          
          // Eğer geçerli ve tamamlanmış ödeme varsa, onu mevcut ödeme olarak ayarla
          if (completedPayments.length > 0) {
            setExistingPayment(completedPayments[0]); // İlk tamamlanmış ödeme kaydını kullan
            
            // Önceki ödeme açıklamasını ve periyodunu yükle
            if (completedPayments[0].paymentDescription) {
              setPaymentNote(completedPayments[0].paymentDescription);
            }
            if (completedPayments[0].paymentPeriod) {
              setPaymentPeriod(completedPayments[0].paymentPeriod);
            }
          } 
          // Eğer tamamlanmamış ama geçerli (kısmi) ödeme varsa
          else if (partialPayments.length > 0) {
            setExistingPayment(partialPayments[0]); // İlk kısmi ödeme kaydını kullan
            
            // Önceki ödeme açıklamasını ve periyodunu yükle
            if (partialPayments[0].paymentDescription) {
              setPaymentNote(partialPayments[0].paymentDescription);
            }
            if (partialPayments[0].paymentPeriod) {
              setPaymentPeriod(partialPayments[0].paymentPeriod);
            }
          }
          else if (expiredPayments.length > 0) {
            // Geçerli ödeme yoksa ama süresi dolmuş ödeme varsa:
            // Bunlar mevcut ödeme olarak KULLANILMAYACAK (null olarak bırakılır)
            setExistingPayment(null);
            
            // Ancak notlar tekrar kullanılabilir
            if (expiredPayments[0].paymentDescription) {
              setPaymentNote(expiredPayments[0].paymentDescription);
            }
            
            // Tekrarlı randevularda süresi dolmuş ödemede tek seferlik seçildiyse,
            // default olarak aylık değerini öner, değilse eski periyodu koru
            if (expiredPayments[0].paymentPeriod === "single" && 
                isCalendar && 
                (row.isRecurring || (row._id && row._id.includes("_instance_")))) {
              setPaymentPeriod("monthly");
            } else {
              setPaymentPeriod(expiredPayments[0].paymentPeriod);
            }
            
            // Ayrıca süresi dolmuş ödemelere dair bilgilendirme göster
            if (expiredPayments[0].periodEndDate) {
              // Bu bilgi ekranda gösterilecek
              setPreviousPaymentInfo({
                expired: true,
                periodEndDate: expiredPayments[0].periodEndDate,
                paymentPeriod: expiredPayments[0].paymentPeriod
              });
            }
          } else {
            // Hiç ödeme yoksa
            setSumPaid(0);
            setExistingPayment(null);
            setPreviousPaymentInfo(null);
          }
        } else {
          // Ödeme bulunamadı
          setSumPaid(0);
          setExistingPayment(null);
          setPreviousPaymentInfo(null);
        }
      } catch (err) {
        console.error("Önceki ödemeler alınamadı:", err);
        setExistingPayment(null);
        setPreviousPaymentInfo(null);
      }
    }
    if (isOpen && row && row._id) {
      fetchPayments();
    }

    // Eğer takvim randevusuysa ve randevu tipi seçilmemişse uyarı göster
    if (isOpen && isCalendar && !appointmentData.appointmentType) {
      setShowAppointmentTypeWarning(true);
    } else {
      setShowAppointmentTypeWarning(false);
    }

    // Eğer takvim randevusuysa ve tekrarlı randevuysa, ödeme periyodu seçeneklerini göster
    if (isOpen && isCalendar && row && (row.isRecurring || (row._id && row._id.includes("_instance_")))) {
      setShowRecurringOptions(true);
      
      // Rutin Görüşme için varsayılan periyot "Aylık" olarak ayarlanmalı
      if (appointmentData.appointmentType === "Rutin Görüşme" && !existingPayment) {
        // Eğer mevcut bir ödeme yoksa ve randevu tipi "Rutin Görüşme" ise
        // "Tek Seferlik" seçeneğini devre dışı bırak, "Aylık" seçeneğini varsayılan yap
        setPaymentPeriod("monthly");
      } else if (!existingPayment) {
        // Diğer randevu tipleri için varsayılan olarak "Tek Seferlik" olabilir
        setPaymentPeriod("single");
      }
    } else {
      setShowRecurringOptions(false);
      setPaymentPeriod("single"); // Tekrarlı olmayan randevularda tek seferlik ödeme
    }
  }, [isOpen, row, isCalendar, appointmentData.appointmentType]);

  if (!isOpen) return null;

  // Mevcut ödeme varsa, ek hizmet seçimlerine izin vermiyoruz.
  const handleExtraChange = (service) => {
    // Randevu tipi seçilmemiş veya VALID mevcut ödeme varsa, ek hizmet seçimine izin verme
    if ((existingPayment && existingPayment.isValid) || (isCalendar && !appointmentData.appointmentType)) {
      // Eğer randevu tipi seçilmemişse ve kullanıcı ek hizmet seçmeye çalışıyorsa uyarı göster
      if (isCalendar && !appointmentData.appointmentType) {
        alert("Ek hizmet seçmeden önce lütfen randevu tipini belirleyin.");
      }
      return;
    }

    const alreadySelected = selectedExtras.find((ex) => ex._id === service._id);
    if (alreadySelected) {
      setSelectedExtras(selectedExtras.filter((ex) => ex._id !== service._id));
    } else {
      setSelectedExtras([...selectedExtras, service]);
    }
  };

  // Ödeme periyodunu Türkçe olarak göstermek için yardımcı fonksiyon
  const getPaymentPeriodText = (period) => {
    switch (period) {
      case "monthly":
        return "Aylık";
      case "quarterly":
        return "3 Aylık";
      case "biannual":
        return "6 Aylık";
      case "single":
      default:
        return "Tek Seferlik";
    }
  };

  // Ödeme tamamlanma işlemi
  const handlePaymentComplete = async () => {
    // İşlem başlamadan önce popup'ı kapatma fonksiyonu
    const closePopupFirst = () => {
      if (typeof onClose === 'function') {
        onClose();
      }
    };
    
    // Eğer takvim randevusuysa ve randevu tipi seçilmemişse ödeme yapma
    if (isCalendar && !appointmentData.appointmentType) {
      // Ek hizmet seçili olsa bile randevu tipi seçilmemişse ödeme yapılamaz
      alert("Lütfen önce randevu tipini seçin. Ödeme yapılamıyor.");
      closePopupFirst();
      return;
    }

    // Eğer randevu tipi "Ön Görüşme" değilse ve eşleşen hizmet yoksa ödeme yapma
    if (
      isCalendar &&
      appointmentData.appointmentType &&
      appointmentData.appointmentType !== "Ön Görüşme" &&
      appointmentData.appointmentType !== "Rutin Görüşme" &&
      !matchedService
    ) {
      alert(
        `"${appointmentData.appointmentType}" randevu tipi için tanımlanmış hizmet bulunamadı. Ödeme yapılamıyor.`
      );
      closePopupFirst();
      return;
    }

    // Ödenecek tutar:
    // - Tam ödeme modunda "kalan tutar" ödeniyor.
    // - Kısmi ödeme modunda kullanıcı tarafından girilen tutar.
    const paymentAmountValue =
      paymentMode === "full" ? remainingAmount : Number(partialAmount);

    // Ödeme için kullanılacak hizmet ID'leri: Doktor hizmeti (matchedService) + seçilen ek hizmetler
    const serviceIds = [];
    if (matchedService && (!isCalendar || selectedExtras.length === 0)) {
      serviceIds.push(matchedService._id);
    }
    serviceIds.push(...selectedExtras.map((svc) => svc._id));

    // Kısmi ödeme için tutar kontrolü: Girilen tutar 0'dan büyük ve kalan tutarı aşmamalı.
    // "Ön Görüşme" için özel durum: Tutar 0 TL olabilir
    if (
      paymentMode === "partial" &&
      ((appointmentData.appointmentType !== "Ön Görüşme" &&
        paymentAmountValue <= 0) ||
        paymentAmountValue > remainingAmount)
    ) {
      alert(
        "Lütfen geçerli bir kısmi ödeme tutarı giriniz. Kalan tutar: " +
          remainingAmount +
          " TL"
      );
      return;
    }

    // Eğer randevu ID'si "_instance_" içeriyorsa, bu bir sanal instance'dır
    // Parent ID'yi kullanmamız gerekir
    let realAppointmentId = row._id;
    if (row._id && row._id.includes("_instance_")) {
      realAppointmentId = row._id.split("_instance_")[0];
    }

    // Instance tarihi - recurringStart veya startTime veya appointmentDate
    let instanceDate = null;
    if (isCalendar) {
      // Takvim görünümünde startTime veya recurringStart'ı kullan
      instanceDate = row.startTime || row.recurringStart;
      
      // Eğer instance ID'si varsa (yani _instance_ içeriyorsa) ve tarihi çıkarabiliyorsak
      if (row._id && row._id.includes("_instance_")) {
        const instancePart = row._id.split("_instance_")[1];
        if (instancePart) {
          try {
            // Instance ID'den tarihi çıkarmayı dene
            const dateFromId = new Date(instancePart);
            if (!isNaN(dateFromId.getTime())) {
              // Geçerli bir tarihse, instanceDate'i güncelle
              console.log("Instance ID'den tarih çıkarıldı:", dateFromId.toISOString());
              instanceDate = dateFromId.toISOString();
            }
          } catch (e) {
            console.error("Instance ID'den tarih çıkarma hatası:", e);
          }
        }
      }
    } else {
      // Normal tablo görünümünde appointmentDate'i kullan
      instanceDate = row.appointmentDate;
    }
    
    // Debug için tarih formatını kontrol et
    console.log("Frontend - Instance bilgileri:", {
      isCalendar,
      id: row._id,
      recurringStart: row.recurringStart,
      startTime: row.startTime,
      appointmentDate: row.appointmentDate,
      instanceDate
    });
    
    if (instanceDate) {
      try {
        const instanceDateObj = new Date(instanceDate);
        if (!isNaN(instanceDateObj.getTime())) {
          console.log("Geçerli tarih nesnesi oluşturuldu:", instanceDateObj.toISOString());
          // ISO formatı tercih et - backend için en güvenli format
          instanceDate = instanceDateObj.toISOString();
        } else {
          console.error("Geçersiz tarih formatı:", instanceDate);
        }
      } catch (e) {
        console.error("Frontend - Tarih çevirme hatası:", e);
      }
    }

    // Gönderilecek payload
    const payload = {
      currencyName: "TRY", // Varsayılan para birimi (gerekirse güncellenebilir)
      serviceIds, // Seçilen hizmetlerin ID'leri
      paymentMethod: paymentType,
      paymentAmount: paymentAmountValue,
      paymentDescription: paymentNote,
      appointmentId: realAppointmentId, // Gerçek Randevu ID'si
      paymentPeriod: paymentPeriod, // Ödeme periyodu
      actualAppointmentDate: instanceDate, // Instance'ın gerçek tarihi - backend buna göre periyot hesaplayacak
    };
    
    // ÖNEMLİ: API çağrılarından ÖNCE popup'ı kapatalım
    closePopupFirst();

    try {
      // Eğer daha önce ödeme yapılmışsa, updatePayment çalışsın; yoksa createPayment
      if (existingPayment && existingPayment.isValid) {
        let updatedPaymentStatus;
        if (paymentAmountValue === remainingAmount) {
          // Eğer kalan tutar kadar ödeme yapılıyorsa, ödeme tamamlanmış sayılır.
          updatedPaymentStatus = "Tamamlandı";
        } else {
          updatedPaymentStatus = "Ödeme Bekleniyor";
        }

        const updatedPayload = {
          currencyName: "TRY", // Varsayılan para birimi (gerekirse güncellenebilir)
          serviceIds, // Seçilen hizmetlerin ID'leri
          paymentMethod: paymentType,
          paymentAmount: paymentAmountValue + (totalCost - remainingAmount),
          paymentDescription: paymentNote,
          paymentStatus: updatedPaymentStatus,
          appointmentId: realAppointmentId, // Gerçek Randevu ID'si
          paymentPeriod: paymentPeriod, // Ödeme periyodu
          actualAppointmentDate: instanceDate, // Instance'ın gerçek tarihi - backend buna göre periyot hesaplayacak
        };
        await updatePayment(existingPayment._id, updatedPayload);
      } else {
        // Süresi dolmuş ödeme veya hiç ödeme yoksa, yeni bir ödeme kaydı oluştur
        await createPayment(payload);
      }
      
      // Ödeme başarı mesajı
      alert("Ödeme başarıyla gerçekleştirildi.");
      
      // Ödeme başarılı olduktan sonra daha uzun bir gecikme ile callback'i çağıralım
      // Ödeme tamamlandı mesajını kapattıktan sonra işlem yapılsın
      setTimeout(() => {
        if (typeof onPaymentSuccess === "function") {
          onPaymentSuccess();
        }
      }, 250); // 1.5 saniye daha uzun gecikme
    } catch (error) {
      console.error("Ödeme oluşturulamadı:", error);
      alert("Ödeme gerçekleştirilirken bir hata oluştu.");
    }
  };

  // "Ödemeyi Tamamla" butonunun aktif olup olmamasını kontrol eden fonksiyon
  const isPaymentCompleteDisabled = () => {
    // Randevu tipi seçilmemişse butonu devre dışı bırak (takvim randevuları için)
    if (isCalendar && !appointmentData.appointmentType) return true;

    // Randevu tipi "Ön Görüşme" dışında bir şeyse, eşleşen hizmet yoksa ve ek hizmet de seçilmemişse devre dışı bırak
    if (
      isCalendar &&
      appointmentData.appointmentType &&
      appointmentData.appointmentType !== "Ön Görüşme" &&
      appointmentData.appointmentType !== "Rutin Görüşme" &&
      !matchedService &&
      selectedExtras.length === 0
    )
      return true;

    // Ödeme tipi seçilmemişse devre dışı bırak
    if (!paymentMode) return true;

    // "Ön Görüşme" ve "Rutin Görüşme" için özel durum: Tutar 0 olsa bile ödeme yapılabilir
    if (appointmentData.appointmentType === "Ön Görüşme" || appointmentData.appointmentType === "Rutin Görüşme") {
      if (paymentMode === "full") {
        return !paymentType; // Sadece ödeme tipinin seçili olması yeterli
      } else if (paymentMode === "partial") {
        const amt = Number(partialAmount);
        return !paymentType || amt < 0 || amt > remainingAmount; // 0 TL ödemeye izin ver
      }
    } else {
      // Normal durum (Ön Görüşme ve Rutin Görüşme değilse)
      if (paymentMode === "full") {
        return !paymentType || remainingAmount <= 0;
      } else if (paymentMode === "partial") {
        const amt = Number(partialAmount);
        return !paymentType || amt <= 0 || amt > remainingAmount;
      }
    }
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="relative bg-white p-6 rounded-md shadow-lg w-[90%] max-w-[50rem] min-h-[60vh] max-h-[90vh] overflow-y-auto">
        {/* Kapat Butonu */}
        <button
          className="absolute top-4 right-4 text-red-500 hover:text-gray-600"
          onClick={onClose}
        >
          <IoIosCloseCircleOutline className="w-6 h-6" />
        </button>

        {/* Başlık */}
        <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">
          Ödeme Ekranı
        </h2>

        {/* İçerik: İki sütun */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* SOL SÜTUN: Ücret Detayları */}
          <div className="flex-1 bg-gray-50 p-4 rounded-md border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold mb-3 text-gray-700">
              Ücret Detayları
            </h3>

            {/* Randevu Tipi Uyarısı */}
            {showAppointmentTypeWarning && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md">
                <p className="font-medium">Dikkat: Randevu tipi seçilmemiş!</p>
                <p className="text-sm">
                  Ödeme yapmadan önce lütfen randevu formundan randevu tipini
                  (Ön Görüşme, Rutin Görüşme veya Muayene) seçin.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-3 py-1 rounded-md text-sm"
                >
                  Kapat ve Randevu Tipini Seç
                </button>
              </div>
            )}

            {/* Tekrarlı Randevu Bilgi Mesajı */}
            {row._id && row._id.includes("_instance_") && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-md">
                <p className="font-medium">Bilgi: Tekrarlı Randevu</p>
                <p className="text-sm">
                  Bu, tekrarlı randevu serisindeki bir randevudur.
                  {appointmentData.appointmentType
                    ? ` Randevu tipi "${appointmentData.appointmentType}" olarak belirlenmiştir.`
                    : " Randevu tipini göremiyorsanız, lütfen ana randevudan ayarlayın."}
                </p>
              </div>
            )}

            {/* Randevu Tipi-Hizmet Eşleşme Uyarısı */}
            {isCalendar &&
              appointmentData.appointmentType &&
              !matchedService && (
                <div
                  className={`mb-4 p-3 border rounded-md ${
                    appointmentData.appointmentType === "Ön Görüşme"
                      ? "bg-blue-50 border-blue-200 text-blue-800"
                      : appointmentData.appointmentType === "Rutin Görüşme"
                      ? "bg-cyan-50 border-cyan-200 text-cyan-800"
                      : "bg-orange-50 border-orange-200 text-orange-800"
                  }`}
                >
                  <p className="font-medium">
                    {appointmentData.appointmentType === "Ön Görüşme"
                      ? "Bilgi: Ön Görüşme ödemesi"
                      : appointmentData.appointmentType === "Rutin Görüşme"
                      ? "Bilgi: Rutin Görüşme ödemesi"
                      : "Uyarı: Eşleşen hizmet bulunamadı!"}
                  </p>
                  <p className="text-sm">
                    {appointmentData.appointmentType === "Ön Görüşme"
                      ? 'Seçilen randevu tipi "Ön Görüşme" için bu doktora ait tanımlanmış bir hizmet bulunamadı. Ancak Ön Görüşme randevuları için ücret belirlenmemişse 0 TL ödeme yapabilirsiniz.'
                      : appointmentData.appointmentType === "Rutin Görüşme"
                      ? 'Seçilen randevu tipi "Rutin Görüşme" için bu doktora ait tanımlanmış bir hizmet bulunamadı. Ancak Rutin Görüşme randevuları için ücret belirlenmemişse 0 TL ödeme yapabilirsiniz.'
                      : `Seçilen randevu tipi "${appointmentData.appointmentType}" için bu doktora ait tanımlanmış bir hizmet bulunamadı. Lütfen ilgili hizmeti doktor için tanımlayın veya farklı bir randevu tipi seçin.`}
                  </p>
                  {appointmentData.appointmentType !== "Ön Görüşme" && 
                   appointmentData.appointmentType !== "Rutin Görüşme" && (
                    <p className="text-xs mt-1">
                      Not: Servislerde, doktor adı ile eşleşen ve serviceType
                      alanı "{appointmentData.appointmentType}" olan bir kayıt
                      olmalıdır.
                    </p>
                  )}
                </div>
              )}

            <div className="space-y-2">
              <p className="text-lg text-gray-600">
                <strong className="text-gray-700">Hasta:</strong>{" "}
                {isCalendar ? allNames : `${clientFirstName} ${clientLastName}`}
              </p>
              <p className="text-lg text-gray-600">
                <strong className="text-gray-700">Doktor:</strong> {doctorName}
              </p>
              <p className="text-lg text-gray-600">
                <strong className="text-gray-700">Randevu Tipi:</strong>{" "}
                {appointmentData.appointmentType || (
                  <span className="text-red-500 italic">Seçilmemiş</span>
                )}
              </p>
              {appointmentData?.serviceId && matchedService && (
                <p className="text-lg text-gray-600">
                  <strong className="text-gray-700">Hizmet Adı:</strong>{" "}
                  {matchedService.serviceName}
                </p>
              )}
              <p className="text-lg text-gray-600">
                <strong className="text-gray-700">Muayene Ücreti:</strong>{" "}
                {!appointmentData.appointmentType ? (
                  <span className="text-red-500 italic">
                    Önce randevu tipi seçilmeli
                  </span>
                ) : !matchedService ? (
                  <span className="text-amber-600 italic">
                    Bu randevu tipi için ücret tanımlanmamış
                  </span>
                ) : (
                  `${doctorFee} TL`
                )}
              </p>
            </div>

            {/* Ek Hizmetler */}
            <div className="mt-4">
              <p className="font-semibold text-gray-700 mb-2">Ek Hizmetler</p>
              {extraServices.map((svc) => {
                const checked = selectedExtras.some((ex) => ex._id === svc._id);
                // Randevu tipi seçilmemiş veya geçerli mevcut ödeme varsa, checkbox'ları disable et
                const isDisabled =
                  (existingPayment && existingPayment.isValid) || (isCalendar && !row.appointmentType);
                return (
                  <label
                    key={svc._id}
                    className={`block text-lg mb-1 ${
                      isDisabled ? "text-gray-400" : "text-gray-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={checked}
                      onChange={() => handleExtraChange(svc)}
                      disabled={isDisabled}
                    />
                    {svc.serviceName} (+{svc.serviceFee} TL)
                    {isCalendar && !row.appointmentType && (
                      <span className="ml-2 text-sm text-red-500 italic">
                        (Önce randevu tipi seçin)
                      </span>
                    )}
                  </label>
                );
              })}
            </div>

            {/* Toplam Tutar */}
            <div className="flex justify-end mt-4 border-t pt-2">
              <span className="text-lg font-semibold text-gray-800">
                Toplam: {totalCost} TL
              </span>
              <span className="ml-4 text-lg font-semibold text-gray-800">
                Kalan: {remainingAmount} TL
              </span>
            </div>
          </div>

          {/* SAĞ SÜTUN: Ödeme Seçenekleri */}
          <div className="flex-1 bg-gray-50 p-4 rounded-md border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">
              Ödeme Seçenekleri
            </h3>

            {/* Süresi Dolmuş Ödeme Uyarısı */}
            {previousPaymentInfo && previousPaymentInfo.expired && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-md">
                <p className="font-medium flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Ödeme Süresi Dolmuş!
                </p>
                <p className="text-sm mt-1">
                  Önceki {getPaymentPeriodText(previousPaymentInfo.paymentPeriod)} ödeme periyodu 
                  <strong className="mx-1">{new Date(previousPaymentInfo.periodEndDate).toLocaleDateString('tr-TR')}</strong>
                  tarihinde sona ermiştir. Yeni bir ödeme yapmanız gerekmektedir.
                </p>
              </div>
            )}
            
            {/* Kısmi Ödeme Bilgilendirmesi */}
            {existingPayment && !existingPayment.isCompleted && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-md">
                <p className="font-medium flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Kısmi Ödeme Yapılmış
                </p>
                <p className="text-sm mt-1">
                  Bu randevu için <strong>{existingPayment.paymentAmount} TL</strong> kısmi ödeme yapılmıştır. 
                  Kalan tutar: <strong>{totalCost - sumPaid} TL</strong>
                </p>
                <p className="text-xs mt-1 text-blue-600">
                  {getPaymentPeriodText(existingPayment.paymentPeriod)} ödeme periyodu 
                  <strong className="mx-1">{new Date(existingPayment.periodEndDate).toLocaleDateString('tr-TR')}</strong>
                  tarihine kadar geçerlidir.
                </p>
              </div>
            )}

            {/* Ödeme Periyodu Seçimi - Sadece tekrarlı randevularda göster */}
            {showRecurringOptions && (
              <div className="mb-5 pb-4 border-b border-gray-200">
                <p className="font-semibold text-gray-700 mb-2 flex items-center">
                  <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  Ödeme Geçerlilik Süresi
                </p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {/* Tek Seferlik seçeneği - Rutin Görüşme dışındaki randevu tiplerinde göster */}
                  {appointmentData.appointmentType !== "Rutin Görüşme" && (
                    <div 
                      className={`flex-1 rounded-lg p-3 text-center cursor-pointer transition-all ${
                        paymentPeriod === "single" 
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md" 
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                      onClick={() => !(existingPayment && existingPayment.isValid) && setPaymentPeriod("single")}
                    >
                      <span className="font-medium">Tek Seferlik</span>
                      <p className="text-xs mt-1">
                        {paymentPeriod === "single" ? "Seçildi" : "Sadece bu randevu için geçerli"}
                      </p>
                    </div>
                  )}
                  
                  <div 
                    className={`flex-1 rounded-lg p-3 text-center cursor-pointer transition-all ${
                      paymentPeriod === "monthly" 
                        ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md" 
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => !(existingPayment && existingPayment.isValid) && setPaymentPeriod("monthly")}
                  >
                    <span className="font-medium">Aylık</span>
                    <p className="text-xs mt-1">
                      {paymentPeriod === "monthly" ? "Seçildi" : "1 ay tüm randevular için geçerli"}
                    </p>
                  </div>
                  
                  <div 
                    className={`flex-1 rounded-lg p-3 text-center cursor-pointer transition-all ${
                      paymentPeriod === "quarterly" 
                        ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md" 
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => !(existingPayment && existingPayment.isValid) && setPaymentPeriod("quarterly")}
                  >
                    <span className="font-medium">3 Aylık</span>
                    <p className="text-xs mt-1">
                      {paymentPeriod === "quarterly" ? "Seçildi" : "3 ay tüm randevular için geçerli"}
                    </p>
                  </div>
                  
                  <div 
                    className={`flex-1 rounded-lg p-3 text-center cursor-pointer transition-all ${
                      paymentPeriod === "biannual" 
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md" 
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => !(existingPayment && existingPayment.isValid) && setPaymentPeriod("biannual")}
                  >
                    <span className="font-medium">6 Aylık</span>
                    <p className="text-xs mt-1">
                      {paymentPeriod === "biannual" ? "Seçildi" : "6 ay tüm randevular için geçerli"}
                    </p>
                  </div>
                </div>
                
                {existingPayment && existingPayment.paymentPeriod && existingPayment.periodEndDate && existingPayment.isCompleted && (
                  <div className="p-3 mt-2 bg-blue-50 border border-blue-100 rounded-md text-blue-700">
                    <p className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <strong>Mevcut ödeme:</strong> {getPaymentPeriodText(existingPayment.paymentPeriod)},
                      <span className="ml-1 font-medium">
                        {new Date(existingPayment.periodEndDate).toLocaleDateString('tr-TR')} tarihine kadar geçerli
                      </span>
                    </p>
                  </div>
                )}

                {/* Bilgi notu */}
                <div className="text-xs text-gray-600 mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                  <p className="flex items-center mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <strong>Periyot Seçimi Hakkında:</strong>
                  </p>
                  <ul className="list-disc list-inside pl-1">
                    {appointmentData.appointmentType !== "Rutin Görüşme" && (
                      <li><strong>Tek Seferlik:</strong> Sadece seçili randevu için geçerlidir.</li>
                    )}
                    <li><strong>Aylık/3 Aylık/6 Aylık:</strong> Belirtilen süre içindeki tüm tekrarlı randevular için geçerlidir.</li>
                    {appointmentData.appointmentType === "Rutin Görüşme" && (
                      <li className="mt-1 text-blue-600"><strong>Not:</strong> Rutin Görüşme randevuları için periyodik ödeme zorunludur.</li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {/* Ödeme Modu (Tam/Kısmi) */}
            <div className="flex gap-4 mb-4 justify-center items-center">
              <button
                className={`px-4 py-2 rounded font-medium ${
                  paymentMode === "full"
                    ? "bg-[#007E85] text-white"
                    : "bg-gray-300 text-gray-700"
                }`}
                onClick={() => {
                  setPaymentMode("full");
                  setPaymentType(null);
                  setPartialAmount("");
                }}
              >
                Tamamını Öde
              </button>
              <button
                className={`px-4 py-2 rounded font-medium ${
                  paymentMode === "partial"
                    ? "bg-[#007E85] text-white"
                    : "bg-gray-300 text-gray-700"
                }`}
                onClick={() => {
                  setPaymentMode("partial");
                  setPaymentType(null);
                  setPartialAmount("");
                }}
              >
                Bir Kısmını Öde
              </button>
            </div>

            {/* Tam Ödeme Seçenekleri */}
            {paymentMode === "full" && (
              <div className="mb-4">
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  Tam Ödeme Yöntemi
                </p>
                <div className="flex gap-4 items-center mb-3 justify-center">
                  <label className="flex items-center gap-1 text-gray-600">
                    <input
                      type="radio"
                      name="paymentType"
                      value="nakit"
                      checked={paymentType === "nakit"}
                      onChange={(e) => setPaymentType(e.target.value)}
                    />
                    Nakit
                  </label>
                  <label className="flex items-center gap-1 text-gray-600">
                    <input
                      type="radio"
                      name="paymentType"
                      value="kredi"
                      checked={paymentType === "kredi"}
                      onChange={(e) => setPaymentType(e.target.value)}
                    />
                    Kredi Kartı
                  </label>
                  <label className="flex items-center gap-1 text-gray-600">
                    <input
                      type="radio"
                      name="paymentType"
                      value="sigorta"
                      checked={paymentType === "sigorta"}
                      onChange={(e) => setPaymentType(e.target.value)}
                    />
                    Sigorta
                  </label>
                  <label className="flex items-center gap-1 text-gray-600">
                    <input
                      type="radio"
                      name="paymentType"
                      value="IBAN"
                      checked={paymentType === "IBAN"}
                      onChange={(e) => setPaymentType(e.target.value)}
                    />
                    IBAN
                  </label>
                </div>
                <div>
                  <label
                    htmlFor="fullPaymentAmount"
                    className="block mb-1 text-lg font-medium text-gray-700"
                  >
                    Ödenecek Tutar (TL):
                  </label>
                  <input
                    type="number"
                    id="fullPaymentAmount"
                    className="border px-2 py-1 rounded w-40"
                    value={remainingAmount}
                    disabled
                  />
                </div>
              </div>
            )}

            {/* Kısmi Ödeme Seçenekleri */}
            {paymentMode === "partial" && (
              <div className="mb-4">
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  Kısmi Ödeme Yöntemi
                </p>
                <div className="flex gap-4 items-center mb-3 justify-center">
                  <label className="flex items-center gap-1 text-gray-600">
                    <input
                      type="radio"
                      name="partialPaymentType"
                      value="nakit"
                      checked={paymentType === "nakit"}
                      onChange={(e) => setPaymentType(e.target.value)}
                    />
                    Nakit
                  </label>
                  <label className="flex items-center gap-1 text-gray-600">
                    <input
                      type="radio"
                      name="partialPaymentType"
                      value="kredi"
                      checked={paymentType === "kredi"}
                      onChange={(e) => setPaymentType(e.target.value)}
                    />
                    Kredi Kartı
                  </label>
                  <label className="flex items-center gap-1 text-gray-600">
                    <input
                      type="radio"
                      name="paymentType"
                      value="IBAN"
                      checked={paymentType === "IBAN"}
                      onChange={(e) => setPaymentType(e.target.value)}
                    />
                    IBAN
                  </label>
                  {/* Sigorta seçeneği kısmi ödemede yok */}
                </div>
                <div>
                  <label
                    htmlFor="partialAmount"
                    className="block mb-1 text-lg font-medium text-gray-700"
                  >
                    Ödenecek Tutar (TL):
                  </label>
                  <input
                    type="number"
                    id="partialAmount"
                    className="border px-2 py-1 rounded w-40"
                    placeholder="0"
                    value={partialAmount}
                    onChange={(e) => setPartialAmount(e.target.value)}
                  />
                </div>
                <div className="mt-2">
                  <span className="text-lg font-semibold text-gray-800">
                    Kalan Tutar: {remainingAmount} TL
                  </span>
                </div>
              </div>
            )}

            {/* Açıklama Alanı */}
            <div className="mb-4">
              <label
                htmlFor="paymentNote"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Açıklama
              </label>
              <textarea
                id="paymentNote"
                rows="3"
                className="border px-2 py-1 rounded w-full text-sm"
                placeholder="Ödeme ile ilgili notunuzu yazabilirsiniz..."
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
              />
            </div>

            {/* Ödemeyi Tamamla Butonu */}
            <div className="flex justify-end mt-6">
              <button
                className={`px-6 py-2 rounded font-semibold ${
                  isPaymentCompleteDisabled()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#399AA1] text-white hover:bg-[#007E85]"
                }`}
                disabled={isPaymentCompleteDisabled()}
                onClick={handlePaymentComplete}
              >
                Ödemeyi Tamamla
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
