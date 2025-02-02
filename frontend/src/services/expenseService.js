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
 * Gider Oluşturma
 * @param {object} expenseData Frontend'den gelen gider verileri
 * @returns {Promise<object>} API cevabı (gider oluşturuldu)
 */
export const createExpense = async (expenseData) => {
  try {
    const response = await api.post("/expenses", expenseData);
    return response.data;
  } catch (error) {
    console.error(
      "Create Expense Hatası:",
      error.response?.data || error.message
    );
    throw error.response?.data || error.message;
  }
};

/**
 * Gider Güncelleme
 * @param {string} expenseId Güncellenecek giderin ID'si
 * @param {object} updateData Güncellenecek veriler
 * @returns {Promise<object>} API cevabı (güncellenmiş gider)
 */
export const updateExpense = async (expenseId, updateData) => {
  try {
    const response = await api.put(`/expenses/${expenseId}`, updateData);
    return response.data;
  } catch (error) {
    console.error(
      "Update Expense Hatası:",
      error.response?.data || error.message
    );
    throw error.response?.data || error.message;
  }
};

/**
 * Gider Soft Delete (isDeleted = true)
 * @param {string} expenseId Silinecek giderin ID'si
 * @returns {Promise<object>} API cevabı (silinmiş gider)
 */
export const softDeleteExpense = async (expenseId) => {
  try {
    const response = await api.delete(`/expenses/${expenseId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Soft Delete Expense Hatası:",
      error.response?.data || error.message
    );
    throw error.response?.data || error.message;
  }
};

/**
 * Giderleri Getirme (Sayfalama ve sıralama)
 * @param {object} params Query parametreleri (örn. { page: 1, limit: 10 })
 * @returns {Promise<object>} API cevabı (gider listesi, total, page, pages)
 */
export const getExpenses = async (params = {}) => {
  try {
    const response = await api.get("/expenses", { params });
    return response.data;
  } catch (error) {
    console.error(
      "Get Expenses Hatası:",
      error.response?.data || error.message
    );
    throw error.response?.data || error.message;
  }
};
