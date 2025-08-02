// usePaymentStatus.js
import { useEffect, useState } from "react";
import { getPaymentsByAppointment } from "../services/paymentService";

export default function usePaymentStatus(appointmentId, refreshTrigger = 0, disabled = false) {
  const [completed, setCompleted] = useState(false);
  const [halfPaid, setHalfPaid] = useState(false);
  const [totalPaid, setTotalPaid] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    async function fetchStatus() {
      if (!appointmentId || disabled) return;
      try {
        const res = await getPaymentsByAppointment(appointmentId);
        
        // Eğer appointmentId "_instance_" içeriyorsa tarih bilgisini al
        let appointmentDate = new Date();
        if (appointmentId && appointmentId.includes("_instance_")) {
          const dateString = appointmentId.split("_instance_")[1];
          if (dateString) {
            const parsedDate = new Date(dateString);
            if (!isNaN(parsedDate.getTime())) {
              appointmentDate = parsedDate;
            }
          }
        }
        
        if (res.success && res.payments && res.payments.length > 0) {
          // Geçerli ödemeleri filtrele (isValid özelliği backend'den geliyor)
          const validPayments = res.payments.filter(payment => payment.isValid === true);
          const expiredPayments = res.payments.filter(payment => payment.isValid === false);
          
          // Hiç geçerli ödeme yoksa ama süresi dolmuş ödemeler varsa
          if (validPayments.length === 0 && expiredPayments.length > 0) {
            setCompleted(false);
            setHalfPaid(false);
            setTotalPaid(0);
            setIsExpired(true);
            return;
          }
          
          // Geçerli ödemeler varsa durumu kontrol et
          // ÖNEMLİ: "Tamamlandı" statüsüne bakmak yerine artık isCompleted alanını kontrol ediyoruz
          // isCompleted = isValid && paymentStatus === "Tamamlandı" (backend'de hesaplanıyor)
          const isCompleted = validPayments.some(payment => payment.isCompleted === true);
          
          // Kısmi ödeme durumu: Geçerli ama tamamlanmamış ödemeler
          const isPartialPayment = validPayments.some(payment => 
            payment.isValid === true && payment.isCompleted === false
          );
          
          setCompleted(isCompleted);
          setHalfPaid(isPartialPayment);
          
          // Toplam ödenen miktarı hesapla (sadece geçerli ödemelerden)
          const total = validPayments.reduce(
            (acc, payment) => acc + Number(payment.paymentAmount),
            0
          );
          setTotalPaid(total);
          setIsExpired(false);
        } else {
          setCompleted(false);
          setHalfPaid(false);
          setTotalPaid(0);
          setIsExpired(false);
        }
      } catch (error) {
        console.error("Payment status fetch error:", error);
        setCompleted(false);
        setHalfPaid(false);
        setTotalPaid(0);
        setIsExpired(false);
      }
    }
    fetchStatus();
  }, [appointmentId, refreshTrigger, disabled]);

  return { completed, halfPaid, totalPaid, isExpired };
}
