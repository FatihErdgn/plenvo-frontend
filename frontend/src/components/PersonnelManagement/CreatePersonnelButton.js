import { Alert, Collapse } from "@mui/material";
import { useState, useEffect } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
// import CustomDateTimePicker from "./Datepicker.js"

export default function AddPersonnel({ personnelData }) {
  const [isPopUpOpen, setPopUpOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    phoneNumber: "",
    email: "",
    clinic: "",
    profession: "",
    speciality: "",
    salary: "",
    role: "",
    hireDate: "",
    //Manuel
    manualClinic: "",
    manualProfession: "",
    manualSpeciality: "",
  });

  const [manualEntry, setManualEntry] = useState({
    clinic: "",
    profession: "",
    speciality: "",
  });

  const [dropdownOpen, setDropdownOpen] = useState({
    clinic: false,
    profession: false,
    speciality: false,
    role: false,
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1) Final değerleri belirle
    const finalClinic = manualEntry.clinic
      ? formData.manualClinic
      : formData.clinic;

    const finalProfession = manualEntry.profession
      ? formData.manualProfession
      : formData.profession;

    const finalSpeciality = manualEntry.speciality
      ? formData.manualSpeciality
      : formData.speciality;

    // 2) Validasyon
    if (
      !finalClinic ||
      !finalProfession ||
      !finalSpeciality ||
      !formData.name ||
      !formData.mobile ||
      !formData.email ||
      !formData.clinic ||
      !formData.role ||
      !formData.hireDate
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
      profession: finalProfession,
      speciality: finalSpeciality,
      clinic: finalClinic,
    });

    setAlertState({
      message: "Başarılı bir şekilde eklendi.",
      severity: "success",
      open: true,
    });

    // 4) Temizleme
    setFormData({
      firstName: "",
      lastName: "",
      mobile: "",
      phoneNumber: "",
      email: "",
      clinic: "",
      profession: "",
      speciality: "",
      salary: "",
      role: "",
      hireDate: "",
      //Manuel
      manualClinic: "",
      manualProfession: "",
      manualSpeciality: "",
    });
    setManualEntry({
      clinic: "",
      profession: "",
      speciality: "",
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

  const uniqueClinics = [
    ...new Set(personnelData.map((person) => person.clinic)),
  ];

  const uniqueProfessions = [
    ...new Set(personnelData.map((person) => person.profession)),
  ];

  const uniqueSpecialities = [
    ...new Set(personnelData.map((person) => person.speciality)),
  ];

  const roles = ["Admin", "Consultant", "Doctor", "Manager"];

  // Ortak dropdown (status, clinic, doctor)
  const renderDropdown = (label, key, options, direction = "down") => (
    <>
      <label className="text-gray-700 mb-2 block">{label}</label>
      <div className="relative mb-4 dropdown-container">
        <div
          className="px-4 py-2 border border-gray-300 hover:border-[#399AA1] hover:border-[2px] rounded-lg cursor-pointer bg-white flex justify-between items-center"
          onClick={() => toggleDropdown(key)}
        >
          {formData[key] || `${label} Seçin`}
          <span className="ml-2 transform transition-transform duration-200 opacity-50">
            {dropdownOpen[key] ? "▲" : "▼"}
          </span>
        </div>
        {dropdownOpen[key] && (
          <ul
            className={`absolute left-0 right-0 bg-white border border-gray-300 rounded-lg max-h-[120px] overflow-auto z-10 ${
              direction === "up" ? "bottom-full mb-1" : "top-full mt-1"
            }`}
          >
            {options.map((option, idx) => (
              <li
                key={idx}
                className="px-4 py-2 hover:bg-[#007E85] hover:text-white cursor-pointer"
                onClick={() => handleSelect(key, option)}
              >
                {option}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );

  return (
    <div className="flex justify-center items-center font-poppins">
      <button
        onClick={() => setPopUpOpen(true)}
        className="font-poppins flex flex-row bg-[#399AA1] text-white px-4 py-3 min-w-[150px] rounded-[10px] hover:bg-[#007E85] shadow-md"
      >
        + Personel Ekle
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
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="firstName">
                  İsim:
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="lastName">
                  Soyisim:
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 mb-2"
                  htmlFor="phoneNumber"
                >
                  Telefon:
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="email">
                  Eposta:
                </label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="hireDate" className="text-gray-700 mb-2 block">
                  İşe Giriş Tarihi
                </label>
                <input
                  type="date"
                  name="hireDate"
                  value={formData.hireDate}
                  onChange={handleInputChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                />
              </div>
              <div className="mb-4">
                {manualEntry.clinic ? (
                  <div className="flex gap-2 items-center">
                    <label
                      htmlFor="manualClinic"
                      className="text-gray-700 mb-2 block"
                    >
                      Klinik
                    </label>
                    <input
                      type="text"
                      name="manualClinic"
                      value={formData.manualClinic}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                      required
                    />
                    <button
                      type="button"
                      className="px-4 py-2 bg-red-500 text-white text-xs rounded-[10px] hover:bg-red-600"
                      onClick={() => handleDisableManualEntry("clinic")}
                    >
                      Manuel Girişi Kapat
                    </button>
                  </div>
                ) : (
                  renderDropdown("Klinik", "clinic", uniqueClinics)
                )}
              </div>
              <div className="mb-4">
                {manualEntry.profession ? (
                  <div className="flex gap-2 items-center">
                    <label
                      htmlFor="manualProfession"
                      className="text-gray-700 mb-2 block"
                    >
                      Meslek
                    </label>
                    <input
                      type="text"
                      name="manualProfession"
                      value={formData.manualProfession}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                      required
                    />
                    <button
                      type="button"
                      className="px-4 py-2 bg-red-500 text-white text-xs rounded-[10px] hover:bg-red-600"
                      onClick={() => handleDisableManualEntry("clinic")}
                    >
                      Manuel Girişi Kapat
                    </button>
                  </div>
                ) : (
                  renderDropdown("Meslek", "profession", uniqueProfessions)
                )}
              </div>
              <div className="mb-4">
                {manualEntry.speciality ? (
                  <div className="flex gap-2 items-center">
                    <label
                      htmlFor="manualSpeciality"
                      className="text-gray-700 mb-2 block"
                    >
                      Uzmanlık Alanı
                    </label>
                    <input
                      type="text"
                      name="manualSpeciality"
                      value={formData.manualSpeciality}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                      required
                    />
                    <button
                      type="button"
                      className="px-4 py-2 bg-red-500 text-white text-xs rounded-[10px] hover:bg-red-600"
                      onClick={() => handleDisableManualEntry("clinic")}
                    >
                      Manuel Girişi Kapat
                    </button>
                  </div>
                ) : (
                  renderDropdown(
                    "Uzmanlık Alanı",
                    "speciality",
                    uniqueSpecialities
                  )
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="salary" className="text-gray-700 mb-2 block">
                  Maaş
                </label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                />
              </div>
              <div className="mb-4">
                {renderDropdown("Rol", "role", roles, "up")}
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
