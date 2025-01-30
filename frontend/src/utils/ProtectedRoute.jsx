import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

// /api/users/profile endpoint'ini 
// httpOnly cookie ile çağırıyoruz -> 200 OK => oturum var, 401 => yok

// Backend API URL'si (Geliştirme ve Prod ortamına göre ayarlanabilir)
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000/api";

// Axios instance oluşturduk (Tüm isteklerde `credentials: true` olacak)
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Cookie'yi istekle birlikte gönderir
  headers: {
    "Content-Type": "application/json",
  },
});

export default function ProtectedRoute({ children }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // "withCredentials: true" -> cookie gönderir
    api
      .get("/users/profile", { withCredentials: true })
      .then((res) => {
        if (res.data.success) {
          setIsAuthenticated(true);
        }
      })
      .catch((err) => {
        // 401 vb. gelirse, isAuthenticated = false
        setIsAuthenticated(false);
      })
      .finally(() => {
        setAuthChecked(true);
      });
  }, []);

  // authChecked = sunucudan cevap gelince true olur
  if (!authChecked) {
    // Henüz cevap gelmedi, loading ekranı
    return <div>Loading...</div>;
  }

  // Cevap geldi, ama auth yoksa login'e
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Auth varsa child route'u aç
  return children;
}
