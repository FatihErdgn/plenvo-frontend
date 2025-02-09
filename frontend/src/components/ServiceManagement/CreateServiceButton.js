import { Alert, Collapse } from "@mui/material";
import { useState, useEffect } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
// import CustomDateTimePicker from "./Datepicker.js"

export default function AddService({
  onAddService,
  uniqueServiceNames,
  uniqueProviders,
}) {
  const [isPopUpOpen, setPopUpOpen] = useState(false);
  const [formData, setFormData] = useState({
    serviceName: "",
    provider: "",
    validityDate: "",
    serviceFee: "",
    currencyName: "",
    status: "",
    //Manuel
    manualServiceName: "",
  });

  const [manualEntry, setManualEntry] = useState({
    serviceName: "",
  });

  const [dropdownOpen, setDropdownOpen] = useState({
    serviceName: false,
    provider: false,
    status: false,
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
        [`manual${key}`]: "",
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
      [`manual${key}`]: "",
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1) Final değerleri belirle
    const finalServiceName =
      manualEntry.serviceName && formData.manualServiceName
        ? formData.manualServiceName
        : formData.serviceName || "";

    // 2) Validasyon
    if (
      !finalServiceName ||
      !formData.provider ||
      !formData.validityDate ||
      !formData.serviceFee ||
      !formData.currencyName ||
      !formData.status
    ) {
      setAlertState({
        message: "Lütfen tüm alanları doldurun.",
        severity: "error",
        open: true,
      });
      return;
    }

    try {
      onAddService({
        serviceName: finalServiceName,
        provider: formData.provider,
        validityDate: formData.validityDate,
        serviceFee: formData.serviceFee,
        currencyName: formData.currencyName,
        status: formData.status,
      });
      // 4) Temizleme
      setFormData({
        serviceName: "",
        provider: "",
        validityDate: "",
        serviceFee: "",
        currencyName: "",
        status: "",
        //Manuel
        manualServiceName: "",
        manualProvider: "",
      });
      setManualEntry({
        serviceName: "",
      });
      setAlertState({
        message: "Hizmet başarıyla eklendi.",
        severity: "success",
        open: true,
      });
      setTimeout(() => {
        setPopUpOpen(false);
      }, 500);
    } catch (error) {
      setAlertState({
        message: "Hizmet eklenirken bir hata oluştu.",
        severity: "error",
        open: true,
      });
      return;
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

  const uniqueCurrencies = ["TRY", "USD", "EUR"];

  const renderDropdown = (label, key, options, direction = "down") => {
    const isManual = manualEntry[key];

    return (
      <>
        <label htmlFor={key} className="text-gray-700 mb-2 block">
          {label}
        </label>
        <div className="relative mb-3 dropdown-container">
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
            {isManual
              ? "Manuel Giriş Aktif"
              : formData[key] || `${label} Seçin`}

            {!isManual && (
              <span className="ml-2 transform transition-transform duration-200 opacity-50">
                {dropdownOpen[key] ? "▲" : "▼"}
              </span>
            )}
          </div>

          {/* Dropdown listesi */}
          {dropdownOpen[key] && (
            <ul
              className={`absolute left-0 right-0 bg-white border border-gray-300 rounded-lg max-h-[120px] overflow-auto z-10 ${
                direction === "up" ? "bottom-full mb-1" : "top-full mt-1"
              }`}
            >
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
              {key === "serviceName" && (
                <li
                  className="px-4 py-2 hover:bg-[#007E85] hover:text-white cursor-pointer"
                  onClick={() => handleSelect(key, "Diğer")}
                >
                  Diğer (Manuel Ekle)
                </li>
              )}
            </ul>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="flex justify-center items-center font-poppins">
      <button
        onClick={() => setPopUpOpen(true)}
        className="font-poppins flex flex-row bg-[#399AA1] text-white px-4 py-3 min-w-[140px] rounded-[10px] hover:bg-[#007E85] shadow-md"
      >
        + Hizmet Ekle
      </button>

      {isPopUpOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center transition-opacity duration-300 ease-in-out">
          <div
            className="bg-white p-6 rounded-[10px] shadow-lg w-[30%] px-12 py-8 transform scale-95 transition-transform duration-300 ease-out max-h-[95vh] overflow-y-auto"
            style={{
              animation: "popupSlideIn 0.3s forwards",
            }}
          >
            <button
              className="absolute top-4 right-4 text-red-500 hover:text-gray-600"
              onClick={() => setPopUpOpen(false)}
            >
              <IoIosCloseCircleOutline className="w-7 h-7" />
            </button>
            {/* Alert */}
            <Collapse in={alertState.open}>
              <Alert
                severity={alertState.severity}
                onClose={() => setAlertState({ ...alertState, open: false })}
              >
                {alertState.message}
              </Alert>
            </Collapse>
            <form onSubmit={handleSubmit}>
              <label className="text-xs text-red-500 pb-6">
                (Kişi bazlı hizmetlerde doktorun o hizmeti her randevuda sunduğu
                varsayılacaktır. Değişken hizmetlerde 'Genel Hizmet' seçeneğini
                kullanabilirsiniz.)
              </label>
              <div className="my-4">
                {manualEntry.serviceName ? (
                  <div className="flex gap-2 items-center">
                    <label
                      htmlFor="manualServiceName"
                      className="text-gray-700 mb-2 block"
                    >
                      Hizmet Adı
                    </label>
                    <input
                      type="text"
                      name="manualServiceName"
                      value={formData.manualServiceName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                      required
                    />
                    <button
                      type="button"
                      className="px-4 py-2 bg-red-500 text-white text-xs rounded-[10px] hover:bg-red-600"
                      onClick={() => handleDisableManualEntry("serviceName")}
                    >
                      Manuel Girişi Kapat
                    </button>
                  </div>
                ) : (
                  renderDropdown(
                    "Hizmet Adı",
                    "serviceName",
                    uniqueServiceNames
                  )
                )}
              </div>
              <div className="mb-4">
                {renderDropdown(
                  "Hizmet Sağlayıcı",
                  "provider",
                  uniqueProviders
                )}
              </div>
              <div className="mb-4">
                <label
                  htmlFor="validityDate"
                  className="text-gray-700 mb-2 block"
                >
                  Hizmet Geçerlilik Tarihi
                </label>
                <input
                  type="date"
                  name="validityDate"
                  value={formData.validityDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                />
              </div>
              <div className="mb-4">
                {renderDropdown("Durum", "status", ["Aktif", "Pasif"])}
              </div>
              <div className="mb-4">
                <label
                  htmlFor="serviceFee"
                  className="text-gray-700 mb-2 block"
                >
                  Hizmet Ücreti
                </label>
                <input
                  type="number"
                  name="serviceFee"
                  value={formData.serviceFee}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                />
              </div>
              <div className="mb-4">
                {renderDropdown(
                  "Para Birimi",
                  "currencyName",
                  uniqueCurrencies,
                  "up"
                )}
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setPopUpOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded-[10px] mr-2 hover:bg-gray-400"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#399AA1] text-white rounded-[10px] hover:bg-[#007E85]"
                >
                  Onayla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
