import { CgLogOut } from "react-icons/cg";

export default function ConsultantPage() {
  return (
    <div className="flex h-screen bg-[#007E85] font-poppins">
      {/* Sol Yeşil Kısım */}
      <div className="w-[20%] p-6 flex flex-col justify-between text-white relative z-10">
        {/* Logo */}
        <div className="flex flex-col mb-8 items-center">
          <h1 className="text-2xl font-bold">Logo</h1>
        </div>

        {/* Menü */}
        <div>
          <ul>
            <li className="mb-4 flex items-center gap-2 text-white cursor-pointer">
              <span className="text-lg">📋</span> Manage Appointment
            </li>
            <li className="flex items-center gap-2 text-white cursor-pointer">
              <span className="text-lg">👤</span> Appointment List
            </li>
          </ul>
        </div>

        {/* Profil ve Çıkış */}
        <div className="text-sm">
          <div className="flex items-center gap-2 mb-4">
            <img
              src="https://via.placeholder.com/40"
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p>Receptionist</p>
              <p className="text-gray-200">recep@example.com</p>
            </div>
          </div>
          <button className="flex flex-row items-center justify-center bg-white w-full text-[#007E85] text-[17px] font-semibold px-4 py-2 rounded-md hover:bg-gray-200">
            <CgLogOut className="mx-1 pt-0.5" size={25}/>
            Log out
          </button>
        </div>
      </div>

      {/* Sağ Beyaz Kısım */}
      <div className="w-full bg-white p-8 overflow-hidden rounded-l-[40px] relative z-20">
        {/* Başlık */}
        <h1 className="text-2xl font-bold mb-6">Manage Appointments</h1>

        {/* İçerik */}
        <div>
          <p>Tablolar ve diğer içerik buraya gelir.</p>
        </div>
      </div>
    </div>
  );
}
