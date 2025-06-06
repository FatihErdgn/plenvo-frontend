import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

// Tüm randevuları (veya spesifik doktorun) al
export const getCalendarAppointments = async (doctorId, weekStart) => {
  try {
    let url = `/calendar-appointments`;

    // Query parametreleri varsa ekle
    const queryParams = [];
    if (doctorId) queryParams.push(`doctorId=${doctorId}`);
    if (weekStart) queryParams.push(`weekStart=${weekStart}`);

    if (queryParams.length > 0) {
      url += `?${queryParams.join("&")}`;
    }

    const res = await api.get(url);
    return res.data;
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Yeni randevu oluştur
export const createCalendarAppointment = async (data) => {
  try {
    const res = await api.post(`/calendar-appointments`, data);
    return res.data;
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Randevu güncelle
export const updateCalendarAppointment = async (id, data) => {
  try {
    const res = await api.put(`/calendar-appointments/${id}`, data);
    return res.data;
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Randevu sil
export const deleteCalendarAppointment = async (id, deleteMode = "single") => {
  try {
    // deleteMode: "single" (sadece bu tarih), "afterThis" (bu tarihten sonrakiler), "allSeries" (tüm seri)
    let url = `/calendar-appointments/${id}`;
    if (deleteMode !== "single") {
      url += `?deleteMode=${deleteMode}`;
    }
    const res = await api.delete(url);
    return res.data;
  } catch (error) {
    return { success: false, message: error.message };
  }
};
