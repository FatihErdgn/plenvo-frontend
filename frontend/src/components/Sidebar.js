import React from "react";
import { CgLogOut } from "react-icons/cg";
import { LuSquareMenu } from "react-icons/lu";
import { IoPersonOutline } from "react-icons/io5";
import { TbPresentationAnalytics } from "react-icons/tb";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import { logoutUser } from "../services/authService";
import avatar from "../assets/images/avatar.png";
import { useUser } from "../contexts/UserContext"; // Context'ten userProfile'ı almak için

export default function SideBar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  
  // **Context'ten userProfile'ı al**
  const { userProfile, loading } = useUser();

  const handleLogout = async () => {
    try {
      await logoutUser();
      console.log("Başarıyla çıkış yapıldı.");
      window.location.href = "/";
    } catch (error) {
      console.error("Çıkış yaparken hata oluştu:", error);
    }
  };

  // **Veriler yüklenene kadar bekle**
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold text-gray-700">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="w-[20%] p-6 flex flex-col justify-between text-white relative z-10">
      {/* Logo */}
      <div className="flex flex-col items-center">
        <img
          src="/plenvo-logo-3.png"
          alt="Plenvo Logo"
          className="h-full w-[70%]"
        />
      </div>

      {/* Menü */}
      <div className="absolute mt-[60%]">
        <h3 className="mb-6 text-lg">Menü</h3>
        <nav>
          <Link
            to="/appointments"
            className={
              isActive("/appointments")
                ? "mb-10 flex items-center gap-2 text-[#007E85] font-semibold bg-white w-[17.5rem] p-3 rounded cursor-pointer"
                : "mb-10 flex items-center gap-2 text-white cursor-pointer"
            }
          >
            <LuSquareMenu className="w-5 h-5" /> Randevuları Yönet
          </Link>
          <Link
            to="/finance"
            className={
              isActive("/finance")
                ? "mb-10 flex items-center gap-2 text-[#007E85] font-semibold bg-white w-[17.5rem] p-3 rounded cursor-pointer"
                : "mb-10 flex items-center gap-2 text-white cursor-pointer"
            }
          >
            <TbPresentationAnalytics className="w-5 h-5" /> Maliyet Yönetimi
          </Link>
          {/* Eğer rol consultant değilse Finansal Dashboard ve Klinik Yönetimi göster */}
          {userProfile?.roleId?.roleName !== "consultant" && (
            <>
              <Link
                to="/finance-dashboard"
                className={
                  isActive("/finance-dashboard")
                    ? "mb-10 flex items-center gap-2 text-[#007E85] font-semibold bg-white w-[17.5rem] p-3 rounded cursor-pointer"
                    : "mb-10 flex items-center gap-2 text-white cursor-pointer"
                }
              >
                <MdOutlineSpaceDashboard className="w-5 h-5" /> Finansal Dashboard
              </Link>
              <Link
                to="/personnel-management"
                className={
                  isActive("/personnel-management")
                    ? "mb-10 flex items-center gap-2 text-[#007E85] font-semibold bg-white w-[17.5rem] p-3 rounded cursor-pointer"
                    : "mb-10 flex items-center gap-2 text-white cursor-pointer"
                }
              >
                <IoPersonOutline className="w-5 h-5" /> Klinik Yönetimi
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Profil ve Çıkış */}
      <div className="text-sm xs:text-base">
        <div className="flex items-center gap-2 mb-4">
          <img src={avatar} alt="Profile" className="w-10 h-10 rounded-full" />
          <div>
            <p>
              {userProfile?.firstName} {userProfile?.lastName}
            </p>
            <p className="text-gray-200">{userProfile?.userMail}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex flex-row items-center justify-center bg-white w-full text-[#007E85] text-[1.0625rem] font-semibold px-4 py-2 rounded-md hover:bg-gray-200"
        >
          <CgLogOut className="mx-1 pt-0.5" size={25} />
          Çıkış Yap
        </button>
      </div>
    </div>
  );
}
