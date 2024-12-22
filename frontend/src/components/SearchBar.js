import { CiSearch } from "react-icons/ci";

export default function SearchBar() {
  return (
    <div className="font-poppins flex flex-row items-center bg-[#F5F3FF] w-[412px] h-[40px] rounded-full px-4 py-2 shadow-sm">
      <input
        type="text"
        placeholder="Search"
        className="flex-grow bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
      />
      <CiSearch className="w-5 h-5 text-gray-500 mr-2" />
    </div>
  );
}
