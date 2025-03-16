// components/ReadOnlyPaymentPopup.js
import React, { useEffect, useState } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { getPaymentsByAppointment } from "../../../services/paymentService";

export default function ReadOnlyPaymentPopup({ isOpen, onClose, row }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

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
                  <strong>Hasta Adı:</strong> {row?.clientFirstName}{" "}
                  {row?.clientLastName}
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
                    <strong>Tarih:</strong>{" "}
                    {new Date(payment.paymentDate).toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
