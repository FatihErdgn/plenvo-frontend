import React, { useState } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";

export default function ViewAppointmentDetailsPopup({ data, isEditable, onClose }) {
  const [formData, setFormData] = useState(data);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {isEditable ? "Edit Appointment Details" : "View Appointment Details"}
          </h2>
          <button onClick={onClose}>
            <IoIosCloseCircleOutline className="w-6 h-6 text-gray-500 hover:text-gray-700" />
          </button>
        </div>
        <form>
          <div className="mb-4">
            <label className="block text-gray-700">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              disabled={!isEditable}
              className={`w-full px-4 py-2 border rounded-lg ${isEditable ? "border-gray-300" : "border-transparent bg-gray-100"}`}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              disabled={!isEditable}
              className={`w-full px-4 py-2 border rounded-lg ${isEditable ? "border-gray-300" : "border-transparent bg-gray-100"}`}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              disabled={!isEditable}
              className={`w-full px-4 py-2 border rounded-lg ${isEditable ? "border-gray-300" : "border-transparent bg-gray-100"}`}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Appointment Date & Time</label>
            <input
              type="text"
              name="appointmentDateTime"
              value={formData.appointmentDateTime}
              onChange={handleInputChange}
              disabled={!isEditable}
              className={`w-full px-4 py-2 border rounded-lg ${isEditable ? "border-gray-300" : "border-transparent bg-gray-100"}`}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Status</label>
            <input
              type="text"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              disabled={!isEditable}
              className={`w-full px-4 py-2 border rounded-lg ${isEditable ? "border-gray-300" : "border-transparent bg-gray-100"}`}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Gender</label>
            <input
              type="text"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              disabled={!isEditable}
              className={`w-full px-4 py-2 border rounded-lg ${isEditable ? "border-gray-300" : "border-transparent bg-gray-100"}`}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              disabled={!isEditable}
              className={`w-full px-4 py-2 border rounded-lg ${isEditable ? "border-gray-300" : "border-transparent bg-gray-100"}`}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Clinic</label>
            <input
              type="text"
              name="clinic"
              value={formData.clinic}
              onChange={handleInputChange}
              disabled={!isEditable}
              className={`w-full px-4 py-2 border rounded-lg ${isEditable ? "border-gray-300" : "border-transparent bg-gray-100"}`}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Doctor</label>
            <input
              type="text"
              name="doctor"
              value={formData.doctor}
              onChange={handleInputChange}
              disabled={!isEditable}
              className={`w-full px-4 py-2 border rounded-lg ${isEditable ? "border-gray-300" : "border-transparent bg-gray-100"}`}
            />
          </div>
          {isEditable && (
            <button type="submit" className="px-4 py-2 bg-[#399AA1] text-white rounded-lg">
              Save
            </button>
          )}
        </form>
      </div>
    </div>
  );
}