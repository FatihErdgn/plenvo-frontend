export default function FinanceDashboard() {
  return (
    <div className="w-screen bg-[#f4f7fe] p-8 overflow-hidden rounded-l-[40px] relative z-20">
      <h1 className="text-3xl font-bold mb-6">Finansal Dashboard</h1>
      <div className="flex flex-row mx-4 gap-4 items-center justify-between">
        <div className="bg-white justify-between h-[20vh] w-[40vh] font-montserrat p-6 rounded-lg shadow-md"></div>
        <div className="bg-white justify-between h-[20vh] w-[40vh] font-montserrat p-6 rounded-lg shadow-md"></div>
        <div className="bg-white justify-between h-[20vh] w-[40vh] font-montserrat p-6 rounded-lg shadow-md"></div>
        <div className="bg-white justify-between h-[20vh] w-[40vh] font-montserrat p-6 rounded-lg shadow-md"></div>
      </div>
      <div className="flex flex-row mx-4 mt-8 gap-4 items-center justify-between">
        <div className="bg-white justify-between h-[60vh] w-[50vh] font-montserrat p-6 rounded-lg shadow-md"></div>
        <div className="bg-white justify-between h-[60vh] w-[107vh] font-montserrat p-6 rounded-lg shadow-md"></div>
      </div>
    </div>
  );
}
