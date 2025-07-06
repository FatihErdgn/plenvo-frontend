import React, { useMemo, useState, useCallback, useRef } from "react";
import { DAYS, DAYS_SHORT, TIME_SLOTS } from "../../../constants/calendarConstants";
import { formatDate, getPastelColor, findAppointmentForCell, isVirtualInstance, getWeekDates, cn } from "../../../utils/calendarUtils";
import PaymentStatusCell from "./PaymentStatusCell";

const CalendarGrid = ({
  appointments,
  currentWeekStart,
  selectedDoctorName,
  isDoctorSelected,
  onCellClick,
  onPaymentClick,
  paymentRefreshTrigger,
  preventAutoPopup,
  refreshAppointments
}) => {
  const weekDates = useMemo(() => getWeekDates(currentWeekStart), [currentWeekStart]);
  
  // Drag-select state
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [startCell, setStartCell] = useState(null);
  const [endCell, setEndCell] = useState(null);
  const isDragging = useRef(false);

  // Cell key oluştur
  const getCellKey = (dayIndex, timeIndex) => `${dayIndex}-${timeIndex}`;
  
  // Seçili hücreleri hesapla
  const calculateSelectedCells = useCallback((start, end) => {
    if (!start || !end) return new Set();
    
    const cells = new Set();
    const minDay = Math.min(start.dayIndex, end.dayIndex);
    const maxDay = Math.max(start.dayIndex, end.dayIndex);
    const minTime = Math.min(start.timeIndex, end.timeIndex);
    const maxTime = Math.max(start.timeIndex, end.timeIndex);
    
    // Sadece aynı gündeki ardışık slotları seç
    if (minDay === maxDay) {
      for (let t = minTime; t <= maxTime; t++) {
        cells.add(getCellKey(minDay, t));
      }
    }
    
    return cells;
  }, []);

  // Mouse down handler
  const handleMouseDown = useCallback((dayIndex, timeIndex, appointment) => {
    if (!isDoctorSelected || appointment) return;
    
    isDragging.current = true;
    setIsSelecting(true);
    const cell = { dayIndex, timeIndex };
    setStartCell(cell);
    setEndCell(cell);
    setSelectedCells(new Set([getCellKey(dayIndex, timeIndex)]));
  }, [isDoctorSelected]);

  // Mouse enter handler
  const handleMouseEnter = useCallback((dayIndex, timeIndex) => {
    if (!isDragging.current || !startCell) return;
    
    // Sadece aynı gündeki hücreleri seçmeye izin ver
    if (dayIndex !== startCell.dayIndex) return;
    
    const newEndCell = { dayIndex, timeIndex };
    setEndCell(newEndCell);
    setSelectedCells(calculateSelectedCells(startCell, newEndCell));
  }, [startCell, calculateSelectedCells]);

  // Mouse up handler
  const handleMouseUp = useCallback(() => {
    if (!isDragging.current || !startCell || !endCell) return;
    
    isDragging.current = false;
    setIsSelecting(false);
    
    // Seçili hücre sayısını hesapla
    const minTime = Math.min(startCell.timeIndex, endCell.timeIndex);
    const maxTime = Math.max(startCell.timeIndex, endCell.timeIndex);
    const slotCount = maxTime - minTime + 1;
    
    // onCellClick'i çağır - birden fazla slot seçildi bilgisiyle
    onCellClick(startCell.dayIndex, minTime, null, {
      isMultiSelect: true,
      slotCount: slotCount,
      endTimeIndex: maxTime
    });
    
    // State'leri temizle
    setSelectedCells(new Set());
    setStartCell(null);
    setEndCell(null);
  }, [startCell, endCell, onCellClick]);

  // Global mouse up listener
  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging.current) {
        handleMouseUp();
      }
    };
    
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [handleMouseUp]);

  const renderTableHeader = () => (
    <thead className="sticky top-0 z-20 bg-white">
      <tr>
        <th
          colSpan={DAYS.length + 1}
          className={cn(
            "border-0 p-4 text-white text-lg font-semibold text-center",
            "bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600",
            "shadow-lg"
          )}
        >
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>{selectedDoctorName}</span>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
        </th>
      </tr>
      <tr className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-[3.5rem] z-10">
        <th className="border border-gray-200 p-3 bg-white font-medium text-gray-700 w-[15%] sticky left-0 z-20 shadow-sm">
          <div className="flex items-center justify-center">
            <span className="text-sm">Saat</span>
          </div>
        </th>
        {DAYS.map((day, index) => (
          <th
            key={index}
            className="border border-gray-200 p-3 bg-white text-center w-[calc(85%/7)] font-medium text-gray-700"
          >
            <div className="space-y-1">
              <div className="text-sm">
                <span className="hidden md:inline">{day}</span>
                <span className="md:hidden font-semibold">{DAYS_SHORT[index]}</span>
              </div>
              <div className="text-xs text-gray-500 font-normal">
                {formatDate(weekDates[index], "d MMM")}
              </div>
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );

  const renderTimeSlot = (slot, timeIndex) => {
    // Her saat başını vurgula
    const isHourStart = timeIndex % 4 === 0;
    
    return (
      <td
        key={`time-${timeIndex}`}
        className={cn(
          "border border-gray-200 p-1 text-center font-medium text-gray-700",
          "bg-white",
          "sticky left-0 z-10 shadow-md",
          isHourStart && "border-t-2 border-t-gray-400"
        )}
      >
        <div className={cn(
          "text-xs whitespace-nowrap",
          isHourStart ? "font-semibold" : "font-normal text-gray-500"
        )}>
          {slot}
        </div>
      </td>
    );
  };

  const renderCalendarCell = (dayIndex, timeIndex) => {
    const cellSpecificDate = weekDates[dayIndex];
    const appointment = findAppointmentForCell(appointments, dayIndex, timeIndex, cellSpecificDate);
    const cellKey = getCellKey(dayIndex, timeIndex);
    const isSelected = selectedCells.has(cellKey);
    
    const baseClasses = cn(
      "relative border border-gray-200 p-1 h-12 md:h-14 transition-all duration-300",
      "hover:shadow-md group select-none",
      isDoctorSelected ? "cursor-pointer" : "cursor-not-allowed"
    );

    const cellClasses = appointment 
      ? cn(baseClasses, getPastelColor(appointment), "border-2 hover:border-gray-300")
      : cn(
          baseClasses, 
          isSelected ? "bg-teal-100 border-teal-400 border-2" : "bg-white hover:bg-gray-50"
        );

    return (
      <td
        key={`cell-${dayIndex}-${timeIndex}`}
        onMouseDown={() => handleMouseDown(dayIndex, timeIndex, appointment)}
        onMouseEnter={() => handleMouseEnter(dayIndex, timeIndex)}
        onClick={isDoctorSelected && !isSelecting ? () => onCellClick(dayIndex, timeIndex, appointment) : undefined}
        className={cellClasses}
        title={
          !isDoctorSelected
            ? "Danışman seçiniz"
            : appointment?.description
            ? `Randevu Açıklaması: ${appointment.description}`
            : "Yeni randevu oluşturmak için tıklayın veya sürükleyerek birden fazla slot seçin"
        }
      >
        {appointment ? (
          <div className="w-full h-full flex flex-col">
            {/* Sadece ilk slot'ta içeriği göster */}
            {appointment.timeIndex === timeIndex ? (
              <>
                <PaymentStatusCell
                  appointment={appointment}
                  onClickPayNow={() => {
                    if (isDoctorSelected) {
                      onPaymentClick(appointment);
                    }
                  }}
                  refreshTrigger={paymentRefreshTrigger}
                  fetchAppointments={refreshAppointments}
                  preventAutoPopup={preventAutoPopup}
                />
                
                {/* Multi-slot göstergesi
                {appointment.slotCount > 1 && (
                  <div className="absolute top-1 right-1 text-xs bg-gray-700 text-white px-1 py-0.5 rounded">
                    {appointment.slotCount * 15}dk
                  </div>
                )} */}
                
                {/* Sanal Instance Göstergesi */}
                {isVirtualInstance(appointment) && (
                  <div className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-blue-500 shadow-md animate-pulse" 
                       title="Tekrarlı Randevu" />
                )}
                
                {/* Appointment Type Badge */}
                {appointment.appointmentType && (
                  <div className="absolute bottom-1 left-1 text-xs bg-white bg-opacity-80 px-1 py-0.5 rounded text-gray-600 font-medium">
                    {appointment.appointmentType.charAt(0)}
                  </div>
                )}
              </>
            ) : (
              // Diğer slot'larda sadece boş alan göster
              <div className="w-full h-full relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                  ↑
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 italic text-sm">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {isDoctorSelected ? "Randevu Ekle" : "Danışman Seç"}
            </span>
          </div>
        )}
      </td>
    );
  };

  const renderTableBody = () => (
    <tbody>
      {TIME_SLOTS.map((slot, timeIndex) => (
        <tr key={timeIndex} className="hover:bg-gray-50 transition-colors duration-200">
          {renderTimeSlot(slot, timeIndex)}
          {DAYS.map((_, dayIndex) => renderCalendarCell(dayIndex, timeIndex))}
        </tr>
      ))}
    </tbody>
  );

  return (
    <div className={cn(
      "rounded-xl overflow-hidden relative",
      "bg-white backdrop-blur-sm",
      !isDoctorSelected && "opacity-50"
    )}>
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
        <table className="table-fixed w-full border-collapse min-w-[900px] xl:min-w-full">
          {renderTableHeader()}
          {renderTableBody()}
        </table>
      </div>
      
      {/* Loading Overlay */}
      {!isDoctorSelected && (
        <div className="absolute inset-0 bg-white bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-600 font-medium">Danışman Seçiniz</p>
              <p className="text-sm text-gray-500">Takvimi görüntülemek için bir danışman seçin</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarGrid; 