import React, { useEffect, useState } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import {
  getPaymentsByAppointment,
  softDeletePayment,
} from "../../../services/paymentService";
import { updateAppointment } from "../../../services/appointmentService";

export default function ReadOnlyPaymentPopup({
  isOpen,
  onClose,
  row,
  onRefreshAppointments,
}) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  // ESC tuşuna basıldığında popup'ı kapat
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Ödeme iptali için handler
  const handleCancelPayment = async (paymentId) => {
    if (!window.confirm("Ödemeyi iptal etmek istediğinize emin misiniz?"))
      return;
    try {
      // İlgili ödemeyi soft-delete yapıyoruz.
      await softDeletePayment(paymentId);
      // Randevunun status'unu "Ödeme Bekleniyor" olarak güncelliyoruz.
      if (row.status) {
        await updateAppointment(row._id, { status: "Ödeme Bekleniyor" });
      }
      // Parent'dan gönderilen callback varsa, randevu kayıtlarını yeniden fetch etmesini tetikliyoruz.
      if (typeof onRefreshAppointments === "function") {
        onRefreshAppointments();
      }
      // İptal edilen ödemeyi listeden kaldırıyoruz.
      setPayments(payments.filter((p) => p._id !== paymentId));
      alert("Ödeme iptal edildi.");
    } catch (error) {
      console.error("Ödeme iptal edilirken hata oluştu:", error);
      alert("Ödeme iptal edilirken bir hata oluştu.");
    }
  };

  useEffect(() => {
    async function fetchPayments() {
      setLoading(true);
      try {
        const res = await getPaymentsByAppointment(row._id);
        if (res.payments && res.payments.length > 0) {
          setPayments(res.payments);
        } else {
          setPayments([]);
        }
      } catch (error) {
        console.error("Ödeme bilgileri alınamadı:", error);
        setPayments([]);
      }
      setLoading(false);
    }
    if (isOpen && row && row._id) {
      fetchPayments();
    }
  }, [isOpen, row]);

  // Hasta adını oluşturan helper fonksiyon
  const getPatientName = () => {
    // ConsultantTable'dan gelen grup randevusu
    if (
      row.type === "group" &&
      row.participants &&
      row.participants.length > 0
    ) {
      return row.participants
        .map((p) =>
          `${p.clientFirstName || ""} ${p.clientLastName || ""}`.trim()
        )
        .join(" - ");
    }
    // Takvimden gelen randevu (participants içinde name değerleri var)
    else if (
      row.participants &&
      row.participants.length > 0 &&
      row.participants[0].name
    ) {
      return row.participants.map((p) => p.name).join(" - ");
    }
    // Tek kişilik normal randevu
    else {
      return `${row.clientFirstName || ""} ${row.clientLastName || ""}`.trim();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="relative bg-white p-6 rounded-md shadow-lg w-[90%] max-w-[50rem] min-h-[30vh] max-h-[80vh] overflow-y-auto">
        {/* Kapat Butonu */}
        <button
          className="absolute top-4 right-4 text-red-500 hover:text-gray-600"
          onClick={onClose}
        >
          <IoIosCloseCircleOutline className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">
          Ödeme Detayları
        </h2>

        {loading ? (
          <p className="text-center text-gray-600">Yükleniyor...</p>
        ) : payments.length === 0 ? (
          <p className="text-center text-gray-600">Ödeme kaydı bulunamadı.</p>
        ) : (
          <div className="space-y-4">
            {payments.map((payment, index) => (
              <div key={index} className="border p-4 rounded-md">
                <p className="text-lg text-gray-700">
                  <strong>Doktor Adı:</strong> {row?.doctorName}
                </p>
                <p className="text-lg text-gray-700">
                  <strong>Hasta Adı:</strong> {getPatientName()}
                </p>
                <p className="text-lg text-gray-700">
                  <strong>Alınan Hizmet:</strong> {payment.serviceDescription}
                </p>
                <p className="text-lg text-gray-700">
                  <strong>Ödeme Tutarı:</strong> {payment.paymentAmount} TL
                </p>
                <p className="text-lg text-gray-700">
                  <strong>Ödeme Yöntemi:</strong> {payment.paymentMethod}
                </p>
                {payment.paymentDescription && (
                  <p className="text-lg text-gray-700">
                    <strong>Açıklama:</strong> {payment.paymentDescription}
                  </p>
                )}
                {payment.paymentDate && (
                  <p className="text-lg text-gray-700">
                    <strong>Ödeme Tarihi:</strong>{" "}
                    {new Date(payment.paymentDate).toLocaleString()}
                  </p>
                )}
                {payment.periodEndDate && (
                  <p className="text-lg text-gray-700">
                    <strong>Ödeme Son Geçerlilik Tarihi:</strong>{" "}
                    {new Date(payment.periodEndDate).toLocaleString()}
                  </p>
                )}
                {/* Ödemeyi İptal Et Butonu */}
                <button
                  onClick={() => handleCancelPayment(payment._id)}
                  className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
                >
                  Ödemeyi İptal Et
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
