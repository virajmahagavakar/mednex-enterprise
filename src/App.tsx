
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLayout from './components/admin/AdminLayout';
import Branches from './pages/admin/Branches';
import Staff from './pages/admin/Staff';
import Subscription from './pages/admin/Subscription';

import DoctorLayout from './components/doctor/DoctorLayout';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import Patients from './pages/doctor/Patients';

import ReceptionistLayout from './components/receptionist/ReceptionistLayout';
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard';

import NurseLayout from './components/nurse/NurseLayout';
import NurseDashboard from './pages/nurse/NurseDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Console Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<div style={{ padding: '2rem' }}><h2>Dashboard Coming Soon</h2></div>} />
          <Route path="branches" element={<Branches />} />
          <Route path="staff" element={<Staff />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="settings" element={<div style={{ padding: '2rem' }}><h2>Settings Coming Soon</h2></div>} />
        </Route>

        {/* Doctor Routes */}
        <Route path="/doctor" element={<DoctorLayout />}>
          <Route index element={<Navigate to="/doctor/dashboard" replace />} />
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="appointments" element={<div style={{ padding: '2rem' }}><h2>Appointments Coming Soon</h2></div>} />
        </Route>

        {/* Receptionist Routes */}
        <Route path="/receptionist" element={<ReceptionistLayout />}>
          <Route index element={<Navigate to="/receptionist/dashboard" replace />} />
          <Route path="dashboard" element={<ReceptionistDashboard />} />
          <Route path="appointments" element={<div style={{ padding: '2rem' }}><h2>Appointments Coming Soon</h2></div>} />
          <Route path="billing" element={<div style={{ padding: '2rem' }}><h2>Billing Coming Soon</h2></div>} />
        </Route>

        {/* Nurse Routes */}
        <Route path="/nurse" element={<NurseLayout />}>
          <Route index element={<Navigate to="/nurse/dashboard" replace />} />
          <Route path="dashboard" element={<NurseDashboard />} />
          <Route path="wards" element={<div style={{ padding: '2rem' }}><h2>Wards & Vitals Coming Soon</h2></div>} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
