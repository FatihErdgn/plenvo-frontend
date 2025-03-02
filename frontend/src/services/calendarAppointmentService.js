import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

// Tüm randevuları (veya spesifik doktorun) al
export const getCalendarAppointments = async (doctorId) => {
  try {
    const res = await api.get("/calendar-appointments", { params: { doctorId } });
    return res.data;
  } catch (err) {
    console.error("getCalendarAppointments error:", err);
    return { success: false, message: err.message };
  }
};

// Yeni randevu oluştur
export const createCalendarAppointment = async (data) => {
  try {
    const res = await api.post("/calendar-appointments", data);
    return res.data;
  } catch (err) {
    console.error("createCalendarAppointment error:", err);
    return { success: false, message: err.message };
  }
};

// Randevu güncelle
export const updateCalendarAppointment = async (id, data) => {
  try {
    const res = await api.put(`/calendar-appointments/${id}`, data);
    return res.data;
  } catch (err) {
    console.error("updateCalendarAppointment error:", err);
    return { success: false, message: err.message };
  }
};

// Randevu sil
export const deleteCalendarAppointment = async (id) => {
  try {
    const res = await api.delete(`/calendar-appointments/${id}`);
    return res.data;
  } catch (err) {
    console.error("deleteCalendarAppointment error:", err);
    return { success: false, message: err.message };
  }
};
