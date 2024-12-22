import React from "react";
import data from "../appointmentData.json"; // JSON dosyasını içe aktar
import { RiDeleteBin5Line } from "react-icons/ri";
import { IoEyeOutline } from "react-icons/io5";

const ConsultantTable = () => {
  const getStatusClass = (status) => {
    switch (status) {
      case "Open":
        return "flex flex-row items-center justify-center bg-[#EBF9F1] border-[1px] border-[#41BC63] text-[#41BC63] py-[6px] max-w-32 min-w-16 rounded-full text-center";
      case "Booked":
        return "flex flex-row items-center justify-center bg-[#FBF9F4] border-[1px] border-[#BC9241] text-[#BC9241] py-[6px] max-w-32 min-w-16 rounded-full text-center";
      case "Completed":
        return "flex flex-row items-center justify-center bg-[#FBF4F4] border-[1px] border-[#BC4141] text-[#BC4141] py-[6px] max-w-32 min-w-16 rounded-full text-center";
      default:
        return "";
    }
  };

  const getButtonClasses = (enabled) => {
    return enabled
      ? "bg-[#399AA1] text-white px-4 py-[9px] rounded-[20px] hover:bg-[#007E85]"
      : "bg-gray-300 text-gray-500 px-4 py-[9px] rounded-[20px] cursor-not-allowed";
  };

  return (
    <div className="font-montserrat p-6 rounded-lg shadow-md">
      <table className="table-auto w-full border-collapse bg-white shadow-sm rounded-lg">
        <thead>
          <tr className="text-gray-700 text-center">
            <th className="px-4 py-2">First Name</th>
            <th className="px-4 py-2">Last Name</th>
            <th className="px-4 py-2">Phone Number</th>
            <th className="px-4 py-2">Appointment Date & Time</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.id}
              className="odd:bg-[#F7F6FE] even:bg-white hover:bg-green-50 text-center"
            >
              <td className="px-4 py-2">{row.firstName}</td>
              <td className="px-4 py-2">{row.lastName}</td>
              <td className="px-4 py-2">{row.phoneNumber}</td>
              <td className="px-4 py-2">{row.appointmentDateTime}</td>
              <td className="px-4 py-2">
                <span className={getStatusClass(row.status)}>{row.status}</span>
              </td>
              <td className="flex flex-row justify-center text-sm items-center px-4 py-[14px] space-x-2">
                <button
                  className={getButtonClasses(row.actions.payNow)}
                  disabled={!row.actions.payNow}
                >
                  Pay Now
                </button>
                <button
                  className={getButtonClasses(row.actions.bookNow)}
                  disabled={!row.actions.bookNow}
                >
                  Book Now
                </button>
                <button
                  className={getButtonClasses(row.actions.reBook)}
                  disabled={!row.actions.reBook}
                >
                  Re-Book
                </button>
                <button
                  className="flex items-center justify-center text-red-500 px-2 py-2 rounded-full hover:bg-red-600 hover:text-white"
                  disabled={!row.actions.delete}
                  aria-label="Delete"
                >
                  <RiDeleteBin5Line className="w-6 h-6" />
                </button>
                <button
                  className="flex items-center justify-center text-gray-500 px-2 py-2 rounded-full hover:bg-gray-600 hover:text-white"
                  disabled={!row.actions.view}
                  aria-label="View"
                >
                  <IoEyeOutline className="w-6 h-6" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ConsultantTable;
