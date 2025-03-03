// usePaymentStatus.js
import { useEffect, useState } from "react";
import { getPaymentsByAppointment } from "../services/paymentService";

export default function usePaymentStatus(appointmentId, refreshTrigger = 0) {
  const [completed, setCompleted] = useState(false);
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
          setCompleted(isCompleted);
          const total = res.payments.reduce(
            (acc, payment) => acc + Number(payment.paymentAmount),
            0
          );
          setTotalPaid(total);
        } else {
          setCompleted(false);
          setTotalPaid(0);
        }
      } catch (error) {
        console.error("Payment status fetch error:", error);
      }
    }
    fetchStatus();
  }, [appointmentId, refreshTrigger]);

  return { completed, totalPaid };
}
