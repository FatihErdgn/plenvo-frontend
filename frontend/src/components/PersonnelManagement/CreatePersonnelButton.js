import { Alert, Collapse } from "@mui/material";
import { useState, useEffect } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function AddPersonnel({
  onAddUser,
  uniqueRoles,
  uniqueClinics,
  uniqueProfessions,
  uniqueSpecialities,
  existingUsers,
}) {
  const [isPopUpOpen, setPopUpOpen] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    phoneNumber: "",
    userMail: "",
    clinic: "",
    profession: "",
    speciality: "",
    salary: "",
    roleName: "",
    hireDate: "",
    // Manual entries
    manualClinic: "",
    manualProfession: "",
    manualSpeciality: "",
  });

  // Which dropdowns are open
  const [dropdownOpen, setDropdownOpen] = useState({
    clinic: false,
    profession: false,
    speciality: false,
    roleName: false,
  });

  // Whether the user selected "Diğer" (manual input) for each dropdown
  const [manualEntry, setManualEntry] = useState({
    clinic: false,
    profession: false,
    speciality: false,
  });

  // Alert State
  const [alertState, setAlertState] = useState({
    message: "",
    severity: "",
    open: false,
  });

  // Close dropdowns if clicked outside
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
          clinic: false,
          profession: false,
          speciality: false,
          roleName: false,
        });
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  // Toggle a specific dropdown
  const toggleDropdown = (key) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  /**
   * Handle selection from dropdown.
   * If "Diğer", switch to manual entry for that key.
   */
  const handleSelect = (key, value) => {
    if (value === "Diğer") {
      setManualEntry((prev) => ({
        ...prev,
        [key]: true,
      }));
      setFormData((prev) => ({
        ...prev,
        [key]: "",
        [`manual${capitalizeFirstLetter(key)}`]: "",
      }));
    } else {
      setManualEntry((prev) => ({
        ...prev,
        [key]: false,
      }));
      setFormData((prev) => ({
        ...prev,
        [key]: value,
      }));
    }

    setDropdownOpen((prev) => ({
      ...prev,
      [key]: false,
    }));
  };

  // Disable manual entry and revert to dropdown
  const handleDisableManualEntry = (key) => {
    setManualEntry((prev) => ({
      ...prev,
      [key]: false,
    }));
    setFormData((prev) => ({
      ...prev,
      [`manual${capitalizeFirstLetter(key)}`]: "",
    }));
  };

  // General input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();

    // final values for clinic/profession/speciality
    const finalClinic =
      manualEntry.clinic && formData.manualClinic
        ? formData.manualClinic
        : formData.clinic || "Belirtilmedi";
    const finalProfession =
      manualEntry.profession && formData.manualProfession
        ? formData.manualProfession
        : formData.profession || "Belirtilmedi";
    const finalSpeciality =
      manualEntry.speciality && formData.manualSpeciality
        ? formData.manualSpeciality
        : formData.speciality || "Belirtilmedi";

    // Validation
    if (!formData.userMail.includes("@")) {
      setAlertState({
        message: "Geçersiz e-posta adresi.",
        severity: "error",
        open: true,
      });
      return;
    }

    // 1) Check if username is already used
    const usernameExists = existingUsers.some(
      (person) => person.username === formData.username
    );
    if (usernameExists) {
      setAlertState({
        message:
          "Bu kullanıcı adı zaten mevcut. Lütfen farklı bir kullanıcı adı seçin.",
        severity: "error",
        open: true,
      });
      return;
    }

    // 2) Validate password (at least 8 chars,one number, one uppercase, one lowercase, one special char)
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setAlertState({
        message:
          "Şifre en az 8 karakter, bir büyük harf ve bir küçük harf içermelidir.",
        severity: "error",
        open: true,
      });
      return;
    }

    // 3) Check if required fields are filled
    if (
      !finalClinic ||
      !finalProfession ||
      !finalSpeciality ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.username ||
      !formData.password ||
      !formData.phoneNumber ||
      !formData.userMail ||
      !formData.roleName ||
      !formData.hireDate
    ) {
      setAlertState({
        message: "Lütfen tüm zorunlu alanları doldurun.",
        severity: "error",
        open: true,
      });
      return;
    }

    try {
      // Send data to parent component
      onAddUser({
        ...formData,
        clinic: finalClinic,
        profession: finalProfession,
        speciality: finalSpeciality,
      });

      // Reset form data
      setFormData({
        firstName: "",
        lastName: "",
        username: "",
        password: "",
        phoneNumber: "",
        userMail: "",
        clinic: "",
        profession: "",
        speciality: "",
        salary: "",
        roleName: "",
        hireDate: "",
        manualClinic: "",
        manualProfession: "",
        manualSpeciality: "",
      });

      // Show success alert
      setAlertState({
        message: "Personel başarıyla eklendi.",
        severity: "success",
        open: true,
      });

      // Close popup
      setTimeout(() => setPopUpOpen(false), 500);

    } catch (error) {
      console.error("Personel eklenirken hata oluştu:", error);
      setAlertState({
        message: "Personel eklenirken hata oluştu.",
        severity: "error",
        open: true,
      });
    }
  };

  // Auto-close alert after 5s
  useEffect(() => {
    if (alertState.open) {
      const timer = setTimeout(() => {
        setAlertState((prev) => ({ ...prev, open: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertState.open]);

  // Helper for label text
  const capitalizeFirstLetter = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  // Renders a custom dropdown with fallback to manual entry
  const renderDropdown = (label, key, options, direction = "down") => {
    const isManual = manualEntry[key];

    return (
      <>
        <label htmlFor={key} className="text-gray-700 mb-2 block">
          {label}
        </label>

        {isManual ? (
          // If "Diğer" was chosen, show manual input
          <div className="flex gap-2 items-center mb-4">
            <input
              type="text"
              name={`manual${capitalizeFirstLetter(key)}`}
              value={formData[`manual${capitalizeFirstLetter(key)}`]}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#007E85]"
            />
            <button
              type="button"
              className="px-4 py-2 bg-red-500 text-white text-xs rounded-[10px] hover:bg-red-600"
              onClick={() => handleDisableManualEntry(key)}
            >
              Manuel Kapat
            </button>
          </div>
        ) : (
          <div className="relative mb-4 dropdown-container">
            <div
              className={`px-4 py-2 border border-gray-300 rounded-lg bg-white flex justify-between items-center cursor-pointer hover:border-[#007E85]`}
              onClick={() => toggleDropdown(key)}
            >
              {formData[key] ? formData[key] : `${label} Seçin`}

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
                {options.map((option, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-[#007E85] hover:text-white cursor-pointer"
                    onClick={() => handleSelect(key, option)}
                  >
                    {option}
                  </li>
                ))}
                {/* "Diğer" option for adding manually */}
                {key !== "roleName" && (
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
        )}
      </>
    );
  };

  return (
    <div className="flex justify-center items-center font-poppins">
      <button
        onClick={() => setPopUpOpen(true)}
        className="font-poppins flex flex-row bg-[#399AA1] text-white px-4 py-3 min-w-[150px] rounded-[10px] hover:bg-[#007E85] shadow-md"
      >
        + Personel Ekle
      </button>

      {isPopUpOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center">
          {/* Modal Container */}
          <div
            className="bg-white relative p-6 rounded-[10px] shadow-lg w-[80%] max-w-[1000px] max-h-[90vh] overflow-auto"
            style={{
              animation: "popupSlideIn 0.3s forwards",
            }}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-red-500 hover:text-gray-600"
              onClick={() => setPopUpOpen(false)}
            >
              <IoIosCloseCircleOutline className="w-7 h-7" />
            </button>

            {/* Alert */}
            <Collapse in={alertState.open} className="mb-4">
              <Alert
                severity={alertState.severity}
                onClose={() => setAlertState({ ...alertState, open: false })}
              >
                {alertState.message}
              </Alert>
            </Collapse>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Personel Ekle
            </h2>

            <form onSubmit={handleSubmit}>
              {/* 2 Column Layout */}
              <div className="grid grid-cols-2 gap-6">
                {/* LEFT COLUMN */}
                <div>
                  {/* First Name */}
                  <label
                    className="block text-gray-700 mb-2"
                    htmlFor="firstName"
                  >
                    İsim
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full mb-4 px-3 py-2 border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                  />

                  {/* Last Name */}
                  <label
                    className="block text-gray-700 mb-2"
                    htmlFor="lastName"
                  >
                    Soyisim
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full mb-4 px-3 py-2 border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                  />

                  {/* Username */}
                  <label
                    className="block text-gray-700 mb-2"
                    htmlFor="username"
                  >
                    Kullanıcı Adı
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full mb-4 px-3 py-2 border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                  />

                  {/* password + eye toggle */}
                  <div>
                    <label
                      className="block text-gray-700 mb-2"
                      htmlFor="password"
                    >
                      Şifre:
                    </label>
                    <div className="relative">
                      <input
                        type={passwordVisible ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full mb-4 px-3 py-2 border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                        required
                      />
                      <span
                        className="absolute right-3 top-2.5 text-gray-600 cursor-pointer"
                        onClick={() => setPasswordVisible((prev) => !prev)}
                      >
                        {passwordVisible ? (
                          <AiOutlineEyeInvisible className="w-6 h-6" />
                        ) : (
                          <AiOutlineEye className="w-6 h-6" />
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <label
                    className="block text-gray-700 mb-2"
                    htmlFor="phoneNumber"
                  >
                    Telefon
                  </label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full mb-4 px-3 py-2 border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                  />

                  {/* E-Mail */}
                  <label
                    className="block text-gray-700 mb-2"
                    htmlFor="userMail"
                  >
                    E-Posta
                  </label>
                  <input
                    type="text"
                    name="userMail"
                    value={formData.userMail}
                    onChange={handleInputChange}
                    className="w-full mb-4 px-3 py-2 border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                  />
                </div>

                {/* RIGHT COLUMN */}
                <div>
                  {/* Klinik */}
                  {renderDropdown("Klinik", "clinic", uniqueClinics)}

                  {/* Meslek */}
                  {renderDropdown("Meslek", "profession", uniqueProfessions)}

                  {/* Uzmanlık Alanı */}
                  {renderDropdown(
                    "Uzmanlık Alanı",
                    "speciality",
                    uniqueSpecialities
                  )}

                  {/* Maaş */}
                  <label htmlFor="salary" className="text-gray-700 mb-2 block">
                    Maaş
                  </label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                  />

                  {/* Rol */}
                  {renderDropdown("Rol", "roleName", uniqueRoles)}

                  {/* İşe Giriş Tarihi */}
                  <label
                    htmlFor="hireDate"
                    className="text-gray-700 mb-2 block"
                  >
                    İşe Giriş Tarihi
                  </label>
                  <input
                    type="date"
                    name="hireDate"
                    value={formData.hireDate}
                    onChange={handleInputChange}
                    className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end mt-4">
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
