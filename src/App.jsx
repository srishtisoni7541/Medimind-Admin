import React, { useContext } from "react";
import Login from "./pages/Login";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AdminContext } from "./context/AdminContext.jsx";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Admin/Dashboard";
import AllAppointments from "./pages/Admin/AllAppointments";
import AddDoctor from "./pages/Admin/AddDoctor";
import DoctorsList from "./pages/Admin/DoctorsList";
import { DoctorContext } from "./context/DoctorContext.jsx";
import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
import DoctorAppointments from "./pages/Doctor/DoctorAppointments";
import DoctorProfile from "./pages/Doctor/DoctorProfile";
import AddHospital from "./pages/Admin/AddHospital.jsx";
import CreatePrescription from "./pages/Doctor/CreatePres.jsx";
import UpdatePrescription from "./pages/Doctor/UpdatePrescription.jsx";
import DoctorPrescriptions from "./pages/Doctor/DoctorPrescriptions.jsx";
import HospitalsList from "./pages/Admin/HospitalsList.jsx";

import CreateDonationRequestForm from "./pages/CreateDonationRequestForm.jsx";
import HospitalManagement from "./pages/HospitalManagement.jsx";
import ViewMatchDonors from "./pages/ViewMatchDonors.jsx";
import ViewDonationRequest from "./pages/ViewDonationRequest.jsx";
import ViewScheduleDonors from "./pages/ViewScheduleDonors.jsx";

const App = () => {
  const { atoken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);

  return atoken || dToken ? (
    <div className="bg-[#f8f9fd]">
      <ToastContainer />
      <Navbar />
      <div className="flex items-start">
        <Sidebar />
        <Routes>
          <Route path="/" element={<></>} />
          <Route path="/admin-dashboard" element={<Dashboard />} />
          <Route path="/all-appointments" element={<AllAppointments />} />
          <Route path="/add-doctor" element={<AddDoctor />} />
          <Route path="/add-hospital" element={<AddHospital />} />
          <Route path="/doctor-list" element={<DoctorsList />} />
          <Route path="/hospital-list" element={<HospitalsList />} />
          <Route
            path="/admin/hospitals/:hospitalId"
            element={<HospitalManagement />}
          />
          <Route
            path="/admin/hospitals/:hospitalId/create-request"
            element={<CreateDonationRequestForm />}
          />
          
          <Route
            path="/admin/hospitals/:hospitalId/requests/:requestId/match-donors"
            element={<ViewMatchDonors />}
          />
          <Route
            path="/admin/hospitals/:hospitalId/requests/:requestId"
            element={<ViewDonationRequest />}
          />
          <Route
            path="/admin/hospitals/:hospitalId/match-donors"
            element={<ViewScheduleDonors />}
          />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor-appointments" element={<DoctorAppointments />} />
          <Route path="/doctor-profile" element={<DoctorProfile />} />
          <Route
            path="/doctor/create-prescription/:appointmentId"
            element={<CreatePrescription />}
          />

          <Route
            path="/doctor/update-prescription/:prescriptionId"
            element={<UpdatePrescription />}
          />

          <Route
            path="/doctor/prescriptions"
            element={<DoctorPrescriptions />}
          />
        </Routes>
      </div>
    </div>
  ) : (
    <>
      <Login />
      <ToastContainer />
    </>
  );
};

export default App;
