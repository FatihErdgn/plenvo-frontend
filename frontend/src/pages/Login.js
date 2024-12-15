import DoctorLoginImage from "../assets/images/doctor-login-1.png";

export default function Login() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#f0f0f0]">
      <div className="w-[1500px] h-[800px] rounded-3xl flex overflow-hidden">
        {/* Sol taraf (Beyaz) */}
        <div className="w-1/2 bg-white"></div>

        {/* Sağ taraf (Mavi Gradient) */}
        <div className="relative w-1/2 bg-gradient-to-r from-[#46B4BA] to-[#007E85]">
          <div className="h-screen bg-login-bg">
            <div className="absolute top-1/2 left-1/2 w-3/5 h-4/6 bg-white bg-opacity-20 border border-white rounded-[46px] transform -translate-x-1/2 -translate-y-1/2 shadow-md">
              <img
                src={DoctorLoginImage}
                alt="Doctor Login"
                className="w-full h-full overflow-visible object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
