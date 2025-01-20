// ViewPersonnelDetailsPopup.js
import React, { useState, useEffect,useRef } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { Alert, Collapse } from "@mui/material";

export default function ViewPersonnelDetailsPopup({
  data,
  isEditable,
  onClose,
  options: {
    profession: professionOptions,
    speciality: specialityOptions,
    clinic: clinicOptions,
    role: roleOptions,
  },
}) {
  const [formData, setFormData] = useState(data || {});
  const [dropdownOpen, setDropdownOpen] = useState({
    profession: false,
    speciality: false,
    role: false,
  });
  const [alertState, setAlertState] = useState({
    message: "",
    severity: "",
    open: false,
  });

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
          profession: false,
          speciality: false,
          role: false,
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
    setFormData((prev) => {
      const updatedData = { ...prev, [key]: value };
      setDropdownOpen((prev) => ({
        ...prev,
        [key]: false,
      }));
      return updatedData;
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Pop-up içeriğine referans
  const popupContentRef = useRef(null);

  const handleEditSubmit = (e) => {
    e.preventDefault();

    // Form doğrulama
    if (
      !formData.firstName?.trim() ||
      !formData.lastName?.trim() ||
      !formData.phoneNumber ||
      !formData.email ||
      !formData.clinic ||
      !formData.profession ||
      !formData.speciality ||
      !formData.salary ||
      !formData.role ||
      !formData.hireDate
    ) {
      setAlertState({
        message: "Lütfen tüm alanları doldurun.",
        severity: "error",
        open: true,
      });

      // Pop-up içeriğini yukarı kaydır
      if (popupContentRef.current) {
        popupContentRef.current.scrollTo({
          top: 0,
          behavior: "smooth", // Yumuşak kaydırma
        });
      }
      return;
    }

    // Backend'e gönderilecek form verisi
    console.log("Form submitted with data:", formData);

    setAlertState({
      message: "Personel bilgileri başarıyla güncellendi.",
      severity: "success",
      open: true,
    });

    // Pop-up içeriğini yukarı kaydır
    if (popupContentRef.current) {
      popupContentRef.current.scrollTo({
        top: 0,
        behavior: "smooth", // Yumuşak kaydırma
      });
    }
  };

  // Silme butonu için fonksiyon
  const handleDelete = () => {
    const confirmed = window.confirm("Silmek istediğinize emin misiniz?");
    if (confirmed) {
      // Burada silme işlemini gerçekleştirin (API çağrısı, state güncelleme vb.)
      console.log("Personel silindi, ID:", data?.id);
      // Örnek olarak pop-up'ı kapatabilirsiniz:
      onClose();
    }
  };

  useEffect(() => {
    if (alertState.open) {
      const timer = setTimeout(() => {
        setAlertState((prev) => ({ ...prev, open: false }));
      }, 5000); // 5 saniye sonra otomatik kapanır

      return () => clearTimeout(timer); // Temizleme işlemi
    }
  }, [alertState.open]);

  const renderDropdown = (label, key, options, direction = "down") => (
    <>
      <label htmlFor={key} className="text-gray-700 mb-2 block">
        {label}
      </label>
      <div className="relative mb-4 dropdown-container">
        <div
          className="px-4 py-2 border border-gray-300 hover:border-[#399AA1] hover:border-[2px] rounded-lg cursor-pointer bg-white flex justify-between items-center"
          onClick={() => toggleDropdown(key)}
        >
          {formData[key] || `Select ${label}`}
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
          </ul>
        )}
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 flex justify-center items-center">
      <div ref={popupContentRef} className="bg-white p-6 rounded-lg shadow-lg w-1/2 max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {isEditable
              ? "Personel Ayrıntılarını Düzenle"
              : "Personel Ayrıntıları"}
          </h2>
          <button onClick={onClose}>
            <IoIosCloseCircleOutline className="w-6 h-6 text-gray-500 hover:text-gray-700" />
          </button>
        </div>
        <Collapse in={alertState.open}>
          <Alert
            severity={alertState.severity}
            onClose={() => setAlertState({ ...alertState, open: false })}
          >
            {alertState.message}
          </Alert>
        </Collapse>
        <form onSubmit={handleEditSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">İsim</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName || ""}
              onChange={handleInputChange}
              disabled={!isEditable}
              className={`w-full px-4 py-2 border rounded-lg ${
                isEditable
                  ? "border-gray-300"
                  : "border-transparent bg-gray-100"
              }`}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Soyisim</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName || ""}
              onChange={handleInputChange}
              disabled={!isEditable}
              className={`w-full px-4 py-2 border rounded-lg ${
                isEditable
                  ? "border-gray-300"
                  : "border-transparent bg-gray-100"
              }`}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Telefon</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber || ""}
              onChange={handleInputChange}
              disabled={!isEditable}
              className={`w-full px-4 py-2 border rounded-lg ${
                isEditable
                  ? "border-gray-300"
                  : "border-transparent bg-gray-100"
              }`}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Eposta</label>
            <input
              type="text"
              name="email"
              value={formData.email || ""}
              onChange={handleInputChange}
              disabled={!isEditable}
              className={`w-full px-4 py-2 border rounded-lg ${
                isEditable
                  ? "border-gray-300"
                  : "border-transparent bg-gray-100"
              }`}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">İşe Giriş Tarihi</label>
            {isEditable ? (
              <input
                type="date"
                name="hireDate"
                value={formData.hireDate || ""}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg ${
                  isEditable
                    ? "border-gray-300"
                    : "border-transparent bg-gray-100"
                }`}
              />
            ) : (
              <input
                type="date"
                name="hireDate"
                value={formData.hireDate || ""}
                onChange={handleInputChange}
                disabled={!isEditable}
                className={`w-full px-4 py-2 border rounded-lg ${
                  isEditable
                    ? "border-gray-300"
                    : "border-transparent bg-gray-100"
                }`}
              />
            )}
          </div>

          <div className="mb-4">
            {isEditable ? (
              renderDropdown("Klinik", "clinic", clinicOptions, "up")
            ) : (
              <>
                <label className="block text-gray-700">Klinik</label>
                <input
                  type="text"
                  name="clinic"
                  value={formData.clinic || ""}
                  onChange={handleInputChange}
                  disabled={!isEditable}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    isEditable
                      ? "border-gray-300"
                      : "border-transparent bg-gray-100"
                  }`}
                />
              </>
            )}
          </div>
          <div className="mb-4">
            {isEditable ? (
              renderDropdown("Meslek", "profession", professionOptions, "up")
            ) : (
              <>
                <label className="block text-gray-700">Meslek</label>
                <input
                  type="text"
                  name="profession"
                  value={formData.profession || ""}
                  onChange={handleInputChange}
                  disabled={!isEditable}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    isEditable
                      ? "border-gray-300"
                      : "border-transparent bg-gray-100"
                  }`}
                />
              </>
            )}
          </div>
          <div className="mb-4">
            {isEditable ? (
              renderDropdown(
                "Uzmanlık Alanı",
                "speciality",
                specialityOptions,
                "up"
              )
            ) : (
              <>
                <label className="block text-gray-700">Uzmanlık Alanı</label>
                <input
                  type="text"
                  name="speciality"
                  value={formData.speciality || ""}
                  onChange={handleInputChange}
                  disabled={!isEditable}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    isEditable
                      ? "border-gray-300"
                      : "border-transparent bg-gray-100"
                  }`}
                />
              </>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Maaş</label>
            <input
              type="number"
              name="salary"
              className={`w-full px-4 py-2 border rounded-lg ${
                isEditable
                  ? "border-gray-300"
                  : "border-transparent bg-gray-100"
              }`}
              value={formData.salary || ""}
              onChange={handleInputChange}
              disabled={!isEditable}
            />
          </div>
          <div className="mb-4">
            {isEditable ? (
              renderDropdown("Sistemdeki Rol", "role", roleOptions, "up")
            ) : (
              <>
                <label className="block text-gray-700">Sistemdeki Rol</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role || ""}
                  onChange={handleInputChange}
                  disabled={!isEditable}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    isEditable
                      ? "border-gray-300"
                      : "border-transparent bg-gray-100"
                  }`}
                />
              </>
            )}
          </div>

          {isEditable && (
            <div className="flex justify-center gap-4">
              {alertState.open ? (
                // Kaydet Butonu (disabled)
                <button
                  type="submit"
                  className="px-12 py-2 bg-[#f0f0f0] text-white rounded-full cursor-not-allowed"
                  disabled
                >
                  Kaydet
                </button>
              ) : (
                <>
                  {/* Sil Butonu */}
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-12 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 cursor-pointer w-[150px]"
                  >
                    Sil
                  </button>
                  <button
                    type="submit"
                    className="px-12 py-2 bg-[#399AA1] text-white rounded-full hover:bg-[#007E85] cursor-pointer w-[150px]"
                    onClick={handleEditSubmit}
                  >
                    Kaydet
                  </button>
                </>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
