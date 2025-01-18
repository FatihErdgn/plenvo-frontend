import { useState, useEffect } from "react";
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";

export default function ExpensesInputForm({ expensesData }) {
  const [formData, setFormData] = useState({
    ExpenseCategory: "",
    ExpenseKind: "",
    Currency: "",
    ExpenseDesc: "",
    ExpenseDate: "",
    Amount: "",
    // Manuel alanlar
    ManualExpenseCategory: "",
    ManualExpenseKind: "",
    ManualCurrency: "",
  });

  // Her dropdown için manuel giriş aktif mi?
  const [manualEntry, setManualEntry] = useState({
    ExpenseCategory: false,
    ExpenseKind: false,
    Currency: false,
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

  // Dışına tıklayınca dropdown kapatma
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

  /**
   * Dropdown içindeki bir seçeneğe tıklayınca çalışan fonksiyon.
   * Eğer "Diğer" seçeneği seçildiyse o dropdown için manuel girişi açıyoruz.
   */
  const handleSelect = (key, value) => {
    if (value === "Diğer") {
      // Manuel girişi aktif et
      setManualEntry((prev) => ({
        ...prev,
        [key]: true,
      }));
      // Normal dropdown seçimini sıfırla
      setFormData((prev) => ({
        ...prev,
        [key]: "",
        // Manuel alanı da sıfırla
        [`Manual${key}`]: "",
      }));
    } else {
      // Normal seçim yapıldı, manuel girişi kapat
      setManualEntry((prev) => ({
        ...prev,
        [key]: false,
      }));
      setFormData((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
    // Dropdownu kapat
    setDropdownOpen((prev) => ({
      ...prev,
      [key]: false,
    }));
  };

  /**
   * Manuel girişi devre dışı bırakıp tekrar dropdown'a dönmek için çağıracağımız fonksiyon
   */
  const handleDisableManualEntry = (key) => {
    setManualEntry((prev) => ({
      ...prev,
      [key]: false,
    }));
    // Geri dönüldüğünde manuel inputu temizlemek isterseniz:
    setFormData((prev) => ({
      ...prev,
      [`Manual${key}`]: "",
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  /**
   * Form submit
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    // 1) Final değerleri belirle
    const finalExpenseCategory = manualEntry.ExpenseCategory
      ? formData.ManualExpenseCategory
      : formData.ExpenseCategory;

    const finalExpenseKind = manualEntry.ExpenseKind
      ? formData.ManualExpenseKind
      : formData.ExpenseKind;

    const finalCurrency = manualEntry.Currency
      ? formData.ManualCurrency
      : formData.Currency;

    // 2) Validasyon
    if (
      !finalExpenseCategory ||
      !finalExpenseKind ||
      !finalCurrency ||
      !formData.ExpenseDesc ||
      !formData.ExpenseDate ||
      !formData.Amount
    ) {
      setAlertState({
        message: "Lütfen tüm alanları doldurun.",
        severity: "error",
        open: true,
      });
      return;
    }

    // 3) En son console veya API call
    console.log("Form Data:", {
      ...formData,
      ExpenseCategory: finalExpenseCategory,
      ExpenseKind: finalExpenseKind,
      Currency: finalCurrency,
    });

    setAlertState({
      message: "Başarılı bir şekilde eklendi.",
      severity: "success",
      open: true,
    });

    // 4) Temizleme
    setFormData({
      ExpenseCategory: "",
      ExpenseKind: "",
      Currency: "",
      ExpenseDesc: "",
      ExpenseDate: "",
      Amount: "",
      ManualExpenseCategory: "",
      ManualExpenseKind: "",
      ManualCurrency: "",
    });
    setManualEntry({
      ExpenseCategory: false,
      ExpenseKind: false,
      Currency: false,
    });
  };

  // Alert'i 5 sn sonra kapat
  useEffect(() => {
    if (alertState.open) {
      const timer = setTimeout(() => {
        setAlertState((prev) => ({ ...prev, open: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertState.open]);

  // Dropdown verilerini uniq hale getirme
  const uniqueCategories = [
    ...new Set(expensesData.map((item) => item.ExpenseCategory)),
  ];
  const uniqueKinds = [
    ...new Set(expensesData.map((item) => item.ExpenseKind)),
  ];
  const uniqueCurrencies = [
    ...new Set(expensesData.map((item) => item.Currency)),
  ];

  const renderDropdown = (label, key, options) => {
    const isManual = manualEntry[key];

    return (
      <div className="relative mb-3 dropdown-container">
        <label htmlFor={key} className="text-gray-700 mb-2 block">
          {label}
        </label>

        {/* Dropdown veya Manuel Giriş gösterme durumu */}
        <div
          className={`px-4 py-2 border border-gray-300 rounded-lg bg-white flex justify-between items-center ${
            isManual
              ? "cursor-not-allowed opacity-70"
              : "cursor-pointer hover:border-[#007E85]"
          }`}
          onClick={() => {
            if (!isManual) toggleDropdown(key);
          }}
        >
          {isManual ? "Manuel Giriş Aktif" : formData[key] || `${label} Seçin`}

          {!isManual && (
            <span className="ml-2 transform transition-transform duration-200 opacity-50">
              {dropdownOpen[key] ? "▲" : "▼"}
            </span>
          )}
        </div>

        {/* Dropdown listesi */}
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
            {/* "Diğer (Manuel Ekle)" seçeneği */}
            <li
              className="px-4 py-2 hover:bg-[#007E85] hover:text-white cursor-pointer"
              onClick={() => handleSelect(key, "Diğer")}
            >
              Diğer (Manuel Ekle)
            </li>
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col bg-white justify-center items-center font-poppins rounded-lg shadow-md">
      {/* Alert */}
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
        className="flex flex-col w-full min-w-[400px] h-full justify-center p-8"
      >
        <h2 className="text-xl font-semibold mb-6">Maliyet Formu</h2>

        <div>
          {manualEntry.ExpenseCategory ? (
            <div className="mb-3">
              <label
                htmlFor="ManualExpenseCategory"
                className="text-gray-700 mb-2 block"
              >
                Yeni Kategori
              </label>
              <input
                type="text"
                name="ManualExpenseCategory"
                value={formData.ManualExpenseCategory}
                onChange={handleInputChange}
                className="px-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#007E85] mb-1"
              />
              {/* Manuel girişi geri al butonu */}
              <button
                type="button"
                onClick={() => handleDisableManualEntry("ExpenseCategory")}
                className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
              >
                Seçeneklere Geri Dön
              </button>
            </div>
          ) : (
            renderDropdown("Kategori", "ExpenseCategory", uniqueCategories)
          )}
        </div>

        {/* Açıklama */}
        <label htmlFor="ExpenseDesc" className="text-gray-700 mb-2 block">
          Açıklama
        </label>
        <textarea
          name="ExpenseDesc"
          value={formData.ExpenseDesc}
          onChange={handleInputChange}
          rows="3"
          className="px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-[#007E85] resize-none overflow-auto"
        />

        <div>
          {manualEntry.ExpenseKind ? (
            <div className="mb-3">
              <label
                htmlFor="ManualExpenseKind"
                className="text-gray-700 mb-2 block"
              >
                Yeni Kalem Türü
              </label>
              <input
                type="text"
                name="ManualExpenseKind"
                value={formData.ManualExpenseKind}
                onChange={handleInputChange}
                className="px-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#007E85] mb-1"
              />
              {/* Manuel girişi geri al butonu */}
              <button
                type="button"
                onClick={() => handleDisableManualEntry("ExpenseKind")}
                className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
              >
                Seçeneklere Geri Dön
              </button>
            </div>
          ) : (
            renderDropdown("Kalem Türü", "ExpenseKind", uniqueKinds)
          )}
        </div>

        {/* Fiyat */}
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

        <div>
          {manualEntry.Currency ? (
            <div className="mb-3">
              <label
                htmlFor="ManualCurrency"
                className="text-gray-700 mb-2 block"
              >
                Yeni Para Birimi
              </label>
              <input
                type="text"
                name="ManualCurrency"
                value={formData.ManualCurrency}
                onChange={handleInputChange}
                className="px-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#007E85] mb-1"
              />
              {/* Manuel girişi geri al butonu */}
              <button
                type="button"
                onClick={() => handleDisableManualEntry("Currency")}
                className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
              >
                Seçeneklere Geri Dön
              </button>
            </div>
          ) : (
            renderDropdown("Para Birimi", "Currency", uniqueCurrencies)
          )}
        </div>

        {/* Tarih */}
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
          className="bg-[#399AA1] text-white px-4 py-2 rounded-[20px] hover:bg-[#007E85] mt-6 shadow-md"
        >
          Maliyet Ekle
        </button>
      </form>
    </div>
  );
}
