import DoctorLoginImage from "../assets/images/doctor-login-1.png";
import thunderImg from "../assets/images/login-thunder.png";
import { LuUser } from "react-icons/lu";
import { TbLockPassword } from "react-icons/tb";

export default function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f4f7fe]">
      <div className="w-full h-auto md:h-[800px] md:w-[1500px] rounded-3xl flex flex-col md:flex-row overflow-hidden">
        {/* Sol taraf (Beyaz) */}
        <div className="flex flex-col items-center justify-center w-full md:w-1/2 bg-white p-6 md:p-0">
          <h1 className="font-poppins font-bold text-2xl md:text-3xl">WELCOME DOCTOR</h1>
          <p className="font-poppins text-base md:text-lg mb-6 md:mb-10 text-gray-600 text-center">
            How to i get started lorem ipsum dolor at?
          </p>

          <div className="flex items-center w-full max-w-[400px] h-[57px] rounded-2xl bg-[#F0EDFF] px-4 mb-4 shadow-sm">
            <LuUser className="text-[#1C1C1C] mr-3" size={20} />
            <input
              type="text"
              placeholder="Username"
              className="w-full bg-transparent outline-none text-[#1C1C1C] placeholder-[#1C1C1C]"
            />
          </div>

          <div className="flex items-center w-full max-w-[400px] h-[57px] rounded-2xl bg-[#F0EDFF] px-4 mb-6 md:mb-10 shadow-sm">
            <TbLockPassword className="text-[#1C1C1C] mr-3" size={20} />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-transparent outline-none text-[#1C1C1C] placeholder-[#1C1C1C]"
            />
          </div>

          <button className="font-poppins text-white px-6 py-3 text-sm font-semibold rounded-2xl bg-gradient-to-r from-[#46B4BA] to-[#007E85]">
            Login Now
          </button>
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
