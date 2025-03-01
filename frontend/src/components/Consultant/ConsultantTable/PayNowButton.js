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
}) {
  // Doktora ait hizmeti bul (doktor adı ve "Aktif" durumu kontrolü)
  const matchedService = servicesData.find(
    (s) => s.provider === row.doctorName && s.status === "Aktif"
  );
  const doctorFee = matchedService ? matchedService.serviceFee : 0;

  // Ek hizmetler: "Genel Hizmet" sağlayıcısı ve aktif olanlar
  const extraServices = servicesData.filter(
    (s) => s.provider === "Genel Hizmet" && s.status === "Aktif"
  );

  // Bileşen state'leri
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [paymentMode, setPaymentMode] = useState(null); // "full" veya "partial"
  const [paymentType, setPaymentType] = useState(null); // "nakit", "kredi", "sigorta"
  const [partialAmount, setPartialAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [sumPaid, setSumPaid] = useState(0);
  const [existingPayment, setExistingPayment] = useState(null);

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
        console.log("Önceki ödemeler alındı:", res);
        if (res.payments && res.payments.length > 0) {
          const payments = res.payments;
          const totalPaid = payments.reduce(
            (acc, payment) => acc + Number(payment.paymentAmount),
            0
          );
          setSumPaid(totalPaid);
          setExistingPayment(payments[0]); // İlk ödeme kaydı üzerinden bilgiler alınır
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
  }, [isOpen, row]);

  if (!isOpen) return null;

  // Mevcut ödeme varsa, ek hizmet seçimlerine izin vermiyoruz.
  const handleExtraChange = (service) => {
    if (existingPayment) return;
    const alreadySelected = selectedExtras.find((ex) => ex._id === service._id);
    if (alreadySelected) {
      setSelectedExtras(selectedExtras.filter((ex) => ex._id !== service._id));
    } else {
      setSelectedExtras([...selectedExtras, service]);
    }
  };

  // Ödeme tamamlanma işlemi
  const handlePaymentComplete = async () => {
    // Ödenecek tutar:
    // - Tam ödeme modunda "kalan tutar" ödeniyor.
    // - Kısmi ödeme modunda kullanıcı tarafından girilen tutar.
    const paymentAmountValue =
      paymentMode === "full" ? remainingAmount : Number(partialAmount);

    // Ödeme için kullanılacak hizmet ID'leri: Doktor hizmeti (matchedService) + seçilen ek hizmetler
    const serviceIds = [];
    if (matchedService) {
      serviceIds.push(matchedService._id);
    }
    serviceIds.push(...selectedExtras.map((svc) => svc._id));

    // Kısmi ödeme için tutar kontrolü: Girilen tutar 0'dan büyük ve kalan tutarı aşmamalı.
    if (
      paymentMode === "partial" &&
      (paymentAmountValue <= 0 || paymentAmountValue > remainingAmount)
    ) {
      alert(
        "Lütfen geçerli bir kısmi ödeme tutarı giriniz. Kalan tutar: " +
          remainingAmount +
          " TL"
      );
      return;
    }

    // Gönderilecek payload
    const payload = {
      currencyName: "TRY", // Varsayılan para birimi (gerekirse güncellenebilir)
      serviceIds, // Seçilen hizmetlerin ID'leri
      paymentMethod: paymentType,
      paymentAmount: paymentAmountValue,
      paymentDescription: paymentNote,
      appointmentId: row._id, // Randevu ID'si
      // paymentDate: new Date().toISOString(), // Opsiyonel
    };

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
          appointmentId: row._id, // Randevu ID'si
          // paymentDate: new Date().toISOString(), // Opsiyonel
        };
        await updatePayment(existingPayment._id, updatedPayload);
        // console.log("Ödeme güncellendi:", payload);
      } else {
        await createPayment(payload);
      }
      alert("Ödeme başarıyla gerçekleştirildi.");
      // Ödeme başarılı olduktan sonra callback çalışsın
      if (typeof onPaymentSuccess === "function") {
        onPaymentSuccess();
      }
      onClose();
    } catch (error) {
      console.error("Ödeme oluşturulamadı:", error);
      alert("Ödeme gerçekleştirilirken bir hata oluştu.");
    }
  };

  // "Ödemeyi Tamamla" butonunun aktif olup olmamasını kontrol eden fonksiyon
  const isPaymentCompleteDisabled = () => {
    if (!paymentMode) return true;
    if (paymentMode === "full") {
      return !paymentType || remainingAmount <= 0;
    } else if (paymentMode === "partial") {
      const amt = Number(partialAmount);
      return !paymentType || amt <= 0 || amt > remainingAmount;
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
            <div className="space-y-2">
              <p className="text-lg text-gray-600">
                <strong className="text-gray-700">Hasta:</strong>{" "}
                {row.clientFirstName} {row.clientLastName}
              </p>
              <p className="text-lg text-gray-600">
                <strong className="text-gray-700">Doktor:</strong>{" "}
                {row.doctorName}
              </p>
              <p className="text-lg text-gray-600">
                <strong className="text-gray-700">Muayene Ücreti:</strong>{" "}
                {doctorFee} TL
              </p>
            </div>

            {/* Ek Hizmetler */}
            <div className="mt-4">
              <p className="font-semibold text-gray-700 mb-2">Ek Hizmetler</p>
              {extraServices.map((svc) => {
                const checked = selectedExtras.some((ex) => ex._id === svc._id);
                return (
                  <label
                    key={svc._id}
                    className="block text-lg text-gray-700 mb-1"
                  >
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={checked}
                      onChange={() => handleExtraChange(svc)}
                      disabled={existingPayment}
                    />
                    {svc.serviceName} (+{svc.serviceFee} TL)
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
