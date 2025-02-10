// services/userService.js
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
 * Kullanıcı Oluşturma
 * @param {object} userData Front-end'den gelen kullanıcı verileri
 * @returns {Promise<object>} { success, message }
 */
export const createUser = async (userData) => {
  try {
    const response = await api.post("/users", userData);
    return response.data;
  } catch (error) {
    console.error("Create User Error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

/**
 * Kullanıcı Güncelleme
 * @param {string} userId Güncellenecek kullanıcının ID'si
 * @param {object} updateData Güncellenecek veriler
 * @returns {Promise<object>} { success, message }
 */
export const updateUser = async (userId, updateData) => {
  try {
    const response = await api.put(`/users/${userId}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Update User Error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

/**
 * Kullanıcı Silme (Soft Delete)
 * @param {string} userId Silinecek kullanıcının ID'si
 * @returns {Promise<object>} { success, message }
 */
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Delete User Error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

/**
 * Kullanıcıları Getirme (Listeleme)
 * @returns {Promise<object>} { success, data } – aktif kullanıcılar listesi
 */
export const getUsers = async (params = {}) => {
  try {
    const response = await api.get("/users", { params });
    return response.data;
  } catch (error) {
    console.error(
      "Get Users Hatası:",
      error.response?.data || error.message
    );
    throw error.response?.data || error.message;
  }
};

/**
 * Kullanıcı Şifresini Değiştirme
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
    return response.data;
  } catch (error) {
    console.error(
      "Change Password Error:",
      error.response?.data || error.message
    );
    throw error.response?.data || error.message;
  }
};

/**
 * Şifremi Unuttum İşlemi
 * @param {string} phoneOrEmail Telefon numarası veya e-posta adresi
 * @returns {Promise<object>} { success, message }
 */
export const forgotPassword = async (phoneOrEmail) => {
  try {
    // Eğer controller hem phoneNumber hem de userMail kontrol ediyorsa
    const response = await api.post("/users/forgot-password", {
      phoneNumber: phoneOrEmail,
      userMail: phoneOrEmail,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Forgot Password Error:",
      error.response?.data || error.message
    );
    throw error.response?.data || error.message;
  }
};

/**
 * Kullanıcı Profilini Getirme
 * @returns {Promise<object>} { success, user }
 */
export const getProfile = async () => {
  try {
    const response = await api.get("/users/profile");
    return response.data;
  } catch (error) {
    console.error("Get Profile Error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};
