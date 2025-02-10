// services/dashboardService.js
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getDashboardData = async (params = {}) => {
  try {
    const response = await api.get("/dashboard", { params });
    // Axios'ta response.data -> sunucunun döndürdüğü JSON
    // Burada bunu doğrudan döndürüyoruz.
    return response.data; // Örnek: { status: "success", updatedAt: "...", data: { weekly: { ... } } }
  } catch (error) {
    console.error("Get Dashboard Data Hatası:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};
