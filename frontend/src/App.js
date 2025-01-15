import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
// import Home from "./pages/Home";
import ConsultantPage from "./pages/Appointment";
import SideBar from "./components/Sidebar";
import FinancePage from "./pages/Finance";
import FinanceDashboard from "./pages/FinanceDashboard";
import PersonnelManagementPage from "./pages/PersonnelManagement";

function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}

const MainLayout = () => {
  const location = useLocation();

  // Login sayfasında div'i gizle
  const isLoginPage = location.pathname === "/login";

  return (
    <>
      {!isLoginPage ? (
        <div className="flex h-screen bg-[#007E85] font-montserrat">
          <SideBar />
          <Routes>
            {/* <Route path="/" element={<Home />} /> */}
            <Route path="/" element={<ConsultantPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/personnel-management" element={<PersonnelManagementPage />} />
            <Route path="/finance-dashboard" element={<FinanceDashboard />} />
          </Routes>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      )}
    </>
  );
};

export default App;
