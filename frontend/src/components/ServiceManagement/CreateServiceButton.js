import { useState, useEffect } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
// import CustomDateTimePicker from "./Datepicker.js"

export default function AddService() {
  const [isPopUpOpen, setPopUpOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    // day: "",
    // month: "",
    // year: "",
    // gender: "",
    mobile: "",
    email: "",
    clinic: "",
    role: "",
    hireDate: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Randevu alındı.", formData);
    alert("Randevu başarıyla alındı!");
    setPopUpOpen(false);
  };

  // ESC tuşu dinleyicisi
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setPopUpOpen(false);
      }
    };

    if (isPopUpOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    // Cleanup function
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPopUpOpen]);

  return (
    <div className="flex justify-center items-center font-poppins">
      <button
        onClick={() => setPopUpOpen(true)}
        className="font-poppins flex flex-row bg-[#399AA1] text-white px-4 py-3 rounded-[10px] hover:bg-[#007E85] shadow-md min-w-[140px]"
      >
        + Hizmet Ekle
      </button>

      {isPopUpOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center transition-opacity duration-300 ease-in-out">
          <div
            className="bg-white p-6 rounded-[10px] shadow-lg w-[30%] px-12 py-8 transform scale-95 transition-transform duration-300 ease-out"
            style={{
              animation: "popupSlideIn 0.3s forwards",
            }}
          >
            <button
              className="absolute top-4 right-4 text-red-500 hover:text-gray-600"
              onClick={() => setPopUpOpen(false)}
            >
              <IoIosCloseCircleOutline className="w-7 h-7"/>
            </button>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="name">
                  Ad:
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                  required
                />
              </div>
              {/* Updated input fields for Day, Month, and Year */}
              {/* <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Doğum Tarihi:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="day"
                    value={formData.day}
                    onChange={handleInputChange}
                    placeholder="Gün"
                    className="w-full px-3 py-2 border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                    required
                  />
                  <input
                    type="text"
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    placeholder="Ay"
                    className="w-full px-3 py-2 border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                    required
                  />
                  <input
                    type="text"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    placeholder="Yıl"
                    className="w-full px-3 py-2 border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                    required
                  />
                </div>
              </div> */}

              {/* New input fields for Gender, Mobile, Clinic, and Doctor */}
              {/* <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="gender">
                  Cinsiyet:
                </label>
                <input
                  type="text"
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                  required
                />
              </div> */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="mobile">
                  Telefon:
                </label>
                <input
                  type="text"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="email">
                  Email:
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
                <label className="block text-gray-700 mb-2" htmlFor="clinic">
                  Klinik:
                </label>
                <select
                  type="text"
                  id="clinic"
                  name="clinic"
                  value={formData.clinic}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="specialty">
                  Uzmanlık Alanı:
                </label>
                <select
                  type="text"
                  id="specialty"
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="role">
                  Sistemdeki Rolü:
                </label>
                <select
                  type="text"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                  required
                />
              </div>

              {/* Updated Datetime field */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="hireDate">
                  İşe Giriş Tarihi:
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.hireDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                  required
                />
                {/* <CustomDateTimePicker/> */}
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
