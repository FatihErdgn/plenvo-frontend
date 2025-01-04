import React from "react";
import data from "../../personnelData.json"; // JSON dosyasını içe aktar
import { LiaEdit } from "react-icons/lia";
import { IoEyeOutline } from "react-icons/io5";

const PersonnelTable = ({ searchQuery }) => {
  console.log("Search Query:", searchQuery);

  const getStatusClass = (status) => {
    switch (status) {
      case "Manager":
        return "inline-block bg-[#41BC63] border-[1px] border-[#41BC63] text-[#ffffff] py-[6px] px-[12px] rounded-md font-semibold text-sm";
      case "Consultant":
        return "inline-block bg-[#BC9241] border-[1px] border-[#BC9241] text-[#ffffff] py-[6px] px-[12px] rounded-md font-semibold text-sm";
      case "Admin":
        return "inline-block bg-[#BC4141] border-[1px] border-[#BC4141] text-[#ffffff] py-[6px] px-[12px] rounded-md font-semibold text-sm";
      case "Doctor":
        return "inline-block bg-[#025E86] border-[1px] border-[#025E86] text-[#ffffff] py-[6px] px-[12px] rounded-md font-semibold text-sm";
      default:
        return "";
    }
  };

  const getButtonClasses = (enabled) => {
    return enabled
      ? "bg-[#399AA1] text-white px-4 py-[9px] rounded-[20px] hover:bg-[#007E85]"
      : "bg-gray-300 text-gray-500 px-4 py-[9px] rounded-[20px] cursor-not-allowed";
  };

  const filteredData = searchQuery
    ? data.filter((item) => {
        const fullName = `${item.firstName} ${item.lastName}`.toLowerCase();
        const userRole = item.role.toLowerCase();
        const query = searchQuery.toLowerCase();
        const isMatch = fullName.includes(query) || userRole.includes(query);
        // console.log("Checking:", fullName, phoneNumber, "Match:", isMatch);
        return isMatch;
      })
    : data;

  console.log("Filtered Data:", filteredData);

  return (
    <div className="font-montserrat p-6 rounded-lg shadow-md">
      <table className="table-auto w-full border-collapse bg-white shadow-sm rounded-lg">
        <thead>
          <tr className="text-gray-700 text-center">
            <th className="px-4 py-2 text-center">First Name</th>
            <th className="px-4 py-2 text-center">Last Name</th>
            <th className="px-4 py-2 w-1/4 text-center">Email Address</th>
            <th className="px-4 py-2 text-center">Joined</th>
            <th className="px-4 py-2 text-center">User Role</th>
            <th className="px-4 py-2 text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredData.map((row) => (
            <tr
              key={row.id}
              className="odd:bg-[#F7F6FE] even:bg-white hover:bg-green-50 text-center"
            >
              <td className="px-4 py-2 text-center">{row.firstName}</td>
              <td className="px-4 py-2 text-center">{row.lastName}</td>
              <td className="px-4 py-2 w-1/4 text-center">{row.email}</td>
              <td className="px-4 py-2 text-center">{row.hireDate}</td>
              <td className="px-4 py-2 text-center">
                <span className={getStatusClass(row.role)}>{row.role}</span>
              </td>
              <td className="flex flex-row justify-center text-sm items-center px-4 py-[14px] space-x-2">
                <button
                  className="flex items-center justify-center text-red-500 px-2 py-2 rounded-full hover:bg-red-600 hover:text-white"
                  disabled={!row.actions.edit}
                  aria-label="edit"
                >
                  <LiaEdit className="w-6 h-6" />
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

export default PersonnelTable;
