import { useState, useEffect } from "react";
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";

export default function ExpensesInputForm({ expensesData }) {
  const [formData, setFormData] = useState({
    ExpenseCategory: "",
    ExpenseDesc: "",
    ExpenseDate: "",
    ExpenseKind: "",
    Amount: "",
    Currency: "",
  });

  const [dropdownOpen, setDropdownOpen] = useState({
    ExpenseCategory: false,
    ExpenseKind: false,
    Currency: false,
  });

  const [alertState, setAlertState] = useState({
    message: "",
    severity: "",
    open: false,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      const dropdowns = document.querySelectorAll(".dropdown-container");
      let clickedInside = false;

      dropdowns.forEach((dropdown) => {
        if (dropdown.contains(event.target)) {
          clickedInside = true;
        }
      });

      if (!clickedInside) {
        setDropdownOpen({
          ExpenseCategory: false,
          ExpenseKind: false,
          Currency: false,
        });
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const toggleDropdown = (key) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelect = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
    setDropdownOpen((prev) => ({
      ...prev,
      [key]: false,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.ExpenseCategory ||
      !formData.ExpenseDesc ||
      !formData.ExpenseDate ||
      !formData.ExpenseKind ||
      !formData.Amount ||
      !formData.Currency
    ) {
      setAlertState({
        message: "Lütfen tüm alanları doldurun.",
        severity: "error",
        open: true,
      });
      return;
    }

    console.log("Form Data:", formData);
    setAlertState({
      message: "Başarılı bir şekilde eklendi.",
      severity: "success",
      open: true,
    });

    setFormData({
      ExpenseCategory: "",
      ExpenseDesc: "",
      ExpenseDate: "",
      ExpenseKind: "",
      Amount: "",
      Currency: "",
    });
  };

  useEffect(() => {
    if (alertState.open) {
      const timer = setTimeout(() => {
        setAlertState((prev) => ({ ...prev, open: false }));
      }, 5000); // 5 saniye sonra otomatik kapanır

      return () => clearTimeout(timer); // Temizleme işlemi
    }
  }, [alertState.open]);

  const uniqueCategories = [
    ...new Set(expensesData.map((item) => item.ExpenseCategory)),
  ];
  const uniqueCurrencies = [
    ...new Set(expensesData.map((item) => item.Currency)),
  ];
  const uniqueKinds = [
    ...new Set(expensesData.map((item) => item.ExpenseKind)),
  ];

  const renderDropdown = (label, key, options) => (
    <div className="relative mb-3 dropdown-container">
      <label htmlFor={key} className="text-gray-700 mb-2 block">
        {label}
      </label>
      <div
        className="px-4 py-2 border border-gray-300 rounded-lg cursor-pointer bg-white flex justify-between items-center"
        onClick={() => toggleDropdown(key)}
      >
        {formData[key] || `${label} Seçin`}
        <span className="ml-2 transform transition-transform duration-200 opacity-50">
          {dropdownOpen[key] ? "▲" : "▼"}
        </span>
      </div>
      {dropdownOpen[key] && (
        <ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg max-h-40 overflow-auto z-10">
          {options.map((option, index) => (
            <li
              key={index}
              className="px-4 py-2 hover:bg-[#007E85] hover:text-white cursor-pointer"
              onClick={() => handleSelect(key, option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="flex flex-col justify-center items-center font-poppins">
      <Collapse in={alertState.open}>
        <Alert
          severity={alertState.severity}
          onClose={() => setAlertState({ ...alertState, open: false })}
        >
          {alertState.message}
        </Alert>
      </Collapse>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-full min-w-[400px] h-full justify-center p-8 rounded-lg shadow-md"
      >
        <h2 className="text-xl font-semibold mb-6">Gelir/Gider Formu</h2>
        {renderDropdown("Kategori", "ExpenseCategory", uniqueCategories)}
        <label htmlFor="ExpenseDesc" className="text-gray-700 mb-2 block">
          Açıklama
        </label>
        <textarea
          name="ExpenseDesc"
          value={formData.ExpenseDesc}
          onChange={handleInputChange}
          rows="3" // Başlangıçta 3 satır yüksekliğinde olacak
          className="px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-[#007E85] resize-none overflow-auto"
        />

        {renderDropdown("Kalem Türü", "ExpenseKind", uniqueKinds)}
        <label htmlFor="Amount" className="text-gray-700 mb-2 block">
          Fiyat
        </label>
        <input
          type="number"
          name="Amount"
          value={formData.Amount}
          onChange={handleInputChange}
          className="px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-[#007E85]"
        />
        {renderDropdown("Para Birimi", "Currency", uniqueCurrencies)}
        <label htmlFor="ExpenseDate" className="text-gray-700 mb-2 block">
          Tarih
        </label>
        <input
          type="date"
          name="ExpenseDate"
          value={formData.ExpenseDate}
          onChange={handleInputChange}
          className="px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-[#007E85]"
        />
        <button
          type="submit"
          className="bg-[#399AA1] text-white px-4 py-2 rounded-[20px] hover:bg-[#007E85] mt-6"
        >
          Gelir/Gider Ekle
        </button>
      </form>
    </div>
  );
}
