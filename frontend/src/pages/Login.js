import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DoctorLoginImage from "../assets/images/doctor-login-3.png";
import thunderImg from "../assets/images/login-thunder.png";
import { LuUser } from "react-icons/lu";
import { TbLockPassword } from "react-icons/tb";
import { FiEye, FiEyeOff } from "react-icons/fi";
import {
  loginUser,
  changePassword,
  forgotPassword,
} from "../services/authService";

export default function Login() {
  const navigate = useNavigate();

  // Form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Şifre görünürlüğü toggle (Login için)
  const [showPassword, setShowPassword] = useState(false);

  // Şifre değiştirme formu ve ilgili state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Şifre görünürlüğü toggle (Change Password için)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Şifremi unuttum
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [phoneOrEmail, setPhoneOrEmail] = useState("");

  // Hata ve başarı mesajları
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Login işlemi başarıyla tamamlanınca login alanları kaybolsun
  const [isLoginCompleted, setIsLoginCompleted] = useState(false);

  // 1) LOGIN BUTON TIKLAMA
  const handleLogin = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!username || !password) {
      setErrorMessage("Lütfen kullanıcı bilgilerini giriniz.");
      return;
    }

    try {
      const data = await loginUser(username, password);

      if (data.success) {
        setSuccessMessage("Login successful!");
        setIsLoginCompleted(true);
      } else {
        setErrorMessage(data.message || "Login failed.");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error.message ||
        "An error occurred during login.";
      setErrorMessage(msg);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        handleLogin();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [username, password]);

  // 2) ŞİFRE DEĞİŞTİR TIKLAMA
  const handleChangePassword = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMessage("You must be logged in to change your password.");
      return;
    }

    try {
      const data = await changePassword(token, currentPassword, newPassword);
      if (data.success) {
        setSuccessMessage("Password changed successfully!");
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

  // 3) ŞİFREMİ UNUTTUM BUTONU
  const handleForgotPassword = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!phoneOrEmail) {
      setErrorMessage("Lütfen telefon veya e-mail adresinizi giriniz.");
      return;
    }

    try {
      const data = await forgotPassword(phoneOrEmail);
      if (data.success) {
        setSuccessMessage(
          "Şifre sıfırlama isteğiniz alınmıştır. SMS veya e-mailinizi kontrol edin."
        );
        setPhoneOrEmail("");
      } else {
        setErrorMessage(data.message || "Şifre sıfırlama işlemi başarısız.");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error.message ||
        "Şifre sıfırlama işlemi sırasında bir hata oluştu.";
      setErrorMessage(msg);
    }
  };

  const handleGoToHome = () => {
    navigate("/appointments");
  };

  const handleShowForgotPassword = () => {
    setShowForgotPassword(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setPhoneOrEmail("");
    setErrorMessage("");
    setSuccessMessage("");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f4f7fe]">
      <div className="w-full h-auto flex flex-col md:flex-row overflow-hidden">
        {/* Sol taraf (Beyaz) */}
        <div className="flex flex-col items-center justify-center w-full md:w-1/2 bg-white p-6 md:p-0">
          <h1 className="font-poppins font-bold text-[2.5rem] md:text-[2.875rem] mb-2 text-center">
            PLENVO'YA HOŞ GELDİNİZ!
          </h1>
          <p className="font-poppins text-base md:text-lg mb-6 md:mb-10 text-gray-600 text-center">
            Kullanıcı bilgilerinizi girerek sisteme giriş yapabilirsiniz.
          </p>

          {!isLoginCompleted && !showForgotPassword && (
            <>
              <div className="flex items-center w-full max-w-[25rem] h-[3.5625rem] rounded-2xl bg-[#F0EDFF] px-4 mb-4 shadow-sm">
                <LuUser className="text-[#1C1C1C] mr-3" size={20} />
                <input
                  type="text"
                  placeholder="Kullanıcı adı"
                  className="w-full bg-transparent outline-none text-[#1C1C1C] placeholder-[#1C1C1C]"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="flex items-center w-full max-w-[25rem] h-[3.5625rem] rounded-2xl bg-[#F0EDFF] px-4 mb-4 shadow-sm">
                <TbLockPassword className="text-[#1C1C1C] mr-3" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Şifre"
                  className="w-full bg-transparent outline-none text-[#1C1C1C] placeholder-[#1C1C1C]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 text-[#1C1C1C] hover:text-[#007E85]"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>

              <button
                onClick={handleLogin}
                className="font-poppins text-white px-6 py-3 text-sm font-semibold rounded-2xl bg-gradient-to-r from-[#46B4BA] to-[#007E85] mb-2 hover:from-[#35a1a7] hover:to-[#006b71] transition-colors"
              >
                Giriş Yap
              </button>

              <button
                onClick={handleShowForgotPassword}
                className="font-poppins text-[#007E85] underline mt-3"
              >
                Şifremi Unuttum
              </button>
            </>
          )}

          {!isLoginCompleted && showForgotPassword && (
            <div className="w-full max-w-[25rem] space-y-4">
              <div className="flex flex-col items-center">
                <p className="font-poppins text-lg font-semibold text-gray-700 text-center mb-2">
                  Şifremi Unuttum
                </p>
                <p className="text-center text-sm text-gray-500">
                  Lütfen sisteme kayıtlı telefon veya e-mail adresinizi giriniz
                </p>
                <p className="text-center text-xs text-gray-500">
                  (Telefon için +90 kısmını da girmelisiniz)
                </p>
              </div>
              <div className="flex items-center w-full h-[3.125rem] rounded-2xl bg-[#F0EDFF] px-4 shadow-sm">
                <input
                  type="text"
                  placeholder="Telefon veya E-mail"
                  className="w-full bg-transparent outline-none text-[#1C1C1C] placeholder-[#1C1C1C]"
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                />
              </div>
              <button
                onClick={handleForgotPassword}
                className="font-poppins text-white px-6 py-3 text-sm font-semibold rounded-2xl bg-gradient-to-r from-[#46B4BA] to-[#007E85] hover:from-[#35a1a7] hover:to-[#006b71] transition-colors w-full"
              >
                Gönder
              </button>
              <button
                onClick={handleBackToLogin}
                className="font-poppins text-[#007E85] underline block mx-auto mt-2"
              >
                Geri Dön
              </button>
            </div>
          )}

          {isLoginCompleted && (
            <div className="flex flex-col items-center mb-4">
              <button
                onClick={handleGoToHome}
                className="font-poppins text-white px-6 py-3 text-sm font-semibold rounded-2xl bg-gradient-to-r from-green-400 to-green-600 mb-3 hover:from-green-500 hover:to-green-700 transition-colors"
              >
                Sisteme Giriş Yap
              </button>
              <button
                onClick={() => setShowChangePassword(!showChangePassword)}
                className="font-poppins text-white px-6 py-3 text-sm font-semibold rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 transition-colors"
              >
                Şifre Değiştir
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="text-red-500 mt-2 text-center max-w-[25rem]">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="text-green-500 mt-2 text-center max-w-[25rem]">
              {successMessage}
            </div>
          )}

          {showChangePassword && (
            <div className="mt-4 w-full max-w-[25rem] space-y-4">
              <div className="flex items-center w-full h-[3.125rem] rounded-2xl bg-[#F0EDFF] px-4 shadow-sm">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Eski Şifre"
                  className="w-full bg-transparent outline-none text-[#1C1C1C] placeholder-[#1C1C1C]"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="ml-2 text-[#1C1C1C] hover:text-[#007E85]"
                >
                  {showCurrentPassword ? (
                    <FiEyeOff size={20} />
                  ) : (
                    <FiEye size={20} />
                  )}
                </button>
              </div>

              <div className="flex items-center w-full h-[3.125rem] rounded-2xl bg-[#F0EDFF] px-4 shadow-sm">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Yeni Şifre"
                  className="w-full bg-transparent outline-none text-[#1C1C1C] placeholder-[#1C1C1C]"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="ml-2 text-[#1C1C1C] hover:text-[#007E85]"
                >
                  {showNewPassword ? (
                    <FiEyeOff size={20} />
                  ) : (
                    <FiEye size={20} />
                  )}
                </button>
              </div>

              <button
                onClick={handleChangePassword}
                className="font-poppins text-white px-4 py-2 text-sm font-semibold rounded-2xl bg-gradient-to-r from-[#46B4BA] to-[#007E85] hover:from-[#35a1a7] hover:to-[#006b71] transition-colors"
              >
                Submit
              </button>
            </div>
          )}
        </div>

        <div className="relative w-full md:w-1/2 bg-gradient-to-r from-[#46B4BA] to-[#007E85]">
          <img
            src={thunderImg}
            alt="Login Icon"
            className="absolute top-[60%] left-[16%] z-50 w-0 md:w-20 object-cover"
          />
          <div className="h-[25rem] md:h-screen bg-login-bg">
            <div className="absolute top-1/2 left-1/2 w-[80%] md:w-[60%] h-[60%] md:h-[70%] bg-white bg-opacity-20 border border-white rounded-[2.875rem] transform -translate-x-1/2 -translate-y-1/2 shadow-md">
              <h2 className="absolute font-poppins text-white font-bold text-[2.25rem] md:text-[2.5rem] max-w-[12.5rem] max-h-[10.3125rem] m-4 md:m-6">
                Tek bir platformla kliniğinizi yönetin!
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
