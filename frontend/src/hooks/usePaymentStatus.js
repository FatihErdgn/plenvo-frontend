// usePaymentStatus.js
import { useEffect, useState } from "react";
import { getPaymentsByAppointment } from "../services/paymentService";

export default function usePaymentStatus(appointmentId, refreshTrigger = 0) {
  const [completed, setCompleted] = useState(false);
  const [halfPaid, setHalfPaid] = useState(false);
  const [totalPaid, setTotalPaid] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    async function fetchStatus() {
      if (!appointmentId) return;
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
          // Periyot kontrolü: Ödeme periyodu var mı ve bitiş tarihi geçilmiş mi?
          const hasValidPayment = res.payments.some(payment => {
            // Tek seferlik (veya periodEndDate tanımlanmamış) ödeme ise periyot kontrolü yapma
            if (payment.paymentPeriod === "single" || !payment.periodEndDate) {
              return true;
            }
            
            // Periyotlu ödeme için: Randevu tarihi ödeme periyodunun bitiş tarihinden önce mi?
            const periodEnd = new Date(payment.periodEndDate);
            return appointmentDate <= periodEnd;
          });
          
          // Eğer geçerli bir ödeme yoksa tüm durumlar sıfırlanır
          if (!hasValidPayment) {
            setCompleted(false);
            setHalfPaid(false);
            setTotalPaid(0);
            setIsExpired(true);
            return;
          }
          
          // Geçerli ödeme varsa durumu kontrol et
          const isCompleted = res.payments.some(
            (payment) => payment.paymentStatus === "Tamamlandı"
          );
          const isHalfPaid = res.payments.some(
            (payment) => payment.paymentAmount < payment.serviceFee
          );
          setCompleted(isCompleted);
          setHalfPaid(isHalfPaid);
          const total = res.payments.reduce(
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
  }, [appointmentId, refreshTrigger]);

  return { completed, halfPaid, totalPaid, isExpired };
}
