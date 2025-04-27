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
    if (appointmentData?.appointmentType) {
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
          const totalPaid = payments.reduce(
            (acc, payment) => acc + Number(payment.paymentAmount),
            0
          );
          setSumPaid(totalPaid);
          setExistingPayment(payments[0]); // İlk ödeme kaydı üzerinden bilgiler alınır
          
          // Önceki ödeme açıklamasını yükle
          if (payments[0].paymentDescription) {
            setPaymentNote(payments[0].paymentDescription);
          }
        } else {
          setSumPaid(0);
          setExistingPayment(null);
        }
      } catch (err) {
        console.error("Önceki ödemeler alınamadı:", err);
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
  }, [isOpen, row, isCalendar]);

  if (!isOpen) return null;

  // Mevcut ödeme varsa, ek hizmet seçimlerine izin vermiyoruz.
  const handleExtraChange = (service) => {
    // Randevu tipi seçilmemiş veya mevcut ödeme varsa, ek hizmet seçimine izin verme
    if (existingPayment || (isCalendar && !appointmentData.appointmentType)) {
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

    // Gönderilecek payload
    const payload = {
      currencyName: "TRY", // Varsayılan para birimi (gerekirse güncellenebilir)
      serviceIds, // Seçilen hizmetlerin ID'leri
      paymentMethod: paymentType,
      paymentAmount: paymentAmountValue,
      paymentDescription: paymentNote,
      appointmentId: realAppointmentId, // Gerçek Randevu ID'si
    };
    
    // ÖNEMLİ: API çağrılarından ÖNCE popup'ı kapatalım
    closePopupFirst();

    try {
      // Eğer daha önce ödeme yapılmışsa, updatePayment çalışsın; yoksa createPayment
      if (existingPayment) {
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
        };
        await updatePayment(existingPayment._id, updatedPayload);
      } else {
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
                // Randevu tipi seçilmemiş veya mevcut ödeme varsa, checkbox'ları disable et
                const isDisabled =
                  existingPayment || (isCalendar && !row.appointmentType);
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
