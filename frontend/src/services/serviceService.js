import axios from "axios";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Cookie ile gönderim
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Servis Oluşturma
 * @param {object} serviceData Frontend'den gelen servis verileri
 * @returns {Promise<object>} API cevabı (servis oluşturuldu)
 */
export const createService = async (serviceData) => {
  try {
    const response = await api.post("/services", serviceData);
    return response.data;
  } catch (error) {
    console.error(
      "Create Service Error:",
      error.response?.data || error.message
    );
    throw error.response?.data || error.message;
  }
};

/**
 * Servis Güncelleme
 * @param {string} serviceId Güncellenecek servisin ID'si
 * @param {object} updateData Güncellenecek veriler
 * @returns {Promise<object>} API cevabı (güncellenmiş servis)
 */
export const updateService = async (serviceId, updateData) => {
  try {
    const response = await api.put(`/services/${serviceId}`, updateData);
    return response.data;
  } catch (error) {
    console.error(
      "Update Service Error:",
      error.response?.data || error.message
    );
    throw error.response?.data || error.message;
  }
};

/**
 * Servis Soft Delete
 * @param {string} serviceId Silinecek servisin ID'si
 * @returns {Promise<object>} API cevabı (silinmiş servis)
 */
export const softDeleteService = async (serviceId) => {
  try {
    const response = await api.delete(`/services/${serviceId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Soft Delete Service Error:",
      error.response?.data || error.message
    );
    throw error.response?.data || error.message;
  }
};

/**
 * Servisleri Getirme (Sayfalama ve sıralama)
 * @param {object} params Query parametreleri (örn. { page: 1, limit: 10 })
 * @returns {Promise<object>} API cevabı (servis listesi, total, page, pages)
 */
export const getServices = async (params = {}) => {
  try {
    const response = await api.get("/services", { params });
    return response.data;
  } catch (error) {
    console.error(
      "Get Services Error:",
      error.response?.data || error.message
    );
    throw error.response?.data || error.message;
  }
};
