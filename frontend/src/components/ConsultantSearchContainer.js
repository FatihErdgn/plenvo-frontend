import React from "react";
import SearchBar from "./SearchBar";

const ConsultantSearchContainer = ({ onSearchChange }) => {
  return (
    <div className="flex flex-row items-center justify-end space-x-6">
      <SearchBar onSearchChange={onSearchChange} />
    </div>
  );
};

export default ConsultantSearchContainer;
