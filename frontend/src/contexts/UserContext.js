import React, { createContext, useContext, useState, useEffect } from "react";
import { getUserProfile } from "../services/authService";
import { useLocation } from "react-router-dom";

const UserContext = createContext();

export function UserProvider({ children }) {
  const location = useLocation();
  const isLoginPage = location.pathname === "/"; // Login sayfasında kullanıcı verileri yüklenmesin

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(!isLoginPage); // Login sayfasında yükleme yapma

  useEffect(() => {
    if (isLoginPage) return; // Eğer login sayfasındaysa API çağrısı yapma.

    async function fetchProfile() {
      try {
        const data = await getUserProfile();
        if (data.success) {
          setUserProfile(data.user);
        }
      } catch (err) {
        console.error("Profil yükleme hatası:", err.message);
      } finally {
        setLoading(false); // API çağrısı tamamlandıktan sonra yüklemeyi kapat
      }
    }
    fetchProfile();
  }, [isLoginPage]);

  // **Kullanıcı verileri yüklenmeden hiçbir bileşeni render etme**
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <p className="text-lg font-semibold text-gray-700">Uygulama Yükleniyor...</p>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ userProfile, setUserProfile, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
