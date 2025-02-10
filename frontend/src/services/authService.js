import axios from "axios";

// Backend API URL'si (Geliştirme ve Prod ortamına göre ayarlanabilir)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

// Axios instance oluşturduk (Tüm isteklerde `credentials: true` olacak)
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Cookie'yi istekle birlikte gönderir
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Kullanıcı Girişi (Login)
 * @param {string} username
 * @param {string} password
 * @returns {Promise<object>} { success, token } veya hata mesajı
 */
export const loginUser = async (username, password) => {
  try {
    const response = await api.post(
      "/auth/login",
      { username, password },
      { withCredentials: true }
    );
    return response.data; // { success: true, token: '...' }
  } catch (error) {
    console.error("Login hatası:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

/**
 * Kullanıcı Çıkış Yapma (Logout)
 * @returns {Promise<object>} { success, message }
 */
export const logoutUser = async () => {
  try {
    const response = await api.post(
      "/auth/logout",
      {},
      { withCredentials: true }
    );
    return response.data; // { success: true, message: "Çıkış başarılı." }
  } catch (error) {
    console.error("Logout hatası:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

/**
 * Kullanıcı Şifre Değiştirme
 * @param {string} currentPassword Mevcut şifre
 * @param {string} newPassword Yeni şifre
 * @returns {Promise<object>} { success, message }
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.post("/users/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data; // { success: true, message: "Şifre başarıyla değiştirildi." }
  } catch (error) {
    console.error(
      "Şifre değiştirme hatası:",
      error.response?.data || error.message
    );
    throw error.response?.data || error.message;
  }
};

/**
 * Şifremi Unuttum İşlemi (E-posta veya Telefon ile)
 * @param {string} phoneOrEmail Kullanıcının e-posta adresi veya telefon numarası
 * @returns {Promise<object>} { success, message }
 */
export const forgotPassword = async (phoneOrEmail) => {
  try {
    const response = await api.post("/users/forgot-password", { phoneOrEmail });
    return response.data; // { success: true, message: "SMS veya e-mail gönderildi." }
  } catch (error) {
    console.error(
      "Şifremi unuttum hatası:",
      error.response?.data || error.message
    );
    throw error.response?.data || error.message;
  }
};

/**
 * Kullanıcı Bilgilerini Getirme (Token ile)
 * @returns {Promise<object>} Kullanıcı bilgileri döndürür
 */
export const getUserProfile = async () => {
  try {
    const response = await api.get("/users/profile");
    return response.data; // { success: true, user: {...} }
  } catch (error) {
    console.error(
      "Profil getirme hatası:",
      error.response?.data || error.message
    );
    throw error.response?.data || error.message;
  }
};
