import React from "react";
import data from "../../expensesData.json"; // JSON dosyasını içe aktar
// import { LiaEdit } from "react-icons/lia";
// import { IoEyeOutline } from "react-icons/io5";

const ExpensesTable = ({ searchQuery }) => {
  console.log("Search Query:", searchQuery);

  const getStatusClass = (status) => {
    switch (status) {
      case "Gelir":
        return "flex flex-row items-center justify-center bg-[#EBF9F1] border-[1px] border-[#41BC63] text-[#41BC63] py-[6px] max-w-32 min-w-16 rounded-full text-center";
      case "Sabit":
        return "flex flex-row items-center justify-center bg-[#FBF9F4] border-[1px] border-[#BC9241] text-[#BC9241] py-[6px] w-32 min-w-16 rounded-full text-center";
      case "Genel":
        return "flex flex-row items-center justify-center bg-[#FBF4F4] border-[1px] border-[#BC4141] text-[#BC4141] py-[6px] w-32 min-w-16 rounded-full text-center";
      default:
        return "";
    }
  };

  //   const getButtonClasses = (enabled) => {
  //     return enabled
  //       ? "bg-[#399AA1] text-white px-4 py-[9px] rounded-[20px] hover:bg-[#007E85]"
  //       : "bg-gray-300 text-gray-500 px-4 py-[9px] rounded-[20px] cursor-not-allowed";
  //   };

  const filteredData = searchQuery
    ? data.filter((item) => {
        const expenseCategory = item.ExpenseCategory.toLowerCase();
        const expenseType = item.ExpenseType.toLowerCase();
        const expenseKind = item.ExpenseKind.toLowerCase();
        const currency = item.Currency.toLowerCase();
        const query = searchQuery.toLowerCase();
        const isMatch =
          expenseCategory.includes(query) ||
          expenseType.includes(query) ||
          expenseKind.includes(query) ||
          currency.includes(query);
        // console.log("Checking:", fullName, phoneNumber, "Match:", isMatch);
        return isMatch;
      })
    : data;

  console.log("Filtered Data:", filteredData);

  return (
    <div className="font-montserrat w-screen p-6 rounded-lg shadow-md">
      <table className="table-auto w-full border-collapse bg-white shadow-sm rounded-lg">
        <thead>
          <tr className="text-gray-700 text-center">
            <th className="px-4 py-2">Expense Category</th>
            <th className="px-4 py-2">Expense Type</th>
            <th className="px-4 py-2">Expense Kind</th>
            <th className="px-4 py-2">Amount</th>
            <th className="px-4 py-2">Currency</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row) => (
            <tr
              key={row.id}
              className="odd:bg-[#F7F6FE] even:bg-white hover:bg-green-50 text-center"
            >
              <td className="px-4 py-2">{row.ExpenseCategory}</td>
              <td className="px-4 py-2">{row.ExpenseType}</td>
              <td className="px-4 py-2 flex justify-center">
                <span className={getStatusClass(row.ExpenseKind)}>
                  {row.ExpenseKind}
                </span>
              </td>
              <td className="px-4 py-2">{row.Amount}</td>
              <td className="px-4 py-2">{row.Currency}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpensesTable;
