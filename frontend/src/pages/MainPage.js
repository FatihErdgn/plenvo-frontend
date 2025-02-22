import { Link } from "react-router-dom";
import DoctorLoginImage from "../assets/images/doctor-login-3.png";
import thunderImg from "../assets/images/login-thunder.png";
import { IoPersonOutline } from "react-icons/io5";

export default function MainPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f4f7fe] font-poppins">
      <div className="w-full h-auto flex flex-col md:flex-row overflow-hidden">
        {/* Sol taraf (Beyaz) */}
        <div className="flex flex-col items-center justify-center w-full md:w-1/2 bg-white p-6 md:p-0">
          <h1 className="font-bold text-[2.5rem] md:text-[2.875rem] mb-2 text-center">
            HOŞGELDİNİZ!
          </h1>
          <p className="text-base md:text-lg mb-6 md:mb-10 text-gray-600 text-center">
            Aşağıdaki gerekli bilgileri girerek kliniğimizden randevu
            alabilirsiniz.
          </p>
          <div className="flex items-center w-full my-6  max-w-[35rem]">
            {/* Soldaki çizgi */}
            <div className="flex-grow h-px bg-gray-300"></div>

            {/* Başlık */}
            <h1 className="mx-4 text-xl text-gray-700">
              <span className="font-bold text-black">Yönetici</span> Girişi
            </h1>

            {/* Sağdaki çizgi */}
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>
          <Link
            to="/login"
            className="flex items-center justify-center w-full md:w-[35rem] h-[3.5rem] border border-gray-300 text-black rounded-[1.25rem] hover:border-[#46B4BA] hover:border-2 transition"
          >
            <IoPersonOutline className="text-[#007E85] w-5 h-5 mr-2" />
            Giriş Yap
          </Link>
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
                Birkaç tıkla sağlığınıza kavuşun!
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
