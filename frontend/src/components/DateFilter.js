import React from "react";

export default function DateFilter({ onStartDateChange, onEndDateChange }) {
  return (
      <div className="font-poppins flex flex-row items-center bg-[#ffffff] w-full max-w-[500px] h-[40px] rounded-full px-4 py-2 shadow-sm space-x-4">
        <input
          type="date"
          onChange={onStartDateChange}
          className="flex-grow bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
          placeholder="Başlangıç Tarihi"
          style={{color: "#4B5563"}}
        />
        <span>-</span>
        <input
          type="date"
          onChange={onEndDateChange}
          className="flex-grow bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
          placeholder="Bitiş Tarihi"
          style={{color: "#4B5563"}}
        />
      </div>
  );
}