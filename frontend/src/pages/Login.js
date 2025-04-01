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
  logoutUser,
} from "../services/authService";
import logo from "../assets/images/plenvo-logo-3.png";
import doctorLoginImage from "../assets/images/doctor-login-2.png";

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
        setSuccessMessage("Giriş Başarılı!");
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

    try {
      // Token kontrolü kaldırıldı; token cookies aracılığıyla gönderilecek.
      const data = await changePassword(currentPassword, newPassword);
      if (data.success) {
        setSuccessMessage("Şifre başarıyla değiştirildi!");
        setCurrentPassword("");
        setNewPassword("");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await logoutUser();
        // console.log("Başarıyla çıkış yapıldı.");
        window.location.href = "/";
      } else {
        setErrorMessage(data.message || "Şifre değiştirme işlemi başarısız.");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error.message ||
        "Şifre değiştirme sırasında bir hata oluştu.";
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
    <>
      {/* MOBILE DESIGN - Yalnızca mobil cihazlarda görünür */}
      <div className="md:hidden min-h-screen bg-[#F5F7FF] flex flex-col justify-between">
        {/* Üst Yarı - Login Formları (ortada) */}
        <div className="px-6 flex-1 flex flex-col justify-center">
          <div className="text-center mb-6">
            <h1 className="font-poppins font-bold text-2xl text-[#1C1C1C] mb-2">
              PLENVO'YA HOŞ GELDİNİZ!
            </h1>
            <p className="text-sm text-gray-600">
              Kullanıcı bilgilerinizi girerek sisteme giriş yapabilirsiniz.
            </p>
          </div>

          {/* Giriş Formu */}
          {!isLoginCompleted && !showForgotPassword && (
            <div className="flex flex-col mt-4">
              <div className="relative mb-4">
                <div className="flex items-center bg-[#F0EDFF] rounded-2xl h-14 px-4">
                  <LuUser className="text-[#1C1C1C] mr-3" size={20} />
                  <input
                    type="text"
                    placeholder="Kullanıcı adı"
                    className="w-full bg-transparent outline-none text-[#1C1C1C] placeholder-[#1C1C1C]"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="relative mb-5">
                <div className="flex items-center bg-[#F0EDFF] rounded-2xl h-14 px-4">
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
                    className="text-[#1C1C1C]"
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleLogin}
                className="bg-[#399AA1] text-white rounded-2xl h-14 font-semibold"
              >
                Giriş Yap
              </button>

              <button
                onClick={handleShowForgotPassword}
                className="text-[#007E85] text-center underline mt-4"
              >
                Şifremi Unuttum
              </button>

              {errorMessage && (
                <div className="text-red-500 mt-4 text-center">
                  {errorMessage}
                </div>
              )}
            </div>
          )}

          {/* Şifremi Unuttum */}
          {!isLoginCompleted && showForgotPassword && (
            <div className="flex flex-col">
              <div className="text-center mb-4">
                <p className="font-semibold text-lg text-gray-700 mb-2">
                  Şifremi Unuttum
                </p>
                <p className="text-sm text-gray-500 mb-1">
                  Lütfen sisteme kayıtlı telefon veya e-mail adresinizi giriniz
                </p>
                <p className="text-xs text-gray-500">
                  (Telefon için +90 kısmını da girmelisiniz)
                </p>
              </div>

              <div className="flex items-center bg-[#F0EDFF] rounded-2xl h-14 px-4 mb-5">
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
                className="bg-[#399AA1] text-white rounded-2xl h-14 font-semibold mb-3"
              >
                Gönder
              </button>

              <button
                onClick={handleBackToLogin}
                className="text-[#007E85] text-center underline"
              >
                Geri Dön
              </button>

              {errorMessage && (
                <div className="text-red-500 mt-4 text-center">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="text-green-600 mt-4 text-center font-semibold">
                  {successMessage}
                </div>
              )}
            </div>
          )}

          {/* Giriş Sonrası Seçenekler */}
          {isLoginCompleted && (
            <div className="flex flex-col">
              {successMessage && (
                <div className="text-green-600 mb-4 text-center font-semibold">
                  {successMessage}
                </div>
              )}
              <button
                onClick={handleGoToHome}
                className="bg-green-500 text-white rounded-2xl h-14 font-semibold mb-3"
              >
                Yönetim Paneline Git
              </button>
              <button
                onClick={() => setShowChangePassword(!showChangePassword)}
                className="bg-yellow-500 text-white rounded-2xl h-14 font-semibold"
              >
                Şifre Değiştir
              </button>

              {showChangePassword && (
                <div className="mt-5">
                  <div className="flex items-center bg-[#F0EDFF] rounded-2xl h-14 px-4 mb-3 relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Eski Şifre"
                      className="w-full bg-transparent outline-none text-[#1C1C1C] placeholder-[#1C1C1C]"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 text-[#1C1C1C]"
                    >
                      {showCurrentPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                    </button>
                  </div>

                  <div className="flex items-center bg-[#F0EDFF] rounded-2xl h-14 px-4 mb-3 relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Yeni Şifre"
                      className="w-full bg-transparent outline-none text-[#1C1C1C] placeholder-[#1C1C1C]"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 text-[#1C1C1C]"
                    >
                      {showNewPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                    </button>
                  </div>

                  <button
                    onClick={handleChangePassword}
                    className="bg-[#399AA1] text-white rounded-2xl h-12 font-semibold"
                  >
                    Şifreyi Değiştir
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Alt Yarı - Gradyan Yapı */}
        <div className="relative mt-6">
          <div className="relative h-[300px] bg-gradient-to-r from-[#46B4BA] to-[#007E85] rounded-t-3xl overflow-hidden">
            {/* Logo */}
            <img 
              src={logo} 
              alt="Plenvo Logo" 
              className="absolute top-8 right-8 h-[5rem] z-10"
            />
            
            {/* Görsel ve Slogan (Tam alan kaplama) */}
            <div className="absolute inset-0 flex items-center">
              <div className="absolute inset-0 bg-gradient-to-r from-[#007E85] to-transparent z-10"></div>
              
              <div className="relative z-20 px-6">
                <h3 className="font-bold text-xl leading-tight mb-2 text-white">
                  Tek platformla kliniğinizi yönetin!
                </h3>
                <p className="text-sm text-white/90">
                  Randevu, hasta ve finans yönetimi tek yerde
                </p>
              </div>
              
              <img 
                src={doctorLoginImage} 
                alt="Healthcare Professional" 
                className="absolute inset-0 w-full h-full object-cover object-center z-0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP DESIGN - Yalnızca masaüstü görünümünde */}
      <div className="hidden md:flex items-center justify-center min-h-screen bg-[#f4f7fe]">
        <div className="w-full h-auto flex flex-row overflow-hidden">
          {/* Sol taraf (Beyaz) */}
          <div className="flex flex-col items-center justify-center w-1/2 bg-white">
            <h1 className="font-poppins font-bold text-[2.875rem] mb-2 text-center px-4">
              PLENVO'YA HOŞ GELDİNİZ!
            </h1>
            <p className="font-poppins text-lg mb-10 text-gray-600 text-center px-4">
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
              <div className="w-full max-w-[25rem] space-y-4 px-4">
                <div className="text-center mb-4">
                  <p className="font-semibold text-lg text-gray-700 mb-2">
                    Şifremi Unuttum
                  </p>
                  <p className="text-sm text-gray-500 mb-1">
                    Lütfen sisteme kayıtlı telefon veya e-mail adresinizi giriniz
                  </p>
                  <p className="text-xs text-gray-500">
                    (Telefon için +90 kısmını da girmelisiniz)
                  </p>
                </div>

                <div className="flex items-center bg-[#F0EDFF] rounded-2xl h-14 px-4 mb-5">
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
                  className="bg-[#399AA1] text-white rounded-2xl h-14 font-semibold mb-3"
                >
                  Gönder
                </button>

                <button
                  onClick={handleBackToLogin}
                  className="text-[#007E85] text-center underline"
                >
                  Geri Dön
                </button>

                {errorMessage && (
                  <div className="text-red-500 mt-4 text-center">
                    {errorMessage}
                  </div>
                )}
                {successMessage && (
                  <div className="text-green-600 mt-4 text-center font-semibold">
                    {successMessage}
                  </div>
                )}
              </div>
            )}

            {isLoginCompleted && (
              <div className="flex flex-col items-center mb-4 w-auto px-4">
                {successMessage && (
                  <div className="text-green-600 mb-4 text-center font-semibold">
                    {successMessage}
                  </div>
                )}
                <button
                  onClick={handleGoToHome}
                  className="font-poppins text-white px-8 py-3 text-sm font-semibold rounded-2xl bg-gradient-to-r from-green-500 to-green-600 mb-3 hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 w-full max-w-[25rem]"
                >
                  Yönetim Paneline Git
                </button>
                <button
                  onClick={() => setShowChangePassword(!showChangePassword)}
                  className="font-poppins text-white px-8 py-3 text-sm font-semibold rounded-2xl bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 w-full max-w-[25rem]"
                >
                  Şifre Değiştir
                </button>

                {showChangePassword && (
                  <div className="mt-5 w-full max-w-[25rem]">
                    <div className="flex items-center bg-[#F0EDFF] rounded-2xl h-14 px-4 mb-3 shadow-sm">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Eski Şifre"
                        className="w-full bg-transparent outline-none text-[#1C1C1C] placeholder-[#1C1C1C]"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="text-[#1C1C1C] hover:text-[#007E85] transition-colors"
                      >
                        {showCurrentPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                      </button>
                    </div>

                    <div className="flex items-center bg-[#F0EDFF] rounded-2xl h-14 px-4 mb-3 shadow-sm">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Yeni Şifre"
                        className="w-full bg-transparent outline-none text-[#1C1C1C] placeholder-[#1C1C1C]"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="text-[#1C1C1C] hover:text-[#007E85] transition-colors"
                      >
                        {showNewPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                      </button>
                    </div>

                    <button
                      onClick={handleChangePassword}
                      className="bg-gradient-to-r from-[#46B4BA] to-[#007E85] text-white rounded-2xl h-12 font-semibold w-full hover:from-[#35a1a7] hover:to-[#006b71] transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Şifreyi Değiştir
                    </button>
                  </div>
                )}
              </div>
            )}

            {errorMessage && !showForgotPassword && !isLoginCompleted && (
              <div className="text-red-500 mt-2 text-center max-w-[25rem] px-4">
                {errorMessage}
              </div>
            )}
          </div>

          {/* Sağ taraf (Gradyan) */}
          <div className="relative w-1/2 bg-gradient-to-r from-[#46B4BA] to-[#007E85]">
            <img
              src={thunderImg}
              alt="Login Icon"
              className="absolute top-[60%] left-[16%] z-50 w-20 object-cover"
            />
            <div className="h-screen bg-login-bg">
              <div className="absolute top-1/2 left-1/2 w-[60%] h-[70%] bg-white bg-opacity-20 border border-white rounded-[2.875rem] transform -translate-x-1/2 -translate-y-1/2 shadow-md overflow-hidden">
                <h2 className="absolute font-poppins text-white font-bold text-[2.5rem] max-w-[12.5rem] m-6">
                  Tek bir platformla kliniğinizi yönetin!
                </h2>
                <img
                  src={DoctorLoginImage}
                  alt="Doctor Login"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
