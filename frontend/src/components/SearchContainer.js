import React, { useState } from "react";
import SearchBar from "./SearchBar";
import { FaSearch } from "react-icons/fa";

const SearchContainer = ({ onSearchChange }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="relative flex flex-row items-center justify-end">
      {/* Mobil ekranlarda sadece arama ikonu göster - z-index arttırıldı */}
      <button 
        onClick={() => setIsSearchOpen(!isSearchOpen)}
        className={`
          md:hidden flex items-center justify-center w-10 h-10 rounded-full 
          bg-white shadow-sm hover:bg-gray-50 
          relative z-30 ${isSearchOpen ? 'ring-2 ring-[#007E85]/30' : ''}
        `}
      >
        <FaSearch className="text-[#007E85]" />
      </button>

      {/* Mobilde tıklayınca açılan, desktop'ta normal görünen arama alanı */}
      <div 
        className={`
          ${isSearchOpen ? 'block' : 'hidden'} 
          md:block absolute md:static left-1/2 md:left-auto transform -translate-x-1/2 md:transform-none
          top-12 z-30 min-w-[16rem] md:min-w-0
        `}
      >
        <SearchBar onSearchChange={onSearchChange} />
      </div>
      
      {/* Popup açıkken arka plan overlay - sadece mobilde */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-20 md:hidden" 
          onClick={() => setIsSearchOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default SearchContainer;
