import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function PatientAppointmentForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    clinic: "",
    doctor: "",
    date: new Date(),
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
  });

  // Klinik verilerini backend'den çekme (örnek)
  useEffect(() => {
    // fetch('/api/clinics')
    //   .then(res => res.json())
    //   .then(data => setClinics(data));
  }, []);

  const handleClinicChange = (e) => {
    const selectedClinic = e.target.value;
    setFormData({ ...formData, clinic: selectedClinic });
    // Klinik seçimine bağlı doktor verilerini çekme
    // fetch(`/api/doctors?clinicId=${selectedClinic}`)
    //   .then(res => res.json())
    //   .then(data => setDoctors(data));
  };

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = () => {
    // Randevu oluşturma işlemi (backend'e gönderim)
    console.log("Form Data:", formData);
  };

  const stepVariants = {
    initial: { x: "100%", opacity: 0 },
    animate: { x: "0%", opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
  };

  return (
    <div
      className="flex items-center w-full p-4 bg-white rounded-lg shadow-md mb-6"
      style={{
        height: 320,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <AnimatePresence exitBeforeEnter>
        {currentStep === 0 && (
          <motion.div
            key="step1"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5 }}
            style={{
              position: "absolute",
              width: "100%",
              left: 0,
              paddingLeft: 20,
              paddingRight: 20,
            }} // Absolute konumlandırma
          >
            <div className="flex flex-col gap-4">
              <select
                onChange={handleClinicChange}
                value={formData.clinic}
                className="border rounded p-2"
              >
                <option value="">Klinik Seçiniz</option>
                {clinics.map((clinic) => (
                  <option key={clinic.id} value={clinic.id}>
                    {clinic.name}
                  </option>
                ))}
              </select>

              <select
                onChange={(e) =>
                  setFormData({ ...formData, doctor: e.target.value })
                }
                value={formData.doctor}
                className="border rounded p-2"
              >
                <option value="">Doktor Seçiniz</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </select>

              <DatePicker
                selected={formData.date}
                onChange={(date) => setFormData({ ...formData, date: date })}
                className="border rounded p-2"
              />

              <button
                onClick={nextStep}
                className="bg-blue-500 text-white rounded p-2 mt-4"
              >
                İlerle
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === 1 && (
          <motion.div
            key="step2"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5 }}
            style={{
              position: "absolute",
              width: "100%",
              left: 0,
              paddingLeft: 20,
              paddingRight: 20,
            }} // Absolute konumlandırma
          >
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="İsim"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="border rounded p-2"
              />
              <input
                type="text"
                placeholder="Soyisim"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="border rounded p-2"
              />
              <input
                type="number"
                placeholder="Yaş"
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: e.target.value })
                }
                className="border rounded p-2"
              />
              <select
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                value={formData.gender}
                className="border rounded p-2"
              >
                <option value="">Cinsiyet Seçiniz</option>
                <option value="male">Erkek</option>
                <option value="female">Kadın</option>
              </select>

              <div className="flex justify-between mt-4">
                <button
                  onClick={prevStep}
                  className="bg-gray-500 text-white rounded p-2"
                >
                  Geri
                </button>
                <button
                  onClick={nextStep}
                  className="bg-blue-500 text-white rounded p-2"
                >
                  İlerle
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step3"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5 }}
            style={{
              position: "absolute",
              width: "100%",
              left: 0,
              paddingLeft: 20,
              paddingRight: 20,
            }} // Absolute konumlandırma
          >
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Telefon"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="border rounded p-2"
              />
              <input
                type="email"
                placeholder="Email (opsiyonel)"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="border rounded p-2"
              />

              <div className="flex justify-between mt-4">
                <button
                  onClick={prevStep}
                  className="bg-gray-500 text-white rounded p-2"
                >
                  Geri
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-green-500 text-white rounded p-2"
                >
                  Randevuyu Tamamla
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
