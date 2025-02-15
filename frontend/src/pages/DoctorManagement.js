import DoctorCalendar from "../components/DoctorManagement/DoctorCalendar";

export default function DoctorManagementPage() {
  return (
    <div className="w-screen bg-[#f4f7fe] p-8 overflow-auto rounded-l-[2.5rem] relative z-20">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-3xl font-bold mb-6">Doktor Paneli</h1>
        <div className="flex flex-row justify-end gap-4 items-center"></div>
      </div>
      <div>
        <DoctorCalendar />
      </div>
    </div>
  );
}
