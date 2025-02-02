import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DoctorLoginImage from "../assets/images/doctor-login-3.png";
import thunderImg from "../assets/images/login-thunder.png";
import { LuUser } from "react-icons/lu";
import { TbLockPassword } from "react-icons/tb";
import { FiEye, FiEyeOff } from "react-icons/fi";
import {
  loginUser,
  changePassword,
  forgotPassword, // AuthService içinde olduğunu varsayıyoruz
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
        // Artık localStorage'a token yazmıyoruz!
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

  // 3) ŞİFREMİ UNUTTUM BUTONU (Login Olmayan Kullanıcı)
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

  // Sisteme giriş yap (örneğin anasayfa veya dashboard'a)
  const handleGoToHome = () => {
    navigate("/appointments"); // veya "/dashboard"
  };

  // Şifremi Unuttum butonuna basınca formu aç
  const handleShowForgotPassword = () => {
    setShowForgotPassword(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  // Eğer forgotPassword formundan geri dönmek istersek
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
          <h1 className="font-poppins font-bold text-[40px] md:text-[46px] mb-2 text-center">
            PLENVO'YA HOŞ GELDİNİZ!
          </h1>
          <p className="font-poppins text-base md:text-lg mb-6 md:mb-10 text-gray-600 text-center">
            Kullanıcı bilgilerinizi girerek sisteme giriş yapabilirsiniz.
          </p>

          {/* Ekranı 3 duruma ayırabiliriz: 
              1) Login form (isLoginCompleted = false, showForgotPassword = false)
              2) Şifremi Unuttum form (showForgotPassword = true)
              3) Login tamamlandıysa (isLoginCompleted = true)
          */}
          {/* 1) LOGIN FORM GÖRÜNTÜLENİYOR */}
          {!isLoginCompleted && !showForgotPassword && (
            <>
              {/* Kullanıcı Adı */}
              <div className="flex items-center w-full max-w-[400px] h-[57px] rounded-2xl bg-[#F0EDFF] px-4 mb-4 shadow-sm">
                <LuUser className="text-[#1C1C1C] mr-3" size={20} />
                <input
                  type="text"
                  placeholder="Kullanıcı adı"
                  className="w-full bg-transparent outline-none text-[#1C1C1C] placeholder-[#1C1C1C]"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              {/* Şifre input + göz ikonu */}
              <div className="flex items-center w-full max-w-[400px] h-[57px] rounded-2xl bg-[#F0EDFF] px-4 mb-4 shadow-sm">
                <TbLockPassword className="text-[#1C1C1C] mr-3" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Şifre"
                  className="w-full bg-transparent outline-none text-[#1C1C1C] placeholder-[#1C1C1C]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {/* Göz ikonu */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 text-[#1C1C1C] hover:text-[#007E85]"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>

              {/* Login Butonu */}
              <button
                onClick={handleLogin}
                className="font-poppins text-white px-6 py-3 text-sm font-semibold rounded-2xl 
                           bg-gradient-to-r from-[#46B4BA] to-[#007E85] mb-2
                           hover:from-[#35a1a7] hover:to-[#006b71] transition-colors"
              >
                Giriş Yap
              </button>

              {/* Şifremi Unuttum Butonu (giriş yapmayan kullanıcıya) */}
              <button
                onClick={handleShowForgotPassword}
                className="font-poppins text-[#007E85] underline mt-3"
              >
                Şifremi Unuttum
              </button>
            </>
          )}

          {/* 2) ŞİFREMİ UNUTTUM FORMU */}
          {!isLoginCompleted && showForgotPassword && (
            <div className="w-full max-w-[400px] space-y-4">
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
              {/* Tek input alanı (Telefon veya E-mail) */}
              <div className="flex items-center w-full h-[50px] rounded-2xl bg-[#F0EDFF] px-4 shadow-sm">
                <input
                  type="text"
                  placeholder="Telefon veya E-mail"
                  className="w-full bg-transparent outline-none text-[#1C1C1C] placeholder-[#1C1C1C]"
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                />
              </div>
              {/* Gönder Butonu */}
              <button
                onClick={handleForgotPassword}
                className="font-poppins text-white px-6 py-3 text-sm font-semibold rounded-2xl 
                           bg-gradient-to-r from-[#46B4BA] to-[#007E85]
                           hover:from-[#35a1a7] hover:to-[#006b71] transition-colors w-full"
              >
                Gönder
              </button>
              {/* Geri Dön (Login Ekranına) */}
              <button
                onClick={handleBackToLogin}
                className="font-poppins text-[#007E85] underline block mx-auto mt-2"
              >
                Geri Dön
              </button>
            </div>
          )}

          {/* 3) LOGIN BAŞARILI (GİRİŞ YAPILDI) */}
          {isLoginCompleted && (
            <div className="flex flex-col items-center mb-4">
              <button
                onClick={handleGoToHome}
                className="font-poppins text-white px-6 py-3 text-sm font-semibold rounded-2xl 
                           bg-gradient-to-r from-green-400 to-green-600 mb-3
                           hover:from-green-500 hover:to-green-700 transition-colors"
              >
                Sisteme Giriş Yap
              </button>
              <button
                onClick={() => setShowChangePassword(!showChangePassword)}
                className="font-poppins text-white px-6 py-3 text-sm font-semibold rounded-2xl 
                           bg-gradient-to-r from-yellow-400 to-yellow-600
                           hover:from-yellow-500 hover:to-yellow-700 transition-colors"
              >
                Şifre Değiştir
              </button>
            </div>
          )}

          {/* Hata veya Başarı Mesajları */}
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

          {/* Şifre Değiştirme Formu (Giriş yapmış kullanıcıya özel) */}
          {showChangePassword && (
            <div className="mt-4 w-full max-w-[400px] space-y-4">
              {/* Mevcut Şifre */}
              <div className="flex items-center w-full h-[50px] rounded-2xl bg-[#F0EDFF] px-4 shadow-sm">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Eski Şifre"
                  className="w-full bg-transparent outline-none text-[#1C1C1C] placeholder-[#1C1C1C]"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                {/* Göz ikonu */}
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

              {/* Yeni Şifre */}
              <div className="flex items-center w-full h-[50px] rounded-2xl bg-[#F0EDFF] px-4 shadow-sm">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Yeni Şifre"
                  className="w-full bg-transparent outline-none text-[#1C1C1C] placeholder-[#1C1C1C]"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                {/* Göz ikonu */}
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

              {/* Submit */}
              <button
                onClick={handleChangePassword}
                className="font-poppins text-white px-4 py-2 text-sm font-semibold rounded-2xl 
                           bg-gradient-to-r from-[#46B4BA] to-[#007E85]
                           hover:from-[#35a1a7] hover:to-[#006b71] transition-colors"
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
            className="absolute top-[60%] left-[16%] z-50 w-0 md:w-20 object-cover"
          />
          <div className="h-[400px] md:h-screen bg-login-bg">
            <div className="absolute top-1/2 left-1/2 w-[80%] md:w-[60%] h-[60%] md:h-[70%] bg-white bg-opacity-20 border border-white rounded-[46px] transform -translate-x-1/2 -translate-y-1/2 shadow-md">
              <h2 className="absolute font-poppins text-white font-bold text-[36px] md:text-[40px] max-w-[200px] max-h-[165px] m-4 md:m-6">
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
