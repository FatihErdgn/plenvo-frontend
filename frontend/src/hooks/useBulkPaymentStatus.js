import { useEffect, useState } from "react";
import { getBulkPaymentStatus } from "../services/paymentService";

export default function useBulkPaymentStatus(appointments = [], refreshTrigger = 0) {
  const [paymentStatuses, setPaymentStatuses] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchBulkStatus() {
      if (!appointments || appointments.length === 0) return;
      
      setLoading(true);
      
      // Tüm appointment ID'leri toplama
      const appointmentIds = appointments.map(app => app._id);
      
      try {
        const res = await getBulkPaymentStatus(appointmentIds);
        
        if (res.success && res.paymentStatuses) {
          // Backend'den dönen statüsleri appointment ID'lere göre map'le
          const statusMap = {};
          
          res.paymentStatuses.forEach(status => {
            statusMap[status.appointmentId] = {
              completed: status.completed || false,
              halfPaid: status.halfPaid || false,
              totalPaid: status.totalPaid || 0,
              isExpired: status.isExpired || false
            };
          });
          
          setPaymentStatuses(statusMap);
        }
      } catch (error) {
        console.error("Bulk payment status fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchBulkStatus();
  }, [appointments, refreshTrigger]);

  // Belirli bir randevu için ödeme durumu alma helper fonksiyonu
  const getStatusForAppointment = (appointmentId) => {
    return paymentStatuses[appointmentId] || {
      completed: false,
      halfPaid: false,
      totalPaid: 0,
      isExpired: false
    };
  };

  return { paymentStatuses, getStatusForAppointment, loading };
} 