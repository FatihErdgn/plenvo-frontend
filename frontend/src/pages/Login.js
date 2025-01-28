import { useState } from "react";
import DoctorLoginImage from "../assets/images/doctor-login-1.png";
import thunderImg from "../assets/images/login-thunder.png";
import { LuUser } from "react-icons/lu";
import { TbLockPassword } from "react-icons/tb";
import { loginUser, changePassword } from "../services/authService";

export default function Login() {
  // Form state'leri
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Şifre değiştirme formu için state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Hata ve başarı mesajları
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // 1) LOGIN BUTON TIKLAMA
  const handleLogin = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const data = await loginUser(username, password);
      if (data.success) {
        // Token'ı localStorage'a set edelim
        localStorage.setItem("token", data.token);

        setSuccessMessage("Login successful!");
        // İsteğe göre başka bir sayfaya yönlendirebilirsin: useNavigate() vb. ile
        // navigate("/dashboard");
      } else {
        setErrorMessage(data.message || "Login failed.");
      }
    } catch (error) {
      // Axios hata gelirse buraya düşer
      const msg =
        error?.response?.data?.message ||
        error.message ||
        "An error occurred during login.";
      setErrorMessage(msg);
    }
  };

  // 2) ŞİFRE DEĞİŞTİR TIKLAMA
  const handleChangePassword = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    // localStorage'dan token al
    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMessage("You must be logged in to change your password.");
      return;
    }

    try {
      const data = await changePassword(token, currentPassword, newPassword);
      if (data.success) {
        setSuccessMessage("Password changed successfully!");
        // Formu temizle
        setCurrentPassword("");
        setNewPassword("");
      } else {
        setErrorMessage(data.message || "Password change failed.");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error.message ||
        "An error occurred while changing password.";
      setErrorMessage(msg);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f4f7fe]">
      <div className="w-full h-auto flex flex-col md:flex-row overflow-hidden">
        {/* Sol taraf (Beyaz) */}
        <div className="flex flex-col items-center justify-center w-full md:w-1/2 bg-white p-6 md:p-0">
          <h1 className="font-poppins font-bold text-[48px] md:text-[40px]">
            WELCOME TO PLENVO
          </h1>
          <p className="font-poppins text-base md:text-lg mb-6 md:mb-10 text-gray-600 text-center">
            How to get started lorem ipsum dolor at?
          </p>

          {/* Kullanıcı adı input */}
          <div className="flex items-center w-full max-w-[400px] h-[57px] rounded-2xl bg-[#F0EDFF] px-4 mb-4 shadow-sm">
            <LuUser className="text-[#1C1C1C] mr-3" size={20} />
            <input
              type="text"
              placeholder="Username"
              className="w-full bg-transparent outline-none text-[#1C1C1C] placeholder-[#1C1C1C]"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Şifre input */}
          <div className="flex items-center w-full max-w-[400px] h-[57px] rounded-2xl bg-[#F0EDFF] px-4 mb-6 md:mb-10 shadow-sm">
            <TbLockPassword className="text-[#1C1C1C] mr-3" size={20} />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-transparent outline-none text-[#1C1C1C] placeholder-[#1C1C1C]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Login Butonu */}
          <button
            onClick={handleLogin}
            className="font-poppins text-white px-6 py-3 text-sm font-semibold rounded-2xl bg-gradient-to-r from-[#46B4BA] to-[#007E85] mb-4"
          >
            Login Now
          </button>

          {/* Şifre Değiştir Butonu (Formu açıp kapatır) */}
          <button
            onClick={() => setShowChangePassword(!showChangePassword)}
            className="font-poppins text-[#007E85] underline"
          >
            Change Password
          </button>

          {/* Hata ya da başarı mesajlarını göster */}
          {errorMessage && (
            <div className="text-red-500 mt-2 text-center max-w-[400px]">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="text-green-500 mt-2 text-center max-w-[400px]">
              {successMessage}
            </div>
          )}

          {/* Şifre Değiştirme Formu */}
          {showChangePassword && (
            <div className="mt-4 w-full max-w-[400px] space-y-4">
              <div className="flex items-center w-full h-[50px] rounded-2xl bg-[#F0EDFF] px-4 shadow-sm">
                <input
                  type="password"
                  placeholder="Current Password"
                  className="w-full bg-transparent outline-none text-[#1C1C1C] placeholder-[#1C1C1C]"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="flex items-center w-full h-[50px] rounded-2xl bg-[#F0EDFF] px-4 shadow-sm">
                <input
                  type="password"
                  placeholder="New Password"
                  className="w-full bg-transparent outline-none text-[#1C1C1C] placeholder-[#1C1C1C]"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <button
                onClick={handleChangePassword}
                className="font-poppins text-white px-4 py-2 text-sm font-semibold rounded-2xl bg-gradient-to-r from-[#46B4BA] to-[#007E85]"
              >
                Submit
              </button>
            </div>
          )}
        </div>

        {/* Sağ taraf (Mavi Gradient) */}
        <div className="relative w-full md:w-1/2 bg-gradient-to-r from-[#46B4BA] to-[#007E85]">
          <img
            src={thunderImg}
            alt="Login Icon"
            className="absolute top-[60%] left-[14.5%] z-50 w-0 md:w-20 object-cover"
          />
          <div className="h-[400px] md:h-screen bg-login-bg">
            <div className="absolute top-1/2 left-1/2 w-[80%] md:w-[60%] h-[60%] md:h-[70%] bg-white bg-opacity-20 border border-white rounded-[46px] transform -translate-x-1/2 -translate-y-1/2 shadow-md">
              <h2 className="absolute font-poppins text-white font-bold text-[20px] md:text-[32px] max-w-[200px] max-h-[165px] m-4 md:m-6">
                Your health, just one click away!
              </h2>
              <img
                src={DoctorLoginImage}
                alt="Doctor Login"
                className="w-full h-full object-contain overflow-visible md:object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
