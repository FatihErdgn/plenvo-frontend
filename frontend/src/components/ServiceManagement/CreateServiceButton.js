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
    serviceType: "",
    currencyName: "",
    status: "",
    isSmsReminderActive: false,
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
    serviceType: false,
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
          serviceType: false,
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
    const { name, value, type, checked } = e.target;
    
    // For checkbox inputs, use the checked property instead of value
    const inputValue = type === 'checkbox' ? checked : value;
    setFormData({ ...formData, [name]: inputValue });
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
      !formData.status ||
      !formData.serviceType
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
        serviceType: formData.serviceType,
        currencyName: formData.currencyName,
        status: formData.status,
        isSmsReminderActive: formData.isSmsReminderActive,
      });
      // console.log(formData);
      // 4) Temizleme
      setFormData({
        serviceName: "",
        provider: "",
        validityDate: "",
        serviceFee: "",
        serviceType: "",
        currencyName: "",
        status: "",
        isSmsReminderActive: false,
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
              className={`absolute left-0 right-0 bg-white border border-gray-300 rounded-lg max-h-[7.5rem] overflow-auto z-10 ${
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
        className="font-poppins flex flex-row bg-[#399AA1] text-white px-4 py-3 min-w-[8.75rem] rounded-[10px] hover:bg-[#007E85] shadow-md"
      >
        + Hizmet Ekle
      </button>

      {isPopUpOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center transition-opacity duration-300 ease-in-out z-50 p-4">
          <div
            className="bg-white p-4 sm:p-6 rounded-[10px] shadow-lg w-[95%] sm:w-[80%] md:w-[60%] lg:w-[40%] xl:w-[30%] px-4 sm:px-8 md:px-12 py-6 sm:py-8 transform scale-95 transition-transform duration-300 ease-out max-h-[95vh] overflow-y-auto"
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
              <label className="text-xs text-red-500 pb-6 block mb-4">
                (Kişi bazlı hizmetlerde doktorun o hizmeti her randevuda sunduğu
                varsayılacaktır. Değişken hizmetlerde 'Genel Hizmet' seçeneğini
                kullanabilirsiniz.)
              </label>
              <div className="my-4">
                {manualEntry.serviceName ? (
                  <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
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
                      className="px-4 py-2 bg-red-500 text-white text-xs rounded-[10px] hover:bg-red-600 mt-2 sm:mt-0"
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
                  Hizmet Bedeli Başlangıç Tarihi
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
                {renderDropdown("Hizmet Tipi", "serviceType", ["Ön Görüşme", "Rutin Görüşme", "Muayene"])}
              </div>
              <div className="mb-4">
                {renderDropdown(
                  "Para Birimi",
                  "currencyName",
                  uniqueCurrencies,
                  "up"
                )}
              </div>
              
              <div className="mb-6 mt-8 p-4 border border-[#e0f2f4] bg-[#f8fdfd] rounded-lg shadow-sm">
                <h4 className="text-[#007E85] font-medium mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  SMS Hatırlatıcı Ayarı
                </h4>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="isSmsReminderActive"
                      checked={formData.isSmsReminderActive}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className={formData.isSmsReminderActive ? 'w-10 h-5 bg-[#007E85] rounded-full shadow-inner transition-colors duration-300 ease-in-out' : 'w-10 h-5 bg-gray-200 rounded-full shadow-inner transition-colors duration-300 ease-in-out group-hover:bg-gray-300'}></div>
                    <div className={`absolute left-0 top-0 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ease-in-out transform ${formData.isSmsReminderActive ? 'translate-x-5' : ''}`}></div>
                  </div>
                  <div>
                    <span className="text-gray-700 font-medium">Bu hizmet için hatırlatıcı SMS gönderilsin mi?</span>
                    <p className="text-gray-500 text-xs mt-1">Bu seçenek açıksa, bu hizmet için oluşturulan randevular için müşterilere WhatsApp üzerinden hatırlatıcı mesaj gönderilecektir.</p>
                  </div>
                </label>
              </div>
              
              <div className="flex justify-end mt-6 space-x-2">
                <button
                  type="button"
                  onClick={() => setPopUpOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded-[10px] hover:bg-gray-400 w-full sm:w-auto"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#399AA1] text-white rounded-[10px] hover:bg-[#007E85] w-full sm:w-auto"
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
