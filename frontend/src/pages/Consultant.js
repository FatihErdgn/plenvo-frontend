import ConsultantTable from "../components/ConsultantTable";
import SearchBar from "../components/SearchBar";
import AddAppointment from "../components/CreateAppointmentButton";

export default function ConsultantPage() {

  return (
      <div className="w-screen bg-white p-8 overflow-hidden rounded-l-[40px] relative z-20">
        {/* Başlık */}
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-3xl font-bold mb-6">
            Manage Appointments
          </h1>
          <div className="flex flex-row items-center justify-between space-x-6">
            <SearchBar />
            <AddAppointment />
          </div>
        </div>
        {/* İçerik */}
        <div>
          <ConsultantTable />
        </div>
      </div>
  );
}
