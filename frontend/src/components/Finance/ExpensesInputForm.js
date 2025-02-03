import { useState, useEffect } from "react";
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";
import { createExpense } from "../../services/expenseService";

export default function ExpensesInputForm({ expensesData }) {
  const [formData, setFormData] = useState({
    expenseCategory: "",
    expenseKind: "",
    currencyName: "",
    expenseDescription: "",
    expenseDate: "",
    expenseAmount: "",
    // Manuel alanlar
    ManualexpenseCategory: "",
    ManualexpenseKind: "",
    ManualcurrencyName: "",
  });

  // Her dropdown için manuel giriş aktif mi?
  const [manualEntry, setManualEntry] = useState({
    expenseCategory: false,
    expenseKind: false,
    currencyName: false,
  });

  const [dropdownOpen, setDropdownOpen] = useState({
    expenseCategory: false,
    expenseKind: false,
    currencyName: false,
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
          expenseCategory: false,
          expenseKind: false,
          currencyName: false,
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
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🛠 Hata engelleme: Eğer manuel giriş boşsa, dropdown seçimi al
    const finalexpenseCategory =
      manualEntry.expenseCategory && formData.ManualexpenseCategory
        ? formData.ManualexpenseCategory
        : formData.expenseCategory || "Belirtilmedi";

    const finalexpenseKind =
      manualEntry.expenseKind && formData.ManualexpenseKind
        ? formData.ManualexpenseKind
        : formData.expenseKind || "Belirtilmedi";

    const finalcurrencyName =
      manualEntry.currencyName && formData.ManualcurrencyName
        ? formData.ManualcurrencyName
        : formData.currencyName || "Belirtilmedi";

    // 🛠 Validasyon
    if (
      !finalexpenseCategory ||
      !finalexpenseKind ||
      !finalcurrencyName ||
      !formData.expenseDescription ||
      !formData.expenseDate ||
      !formData.expenseAmount
    ) {
      setAlertState({
        message: "Lütfen tüm alanları doldurun.",
        severity: "error",
        open: true,
      });
      return;
    }

    try {
      const result = await createExpense({
        expenseCategory: finalexpenseCategory,
        expenseDescription: formData.expenseDescription,
        expenseKind: finalexpenseKind,
        expenseAmount: formData.expenseAmount,
        expenseDate: formData.expenseDate,
        currencyName: finalcurrencyName,
      });

      console.log(result.message);
      setAlertState({
        message: "Başarılı bir şekilde eklendi.",
        severity: "success",
        open: true,
      });

      setFormData({
        expenseCategory: "",
        expenseKind: "",
        currencyName: "",
        expenseDescription: "",
        expenseDate: "",
        expenseAmount: "",
        ManualexpenseCategory: "",
        ManualexpenseKind: "",
        ManualcurrencyName: "",
      });

      setManualEntry({
        expenseCategory: false,
        expenseKind: false,
        currencyName: false,
      });
    } catch (error) {
      console.error("Create Expense Error:", error);
      setAlertState({
        message: "Bir hata oluştu.",
        severity: "error",
        open: true,
      });
    }
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
    ...new Set(expensesData.map((item) => item.expenseCategory)),
  ];
  const uniqueKinds = [
    ...new Set(expensesData.map((item) => item.expenseKind)),
  ];
  const uniqueCurrencies = [
    ...new Set(expensesData.map((item) => item.currencyName)),
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
          {manualEntry.expenseCategory ? (
            <div className="mb-3">
              <label
                htmlFor="ManualexpenseCategory"
                className="text-gray-700 mb-2 block"
              >
                Yeni Kategori
              </label>
              <input
                type="text"
                name="ManualexpenseCategory"
                value={formData.ManualexpenseCategory}
                onChange={handleInputChange}
                className="px-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#007E85] mb-1"
              />
              {/* Manuel girişi geri al butonu */}
              <button
                type="button"
                onClick={() => handleDisableManualEntry("expenseCategory")}
                className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
              >
                Seçeneklere Geri Dön
              </button>
            </div>
          ) : (
            renderDropdown("Kategori", "expenseCategory", uniqueCategories)
          )}
        </div>

        {/* Açıklama */}
        <label
          htmlFor="expenseDescription"
          className="text-gray-700 mb-2 block"
        >
          Açıklama
        </label>
        <textarea
          name="expenseDescription"
          value={formData.expenseDescription}
          onChange={handleInputChange}
          rows="3"
          className="px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-[#007E85] resize-none overflow-auto"
        />

        <div>
          {manualEntry.expenseKind ? (
            <div className="mb-3">
              <label
                htmlFor="ManualexpenseKind"
                className="text-gray-700 mb-2 block"
              >
                Yeni Kalem Türü
              </label>
              <input
                type="text"
                name="ManualexpenseKind"
                value={formData.ManualexpenseKind}
                onChange={handleInputChange}
                className="px-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#007E85] mb-1"
              />
              {/* Manuel girişi geri al butonu */}
              <button
                type="button"
                onClick={() => handleDisableManualEntry("expenseKind")}
                className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
              >
                Seçeneklere Geri Dön
              </button>
            </div>
          ) : (
            renderDropdown("Kalem Türü", "expenseKind", uniqueKinds)
          )}
        </div>

        {/* Fiyat */}
        <label htmlFor="expenseAmount" className="text-gray-700 mb-2 block">
          Fiyat
        </label>
        <input
          type="number"
          name="expenseAmount"
          value={formData.expenseAmount}
          onChange={handleInputChange}
          className="px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-[#007E85]"
        />

        <div>
          {manualEntry.currencyName ? (
            <div className="mb-3">
              <label
                htmlFor="ManualcurrencyName"
                className="text-gray-700 mb-2 block"
              >
                Yeni Para Birimi
              </label>
              <input
                type="text"
                name="ManualcurrencyName"
                value={formData.ManualcurrencyName}
                onChange={handleInputChange}
                className="px-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#007E85] mb-1"
              />
              {/* Manuel girişi geri al butonu */}
              <button
                type="button"
                onClick={() => handleDisableManualEntry("currencyName")}
                className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
              >
                Seçeneklere Geri Dön
              </button>
            </div>
          ) : (
            renderDropdown("Para Birimi", "currencyName", uniqueCurrencies)
          )}
        </div>

        {/* Tarih */}
        <label htmlFor="expenseDate" className="text-gray-700 mb-2 block">
          Tarih
        </label>
        <input
          type="date"
          name="expenseDate"
          value={formData.expenseDate}
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
