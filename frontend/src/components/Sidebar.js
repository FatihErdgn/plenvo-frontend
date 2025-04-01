import React, { useState } from "react";
import { CgLogOut } from "react-icons/cg";
import { LuSquareMenu } from "react-icons/lu";
import { IoPersonOutline } from "react-icons/io5";
import { TbPresentationAnalytics } from "react-icons/tb";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { FaUserDoctor } from "react-icons/fa6";
import { HiMenu, HiX } from "react-icons/hi";
import { Link, useLocation } from "react-router-dom";
import { logoutUser } from "../services/authService";
import avatar from "../assets/images/avatar.png";
import { useUser } from "../contexts/UserContext";

export default function SideBar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { userProfile, loading } = useUser();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      window.location.href = "/";
    } catch (error) {
      console.error("Çıkış yaparken hata oluştu:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold text-gray-700">Yükleniyor...</p>
      </div>
    );
  }

  // Mobil menü butonu (sadece mobil görünümde)
  const mobileMenuButton = (
    <button 
      onClick={toggleMobileMenu} 
      className="fixed top-4 left-4 z-50 bg-[#007E85] p-2 rounded-md text-white md:hidden"
    >
      {isMobileMenuOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
    </button>
  );

  // Ana sidebar içeriği
  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex flex-col items-center">
        <img
          src="/plenvo-logo-3.png"
          alt="Plenvo Logo"
          className="h-full w-[70%] md:w-[70%]"
        />
      </div>

      {/* Menü */}
      <div className="md:absolute md:mt-[60%] mt-10">
        <h3 className="mb-6 text-lg text-white">Menü</h3>
        <nav>
          <Link
            to="/appointments"
            className={
              isActive("/appointments")
                ? "mb-10 flex items-center gap-2 text-[#007E85] font-semibold bg-white w-full md:w-[17.5rem] p-3 rounded cursor-pointer"
                : "mb-10 flex items-center gap-2 text-white cursor-pointer"
            }
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <LuSquareMenu className="w-5 h-5" /> Randevuları Yönet
          </Link>
          {userProfile?.roleId?.roleName !== "doctor" && (
            <Link
              to="/finance"
              className={
                isActive("/finance")
                  ? "mb-10 flex items-center gap-2 text-[#007E85] font-semibold bg-white w-full md:w-[17.5rem] p-3 rounded cursor-pointer"
                  : "mb-10 flex items-center gap-2 text-white cursor-pointer"
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <TbPresentationAnalytics className="w-5 h-5" /> Maliyet Yönetimi
            </Link>
          )}

          {/* Eğer rol consultant değilse Finansal Dashboard ve Klinik Yönetimi göster */}
          {userProfile?.roleId?.roleName !== "consultant" && (
            <>
              <Link
                to="/finance-dashboard"
                className={
                  isActive("/finance-dashboard")
                    ? "mb-10 flex items-center gap-2 text-[#007E85] font-semibold bg-white w-full md:w-[17.5rem] p-3 rounded cursor-pointer"
                    : "mb-10 flex items-center gap-2 text-white cursor-pointer"
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MdOutlineSpaceDashboard className="w-5 h-5" /> Finansal
                Dashboard
              </Link>
              {userProfile?.roleId?.roleName !== "doctor" && (
                <Link
                  to="/personnel-management"
                  className={
                    isActive("/personnel-management")
                      ? "mb-10 flex items-center gap-2 text-[#007E85] font-semibold bg-white w-full md:w-[17.5rem] p-3 rounded cursor-pointer"
                      : "mb-10 flex items-center gap-2 text-white cursor-pointer"
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <IoPersonOutline className="w-5 h-5" /> Klinik Yönetimi
                </Link>
              )}
            </>
          )}
        </nav>
      </div>

      {/* Profil ve Çıkış */}
      <div className="text-sm xs:text-base mt-auto">
        <div className="flex items-center gap-2 mb-4">
          <img src={avatar} alt="Profile" className="w-10 h-10 rounded-full" />
          <div>
            <p className="text-white">
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
    </>
  );

  return (
    <>
      {mobileMenuButton}
      
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-[20%] p-6 flex-col justify-between text-white relative z-10">
        {sidebarContent}
      </div>
      
      {/* Mobile sidebar (overlay) */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleMobileMenu}
      />
      
      <div 
        className={`fixed inset-y-0 left-0 w-4/5 max-w-xs bg-[#007E85] p-6 flex flex-col z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}
