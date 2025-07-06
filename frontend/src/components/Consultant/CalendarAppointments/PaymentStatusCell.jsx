import React, { useState, useEffect, useRef } from "react";
import { FaMoneyBill, FaCheckCircle } from "react-icons/fa";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";
import usePaymentStatus from "../../../hooks/usePaymentStatus";
import ReadOnlyPaymentPopup from "../ConsultantTable/ReadOnlyPayNowButton";
import { cn } from "../../../utils/calendarUtils";

const PaymentStatusCell = ({
  appointment,
  onClickPayNow,
  refreshTrigger,
  fetchAppointments,
  preventAutoPopup = false
}) => {
  const { completed, halfPaid, totalPaid, isExpired } = usePaymentStatus(
    appointment._id,
    refreshTrigger
  );
  const [viewPaymentOpen, setViewPaymentOpen] = useState(false);
  
  // İlk mount sonrası oluşan değişiklikleri izleyen ref
  const initialRenderRef = useRef(true);
  const lastCompletedRef = useRef(completed);
  
  // Tamamlanma durumu değişince ve bu ilk render değilse ve preventAutoPopup aktif değilse
  useEffect(() => {
    // İlk mount sırasında (ilk render) hiçbir şey yapma
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      lastCompletedRef.current = completed;
      return;
    }
    
    // Tamamlanma durumu false'dan true'ya değiştiyse ve preventAutoPopup aktif değilse
    if (completed && !lastCompletedRef.current && preventAutoPopup) {
      setViewPaymentOpen(false);
    }
    
    lastCompletedRef.current = completed;
  }, [completed, preventAutoPopup]);

  const participantNames = appointment.participants?.map((p) => p.name).join(" - ") || "Katılımcı Yok";

  // Ödeme periyodu sona ermişse
  if (isExpired) {
    return (
      <div className="relative group">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClickPayNow();
          }}
          title="Ödeme periyodu dolmuş! Yeni ödeme gerekiyor."
          className={cn(
            "absolute top-1 right-1 z-10",
            "bg-gradient-to-r from-orange-400 to-orange-500",
            "hover:from-orange-500 hover:to-orange-600",
            "text-white text-xs px-2 py-1 rounded-full",
            "shadow-lg transform transition-all duration-200",
            "hover:scale-110 hover:shadow-xl",
            "focus:outline-none focus:ring-2 focus:ring-orange-300"
          )}
        >
          <FaMoneyBill className="w-4 h-4" />
        </button>
        <div className="text-sm font-medium pr-10 text-gray-800 group-hover:text-gray-900 transition-colors">
          {participantNames}
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      {completed ? (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setViewPaymentOpen(true);
            }}
            title={`Toplam Ödenen Miktar: ${totalPaid} TL`}
            className={cn(
              "absolute top-1 right-1 z-10",
              "transform transition-all duration-200",
              "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-300 rounded-full"
            )}
          >
            <IoCheckmarkDoneCircleSharp className="text-green-600 w-6 h-6 hover:text-green-700 drop-shadow-sm" />
          </button>
          {viewPaymentOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <ReadOnlyPaymentPopup
                isOpen={viewPaymentOpen}
                onClose={() => setViewPaymentOpen(false)}
                row={appointment}
                onRefreshAppointments={fetchAppointments}
              />
            </div>
          )}
        </>
      ) : halfPaid ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClickPayNow();
          }}
          title={`Yarım Ödeme - Toplam Ödenen: ${totalPaid} TL`}
          className={cn(
            "absolute top-1 right-1 z-10",
            "transform transition-all duration-200",
            "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-300 rounded-full"
          )}
        >
          <FaCheckCircle className="w-5 h-5 text-red-500 hover:text-red-600 drop-shadow-sm" />
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClickPayNow();
          }}
          className={cn(
            "absolute top-1 right-1 z-10",
            "bg-gradient-to-r from-teal-500 to-cyan-600",
            "hover:from-teal-600 hover:to-cyan-700",
            "text-white text-xs px-2 py-1 rounded-full",
            "shadow-lg transform transition-all duration-200",
            "hover:scale-110 hover:shadow-xl",
            "focus:outline-none focus:ring-2 focus:ring-teal-300"
          )}
        >
          <FaMoneyBill className="w-4 h-4" />
        </button>
      )}
      
      <div className="text-sm font-medium pr-10 text-gray-800 group-hover:text-gray-900 transition-colors leading-relaxed">
        {participantNames}
      </div>
    </div>
  );
};

export default PaymentStatusCell; 