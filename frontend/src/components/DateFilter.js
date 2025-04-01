import React, { useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";

export default function DateFilter({ onStartDateChange, onEndDateChange }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative flex justify-center">
      {/* Mobil ekranlarda sadece ikon göster - z-index arttırıldı */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          md:hidden flex items-center justify-center w-10 h-10 rounded-full 
          bg-white shadow-sm hover:bg-gray-50 
          relative z-30 ${isOpen ? 'ring-2 ring-[#007E85]/30' : ''}
        `}
      >
        <FaCalendarAlt className="text-[#007E85]" />
      </button>

      {/* Mobilde tıklayınca açılan, desktop'ta normal görünen tarih seçici */}
      <div 
        className={`
          ${isOpen ? 'flex' : 'hidden'} 
          md:flex font-poppins flex-col md:flex-row items-center bg-[#ffffff] 
          absolute md:static left-1/2 md:left-auto transform -translate-x-1/2 md:transform-none
          top-12 z-30
          w-[16rem] md:w-full max-w-[31.25rem] rounded-lg md:rounded-full 
          px-4 py-3 md:py-2 shadow-md md:shadow-sm space-y-2 md:space-y-0 md:space-x-4
        `}
      >
        <div className="flex items-center w-full">
          <span className="text-gray-500 mr-2 md:hidden">Başlangıç:</span>
          <input
            type="date"
            onChange={onStartDateChange}
            className="flex-grow bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
            placeholder="Başlangıç Tarihi"
            style={{color: "#4B5563"}}
          />
        </div>
        
        <span className="hidden md:inline">-</span>
        
        <div className="flex items-center w-full">
          <span className="text-gray-500 mr-2 md:hidden">Bitiş:</span>
          <input
            type="date"
            onChange={onEndDateChange}
            className="flex-grow bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
            placeholder="Bitiş Tarihi"
            style={{color: "#4B5563"}}
          />
        </div>
      </div>
      
      {/* Popup açıkken arka plan overlay - sadece mobilde */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-20 md:hidden" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
}