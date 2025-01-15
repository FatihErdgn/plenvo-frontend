// appointmentService.js
import axios from "axios";

// API base URL
const API_URL = "https://api.example.com/appointments"; // Backend API URL

/**
 * Get all appointments
 * @returns {Promise} Axios response promise
 */
export const getAppointments = () => {
    return axios.get(API_URL);
};

/**
 * Get an appointment by ID
 * @param {string} id - Appointment ID
 * @returns {Promise} Axios response promise
 */
export const getAppointmentById = (id) => {
    return axios.get(`${API_URL}/${id}`);
};

/**
 * Create a new appointment
 * @param {Object} appointmentData - Appointment details
 * @returns {Promise} Axios response promise
 */
export const createAppointment = (appointmentData) => {
    return axios.post(API_URL, appointmentData);
};

/**
 * Update an appointment
 * @param {string} id - Appointment ID
 * @param {Object} updatedData - Updated appointment details
 * @returns {Promise} Axios response promise
 */
export const updateAppointment = (id, updatedData) => {
    return axios.put(`${API_URL}/${id}`, updatedData);
};

/**
 * Delete an appointment
 * @param {string} id - Appointment ID
 * @returns {Promise} Axios response promise
 */
export const deleteAppointment = (id) => {
    return axios.delete(`${API_URL}/${id}`);
};
