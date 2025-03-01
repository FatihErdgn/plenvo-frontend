import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Login from "./pages/Login";
import ConsultantPage from "./pages/Appointment";
import SideBar from "./components/Sidebar";
import FinancePage from "./pages/Finance";
import FinanceDashboard from "./pages/FinanceDashboard";
import PersonnelManagementPage from "./pages/PersonnelManagement";
import ProtectedRoute from "./utils/ProtectedRoute";
import { UserProvider } from "./contexts/UserContext";
import DoctorManagementPage from "./pages/DoctorManagement";
// import MainPage from "./pages/MainPage";

function App() {
  return (
    <Router>
      <UserProvider>
        <MainLayout />
      </UserProvider>
    </Router>
  );
}

const MainLayout = () => {
  const location = useLocation();
  // const isLoginPage = location.pathname === "/login";
  // const isMainPage = location.pathname === "/";
  const isLoginPage = location.pathname === "/";

  return (
    <>
      {isLoginPage ? ( // isLoginPage || isMainPage
        <Routes>
          {/* <Route path="/" element={<MainPage />} /> */}
          {/* <Route path="/login" element={<Login />} /> */}
          <Route path="/" element={<Login />} />
        </Routes>
      ) : (
        <div className="flex h-screen bg-[#007E85] font-montserrat">
          <SideBar />
          <Routes>
            <Route
              path="/appointments"
              element={
                <ProtectedRoute>
                  <ConsultantPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/finance"
              element={
                <ProtectedRoute>
                  <FinancePage />
                </ProtectedRoute>
              }
            />
            {/* <Route
              path="/doctor-management"
              element={
                <ProtectedRoute>
                  <DoctorManagementPage />
                </ProtectedRoute>
              }
            /> */}
            <Route
              path="/personnel-management"
              element={
                <ProtectedRoute>
                  <PersonnelManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/finance-dashboard"
              element={
                <ProtectedRoute>
                  <FinanceDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      )}
    </>
  );
};

export default App;
