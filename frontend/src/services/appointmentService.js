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
 * Randevu Oluşturma
 * @param {object} appointmentData Frontend'den gelen randevu verileri
 * @returns {Promise<object>} API cevabı (randevu oluşturuldu)
 */
export const createAppointment = async (appointmentData) => {
  try {
    const response = await api.post("/appointments", appointmentData);
    return response.data;
  } catch (error) {
    console.error(
      "Create Appointment Hatası:",
      error.response?.data || error.message
    );
    throw error.response?.data || error.message;
  }
};

/**
 * Randevu Güncelleme
 * @param {string} appointmentId Güncellenecek randevunun ID'si
 * @param {object} updateData Güncellenecek veriler
 * @returns {Promise<object>} API cevabı (güncellenmiş randevu)
 */
export const updateAppointment = async (appointmentId, updateData) => {
  try {
    const response = await api.put(`/appointments/${appointmentId}`, updateData);
    return response.data;
  } catch (error) {
    console.error(
      "Update Appointment Hatası:",
      error.response?.data || error.message
    );
    throw error.response?.data || error.message;
  }
};

/**
 * Randevu Soft Delete (isDeleted = true)
 * @param {string} appointmentId Silinecek randevunun ID'si
 * @returns {Promise<object>} API cevabı (silinmiş randevu)
 */
export const softDeleteAppointment = async (appointmentId) => {
  try {
    const response = await api.delete(`/appointments/${appointmentId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Soft Delete Appointment Hatası:",
      error.response?.data || error.message
    );
    throw error.response?.data || error.message;
  }
};

/**
 * Randevuları Getirme (Sayfalama ve sıralama)
 * @param {object} params Query parametreleri (örn. { page: 1, limit: 10 })
 * @returns {Promise<object>} API cevabı (randevular listesi, total, page, pages)
 */
export const getAppointments = async (params = {}) => {
  try {
    const response = await api.get("/appointments", { params });
    return response.data;
  } catch (error) {
    console.error(
      "Get Appointments Hatası:",
      error.response?.data || error.message
    );
    throw error.response?.data || error.message;
  }
};
