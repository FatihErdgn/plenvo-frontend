import React, { useEffect, useState } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";

/**
 * PaymentPopup bileşeni (Tasarım geliştirilmiş sürüm)
 * - isOpen: popup açık mı?
 * - onClose: popup'ı kapatma fonksiyonu
 * - row: Tablodan gelen randevu verisi (içinde hasta adı, doctor vb.)
 * - servicesData: Doktor/hizmet JSON verisi
 */
export default function PaymentPopup({ isOpen, onClose, row, servicesData }) {
  // Doktor ücretini bulalım (örnek: provider === row.doctor)
  const matchedService = servicesData.find(
    (s) => s.provider === row.doctor && s.status === "Aktif"
  );
  const doctorFee = matchedService ? matchedService.serviceFee : 0;

  // Ek hizmetler (örnek - sabit)
  const extraServices = [
    { id: 1, name: "Röntgen", price: 50 },
    { id: 2, name: "Bandaj", price: 30 },
    { id: 3, name: "Ekstra Danışmanlık", price: 80 },
  ];

  const [selectedExtras, setSelectedExtras] = useState([]);
  const [paymentMode, setPaymentMode] = useState("full"); // "full" | "partial"
  const [paymentType, setPaymentType] = useState(null); // "nakit" | "kredi" | "sigorta"
  const [partialAmount, setPartialAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  // Toplam: Doktor ücreti + seçilen ek hizmet fiyatları
  const baseTotal =
    doctorFee +
    selectedExtras.reduce((acc, ex) => acc + ex.price, 0) -
    partialAmount;

  // ESC ile kapatma
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Ek hizmet seç / kaldır
  const handleExtraChange = (service) => {
    const alreadySelected = selectedExtras.find((ex) => ex.id === service.id);
    if (alreadySelected) {
      setSelectedExtras((prev) => prev.filter((ex) => ex.id !== service.id));
    } else {
      setSelectedExtras((prev) => [...prev, service]);
    }
  };

  // Ödemeyi tamamla
  const handlePaymentComplete = () => {
    if (paymentMode === "full") {
      // Tüm tutar ödendi => status = "Tamamlandı"
      console.log("Tam ödeme yapıldı -> status = Tamamlandı");
    } else {
      // Kısmi ödeme => status = "Ödeme Bekleniyor"
      console.log("Kısmi ödeme yapıldı -> status = Ödeme Bekleniyor");
    }
    onClose();
  };

  // Buton aktif mi?
  const isPaymentCompleteDisabled = (() => {
    if (!paymentMode) return true; // henüz full/partial seçilmedi
    if (paymentMode === "full") {
      return !paymentType; // nakit / kredi / sigorta seçili değilse
    }
    if (paymentMode === "partial") {
      if (!paymentType) return true; // nakit/kredi
      if (partialAmount <= 0) return true;
    }
    return false;
  })();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="relative bg-white p-6 rounded-md shadow-lg w-[90%] max-w-[800px] min-h-[60vh] max-h-[90vh] overflow-y-auto">
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

        {/* İçerik: İki sütun (detaylar solda, ödeme sağda) */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* SOL SÜTUN: Hasta, doktor, ek hizmetler */}
          <div className="flex-1 bg-gray-50 p-4 rounded-md border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold mb-3 text-gray-700">
              Ücret Detayları
            </h3>
            <div className="space-y-2">
              {/* Hasta & Doktor */}
              <p className="text-lg text-gray-600">
                <strong className="text-gray-700">Hasta:</strong>{" "}
                {row.firstName} {row.lastName}
              </p>
              <p className="text-lg text-gray-600">
                <strong className="text-gray-700">Doktor:</strong> {row.doctor}
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
                const checked = selectedExtras.some((ex) => ex.id === svc.id);
                return (
                  <label
                    key={svc.id}
                    className="block text-lg text-gray-700 mb-1"
                  >
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={checked}
                      onChange={() => handleExtraChange(svc)}
                    />
                    {svc.name} (+{svc.price} TL)
                  </label>
                );
              })}
            </div>

            {/* Toplam Tutar */}
            <div className="flex justify-end mt-4 border-t pt-2">
              <span className="text-lg font-semibold text-gray-800">
                Toplam: {baseTotal} TL
              </span>
            </div>
          </div>

          {/* SAĞ SÜTUN: Ödeme seçenekleri */}
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
                <div className="flex gap-4 items-center mb-3 items-center justify-center">
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
                    htmlFor="partialAmount"
                    className="block mb-1 text-lg font-medium text-gray-700"
                  >
                    Ödenecek Tutar (TL):
                  </label>
                  <input
                    type="number"
                    id="baseTotal"
                    className="border px-2 py-1 rounded w-40"
                    placeholder={baseTotal}
                    value={baseTotal}
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
                <div className="flex gap-4 items-center mb-3 items-center justify-center">
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
                  {/* Sigorta opsiyonu yok */}
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
                  isPaymentCompleteDisabled
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#399AA1] text-white hover:bg-[#007E85]"
                }`}
                disabled={isPaymentCompleteDisabled}
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
