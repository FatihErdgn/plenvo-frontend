import { CgLogOut } from "react-icons/cg";
import { LuSquareMenu } from "react-icons/lu";
// import { IoPersonOutline } from "react-icons/io5";
import { TbPresentationAnalytics } from "react-icons/tb";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function SideBar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const navigate = useNavigate();

  const handleNavigate = () => {
    return navigate("/login");
  };

  return (
    <div className="w-[20%] p-6 flex flex-col justify-between text-white relative z-10">
      {/* Logo */}
      <div className="flex flex-col items-center">
        <img
          src="/plenvo-logo.png"
          alt="Plenvo Logo"
          className="h-full w-screen"
        />
      </div>

      {/* Menü */}
      <div className="absolute mt-[60%]">
        <h3 className="mb-6 text-lg">Menu</h3>
        <nav>
          <Link
            to="/appointment"
            className={
              isActive("/appointment")
                ? "mb-10 flex items-center gap-2 text-[#007E85] font-semibold bg-white w-[280px] p-3 rounded cursor-pointer"
                : "mb-10 flex items-center gap-2 text-white cursor-pointer"
            }
          >
            <LuSquareMenu className="w-5 h-5" /> Manage Appointment
          </Link>
          <Link
            to="/finance"
            className={
              isActive("/finance")
                ? "mb-10 flex items-center gap-2 text-[#007E85] font-semibold bg-white w-[280px] p-3 rounded cursor-pointer"
                : "mb-10 flex items-center gap-2 text-white cursor-pointer"
            }
          >
            <TbPresentationAnalytics className="w-5 h-5" /> Financial Status
          </Link>
        </nav>
      </div>

      {/* Profil ve Çıkış */}
      <div className="text-sm">
        <div className="flex items-center gap-2 mb-4">
          <img
            src="https://via.placeholder.com/40"
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p>Receptionist</p>
            <p className="text-gray-200">recep@example.com</p>
          </div>
        </div>
        <button
          onClick={handleNavigate}
          className="flex flex-row items-center justify-center bg-white w-full text-[#007E85] text-[17px] font-semibold px-4 py-2 rounded-md hover:bg-gray-200"
        >
          <CgLogOut className="mx-1 pt-0.5" size={25} />
          Log out
        </button>
      </div>
    </div>
  );
}
