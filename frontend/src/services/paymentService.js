import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Ödeme Oluşturma
 * @param {object} paymentData Frontend'den gelen ödeme verileri
 * @returns {Promise<object>} API cevabı (ödeme oluşturuldu)
 */
export const createPayment = async (paymentData) => {
  try {
    const response = await api.post("/payments", paymentData);
    return response.data;
  } catch (error) {
    console.error(
      "Create Payment Hatası:",
      error.response?.data || error.message
    );
    throw error.response?.data || error.message;
  }
};

/**
 * Ödeme Güncelleme
 * @param {string} paymentId Güncellenecek ödemenin ID'si
 * @param {object} updateData Güncellenecek veriler
 * @returns {Promise<object>} API cevabı (güncellenmiş ödeme)
 */
export const updatePayment = async (paymentId, updateData) => {
  try {
    const response = await api.put(`/payments/${paymentId}`, updateData);
    return response.data;
  } catch (error) {
    console.error(
      "Update Payment Hatası:",
      error.response?.data || error.message
    );
    throw error.response?.data || error.message;
  }
};

/**
 * Ödeme Soft Delete (isDeleted = true)
 * @param {string} paymentId Silinecek ödemenin ID'si
 * @returns {Promise<object>} API cevabı (silinmiş ödeme)
 */
export const softDeletePayment = async (paymentId) => {
  try {
    const response = await api.delete(`/payments/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Soft Delete Payment Hatası:",
      error.response?.data || error.message
    );
    throw error.response?.data || error.message;
  }
};

/**
 * Belirli bir randevuya ait ödemeleri getirme
 * @param {string} appointmentId Randevu ID'si
 * @returns {Promise<object>} API cevabı (randevuya ait ödemeler)
 */
export const getPaymentsByAppointment = async (appointmentId) => {
  try {
    const response = await api.get(`/payments/appointment/${appointmentId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return { success: false, payments: [] };
    }
    
    console.error(
      "Get Payments By Appointment Hatası:",
      error.response?.data || error.message
    );
    throw error.response?.data || error.message;
  }
};
