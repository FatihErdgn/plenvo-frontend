import axios from "axios";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
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

// /**
//  * Ödemeleri Getirme (Sayfalama ve sıralama)
//  * @param {object} params Query parametreleri (örn. { page: 1, limit: 10 })
//  * @returns {Promise<object>} API cevabı (ödeme listesi, total, page, pages)
//  */
// export const getPayments = async (params = {}) => {
//   try {
//     const response = await api.get("/payments", { params });
//     return response.data;
//   } catch (error) {
//     console.error(
//       "Get Payments Hatası:",
//       error.response?.data || error.message
//     );
//     throw error.response?.data || error.message;
//   }
// };
