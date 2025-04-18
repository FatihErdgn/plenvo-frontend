// usePaymentStatus.js
import { useEffect, useState } from "react";
import { getPaymentsByAppointment } from "../services/paymentService";

export default function usePaymentStatus(appointmentId, refreshTrigger = 0) {
  const [completed, setCompleted] = useState(false);
  const [halfPaid, setHalfPaid] = useState(false);
  const [totalPaid, setTotalPaid] = useState(0);

  useEffect(() => {
    async function fetchStatus() {
      if (!appointmentId) return;
      try {
        const res = await getPaymentsByAppointment(appointmentId);
        if (res.success && res.payments && res.payments.length > 0) {
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
        } else {
          setCompleted(false);
          setHalfPaid(false);
          setTotalPaid(0);
        }
      } catch (error) {
        console.error("Payment status fetch error:", error);
      }
    }
    fetchStatus();
  }, [appointmentId, refreshTrigger]);

  return { completed, halfPaid, totalPaid };
}
