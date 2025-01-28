import axios from "axios";

/**
 * Giriş (Login) işlemi
 * @param {string} username
 * @param {string} password
 * @returns {Promise<object>} { success, token } vb. döner
 */
export const loginUser = async (username, password) => {
  try {
    const response = await axios.post("http://localhost:5000/api/auth/login", {
      username,
      password,
    });
    return response.data; // { success: true, token: '...' }
  } catch (error) {
    throw error;
  }
};

/**
 * Şifre değiştirme işlemi
 * @param {string} token – Login sonrası aldığımız JWT
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {Promise<object>}
 */
export const changePassword = async (token, currentPassword, newPassword) => {
  try {
    // Dikkat: API endpoint'i POST mu PUT mu? Kontrol et.
    // Örnek: POST http://localhost:5000/api/users/change-password
    const response = await axios.post(
      "http://localhost:5000/api/users/change-password",
      {
        currentPassword,
        newPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data; // { success: true, message: 'Şifre başarıyla değiştirildi.' }
  } catch (error) {
    throw error;
  }
};
