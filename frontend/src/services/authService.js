// authService.js
import axios from "axios";

// API base URL
const API_URL = "https://api.example.com/auth"; // Backend authentication API URL

/**
 * Login a user
 * @param {Object} credentials - User login credentials (e.g., { email, password })
 * @returns {Promise} Axios response promise containing JWT token
 */
export const login = (credentials) => {
    return axios.post(`${API_URL}/login`, credentials);
};

/**
 * Verify two-factor authentication code
 * @param {Object} data - Data containing the 2FA code and user identifier
 * @returns {Promise} Axios response promise containing updated JWT token
 */
export const verifyTwoFactorCode = (data) => {
    return axios.post(`${API_URL}/verify-2fa`, data);
};

/**
 * Refresh the JWT token
 * @param {string} refreshToken - Refresh token issued during login
 * @returns {Promise} Axios response promise containing new JWT token
 */
export const refreshToken = (refreshToken) => {
    return axios.post(`${API_URL}/refresh-token`, { refreshToken });
};

/**
 * Logout the user
 * @param {string} token - JWT token
 * @returns {Promise} Axios response promise
 */
export const logout = (token) => {
    return axios.post(`${API_URL}/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

/**
 * Set authorization header for subsequent requests
 * @param {string} token - JWT token
 */
export const setAuthHeader = (token) => {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

/**
 * Remove authorization header
 */
export const clearAuthHeader = () => {
    delete axios.defaults.headers.common["Authorization"];
};
