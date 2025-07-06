import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight, FaRegCalendarAlt } from "react-icons/fa";
import { formatDate, getWeekStart, cn } from "../../../utils/calendarUtils";
import { subWeeks, addWeeks, addDays, addMonths, startOfMonth } from 'date-fns';

const DatePicker = ({ 
  currentWeekStart, 
  onWeekChange, 
  isDoctorSelected 
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const goToPreviousWeek = () => {
    if (isDoctorSelected) {
      onWeekChange(subWeeks(currentWeekStart, 1));
    }
  };

  const goToNextWeek = () => {
    if (isDoctorSelected) {
      onWeekChange(addWeeks(currentWeekStart, 1));
    }
  };

  const goToSpecificWeek = (date) => {
    onWeekChange(getWeekStart(date));
    setShowDatePicker(false);
  };

  const goToMonth = (date) => {
    setCurrentMonth(date);
    const firstWeekStart = getWeekStart(startOfMonth(date));
    onWeekChange(firstWeekStart);
    setShowMonthPicker(false);
    setShowDatePicker(true);
  };

  const formatMonthName = (date) => {
    return formatDate(date, "MMMM yyyy");
  };

  const renderWeekPicker = () => (
    <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 z-30 min-w-[350px] animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Hafta Seçin</h3>
        <button
          onClick={() => {
            setShowMonthPicker(true);
            setShowDatePicker(false);
          }}
          className={cn(
            "text-sm bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
            "text-white px-3 py-2 rounded-lg flex items-center space-x-2",
            "transition-all duration-200 hover:scale-105 shadow-md"
          )}
        >
          <span>{formatMonthName(currentMonth)}</span>
          <FaChevronRight className="w-3 h-3" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {(() => {
          const weeksToShow = 12;
          const pastWeeksToShow = 4;
          const startDate = subWeeks(currentWeekStart, pastWeeksToShow);
          
          return Array.from({ length: weeksToShow }, (_, weekOffset) => {
            const weekStartDate = addWeeks(startDate, weekOffset);
            const weekEndDate = addDays(weekStartDate, 6);
            const isCurrentWeek = 
              formatDate(weekStartDate, 'yyyy-MM-dd') === formatDate(currentWeekStart, 'yyyy-MM-dd');
            
            return (
              <button
                key={`week-${weekOffset}`}
                onClick={() => goToSpecificWeek(weekStartDate)}
                className={cn(
                  "p-3 text-center rounded-lg transition-all duration-200 hover:scale-105",
                  isCurrentWeek 
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg' 
                    : 'bg-gray-50 hover:bg-gradient-to-r hover:from-teal-100 hover:to-cyan-100 text-gray-700 hover:text-teal-700'
                )}
              >
                <div className="text-sm font-medium">
                  {formatDate(weekStartDate, "d MMM")}
                </div>
                <div className="text-xs opacity-80">
                  - {formatDate(weekEndDate, "d MMM")}
                </div>
              </button>
            );
          });
        })()}
      </div>
      
      <div className="mt-6 flex justify-between">
        <button 
          onClick={() => goToSpecificWeek(getWeekStart(new Date()))} 
          className="text-sm bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-md"
        >
          Bugün
        </button>
        <button 
          onClick={() => setShowDatePicker(false)} 
          className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
        >
          Kapat
        </button>
      </div>
    </div>
  );

  const renderMonthPicker = () => (
    <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 z-30 min-w-[350px] animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Ay Seçin</h3>
        <button
          onClick={() => {
            setShowMonthPicker(false);
            setShowDatePicker(true);
          }}
          className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
        >
          Hafta Seçimine Dön
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 24 }, (_, monthOffset) => {
          const targetMonth = addMonths(new Date(), monthOffset - 12);
          const isCurrentMonth = 
            formatDate(targetMonth, 'yyyy-MM') === formatDate(currentMonth, 'yyyy-MM');
          
          return (
            <button
              key={`month-${monthOffset}`}
              onClick={() => goToMonth(targetMonth)}
              className={cn(
                "p-3 text-center rounded-lg transition-all duration-200 hover:scale-105",
                isCurrentMonth 
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg' 
                  : 'bg-gray-50 hover:bg-gradient-to-r hover:from-teal-100 hover:to-cyan-100 text-gray-700 hover:text-teal-700'
              )}
            >
              <div className="text-sm font-medium">
                {formatDate(targetMonth, "MMM")}
              </div>
              <div className="text-xs opacity-80">
                {formatDate(targetMonth, "yyyy")}
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="mt-6 flex justify-between">
        <button 
          onClick={() => goToMonth(new Date())} 
          className="text-sm bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-md"
        >
          Bu Ay
        </button>
        <button 
          onClick={() => setShowMonthPicker(false)} 
          className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
        >
          Kapat
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex items-center space-x-3 relative">
      <button 
        onClick={goToPreviousWeek}
        disabled={!isDoctorSelected}
        className={cn(
          "p-3 rounded-full transition-all duration-200",
          isDoctorSelected 
            ? "bg-white hover:bg-gray-100 shadow-md hover:shadow-lg hover:scale-110 text-gray-700" 
            : "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
        )}
      >
        <FaChevronLeft className="w-4 h-4" />
      </button>
      
      <button 
        onClick={() => isDoctorSelected && setShowDatePicker(!showDatePicker)}
        disabled={!isDoctorSelected}
        className={cn(
          "flex items-center space-x-3 px-4 py-3 rounded-xl border transition-all duration-200",
          isDoctorSelected 
            ? "bg-white hover:bg-gray-50 shadow-md hover:shadow-lg border-gray-200 text-gray-700 hover:scale-105" 
            : "opacity-50 cursor-not-allowed bg-gray-100 border-gray-200 text-gray-400"
        )}
      >
        <FaRegCalendarAlt className="w-4 h-4" />
        <span className="font-medium">
          {formatDate(currentWeekStart, "d MMM")} - {formatDate(addDays(currentWeekStart, 6), "d MMM yyyy")}
        </span>
      </button>
      
      <button 
        onClick={goToNextWeek}
        disabled={!isDoctorSelected}
        className={cn(
          "p-3 rounded-full transition-all duration-200",
          isDoctorSelected 
            ? "bg-white hover:bg-gray-100 shadow-md hover:shadow-lg hover:scale-110 text-gray-700" 
            : "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
        )}
      >
        <FaChevronRight className="w-4 h-4" />
      </button>
      
      {showDatePicker && isDoctorSelected && renderWeekPicker()}
      {showMonthPicker && isDoctorSelected && renderMonthPicker()}
    </div>
  );
};

export default DatePicker; 