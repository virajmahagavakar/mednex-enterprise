import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLayout from './components/admin/AdminLayout';
import Branches from './pages/admin/Branches';
import Staff from './pages/admin/Staff';
import AdminDashboard from './pages/admin/AdminDashboard';
import Subscription from './pages/admin/Subscription';
import InfrastructureManager from './pages/admin/InfrastructureManager';
import AssetRegistry from './pages/admin/AssetRegistry';

import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard';
import InventoryManagement from './pages/pharmacy/InventoryManagement';
import SupplierManagement from './pages/pharmacy/SupplierManagement';
import DispensingStation from './pages/pharmacy/DispensingStation';
import PharmacistLayout from './components/pharmacist/PharmacistLayout';

import DoctorLayout from './components/doctor/DoctorLayout';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import Patients from './pages/doctor/Patients';
import PatientEMR from './pages/doctor/PatientEMR';
import IPDDashboard from './pages/doctor/IPDDashboard';
import DoctorSchedule from './pages/doctor/DoctorSchedule';
import DoctorAppointments from './pages/doctor/DoctorAppointments';

import ReceptionistLayout from './components/receptionist/ReceptionistLayout';
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard';
import WardManagement from './pages/receptionist/WardManagement';
import WardAvailability from './pages/receptionist/WardAvailability';
import BillingDashboard from './pages/receptionist/BillingDashboard';
import ICUAvailability from './pages/receptionist/ICUAvailability';
import ReceptionistAppointments from './pages/receptionist/ReceptionistAppointments';

import NurseLayout from './components/nurse/NurseLayout';
import NurseDashboard from './pages/nurse/NurseDashboard';
import IPDNurseDashboard from './pages/nurse/IPDNurseDashboard';

import LabLayout from './components/lab/LabLayout';
import { LabDashboard } from './pages/diagnostics/LabDashboard';

import RadiologyLayout from './components/radiology/RadiologyLayout';
import { RadiologyDashboard } from './pages/diagnostics/RadiologyDashboard';

import { OTDashboard } from './pages/surgery/OTDashboard';
import CleaningDashboard from './pages/support/CleaningDashboard';
import MaintenanceDashboard from './pages/support/MaintenanceDashboard';

import PatientRegistration from './pages/auth/PatientRegistration';
import PatientLayout from './components/patient/PatientLayout';
import PatientDashboard from './pages/patient/PatientDashboard';
import AppointmentBookingWizard from './pages/patient/AppointmentBookingWizard';
import MedicalRecords from './pages/patient/MedicalRecords';
import PatientProfile from './pages/patient/PatientProfile';
import Appointments from './pages/patient/Appointments';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Console Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="branches" element={<Branches />} />
          <Route path="staff" element={<Staff />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="infrastructure" element={<InfrastructureManager />} />
          <Route path="assets" element={<AssetRegistry />} />
          <Route path="settings" element={<div style={{ padding: '2rem' }}><h2>Settings Coming Soon</h2></div>} />
        </Route>

        {/* Pharmacist Routes */}
        <Route path="/pharmacist" element={<PharmacistLayout />}>
          <Route index element={<Navigate to="/pharmacist/dashboard" replace />} />
          <Route path="dashboard" element={<PharmacyDashboard />} />
          <Route path="inventory" element={<InventoryManagement />} />
          <Route path="suppliers" element={<SupplierManagement />} />
          <Route path="dispense" element={<DispensingStation />} />
        </Route>

        <Route path="/doctor" element={<DoctorLayout />}>
          <Route index element={<Navigate to="/doctor/dashboard" replace />} />
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="patient/:id/emr" element={<PatientEMR />} />
          <Route path="ipd" element={<IPDDashboard />} />
          <Route path="schedule" element={<DoctorSchedule />} />
          <Route path="ot-schedule" element={<OTDashboard />} />
          <Route path="appointments" element={<DoctorAppointments />} />
        </Route>

        <Route path="/receptionist" element={<ReceptionistLayout />}>
          <Route index element={<Navigate to="/receptionist/dashboard" replace />} />
          <Route path="dashboard" element={<ReceptionistDashboard />} />
          <Route path="appointments" element={<ReceptionistAppointments />} />
          <Route path="billing" element={<BillingDashboard />} />
          <Route path="wards" element={<WardManagement />} />
          <Route path="availability" element={<WardAvailability />} />
          <Route path="icu" element={<ICUAvailability />} />
          <Route path="ot-schedule" element={<OTDashboard />} />
          <Route path="ot" element={<Navigate to="/receptionist/ot-schedule" replace />} />
        </Route>

        <Route path="/nurse" element={<NurseLayout />}>
          <Route index element={<Navigate to="/nurse/dashboard" replace />} />
          <Route path="dashboard" element={<NurseDashboard />} />
          <Route path="ipd" element={<IPDNurseDashboard />} />
          <Route path="vitals" element={<div style={{ padding: '2rem' }}><h2>Vitals Coming Soon</h2></div>} />
        </Route>

        <Route path="/lab" element={<LabLayout />}>
          <Route index element={<Navigate to="/lab/dashboard" replace />} />
          <Route path="dashboard" element={<LabDashboard />} />
        </Route>

        <Route path="/radiology" element={<RadiologyLayout />}>
          <Route index element={<Navigate to="/radiology/dashboard" replace />} />
          <Route path="dashboard" element={<RadiologyDashboard />} />
        </Route>

        <Route path="/support">
          <Route path="cleaning" element={<CleaningDashboard />} />
          <Route path="maintenance" element={<MaintenanceDashboard />} />
        </Route>

        <Route path="/register/patient" element={<PatientRegistration />} />

        {/* Patient Portal Routes */}
        <Route path="/patient-portal" element={<PatientLayout />}>
          <Route index element={<Navigate to="/patient-portal/dashboard" replace />} />
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="profile" element={<PatientProfile />} />
          <Route path="book-appointment" element={<AppointmentBookingWizard />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="records" element={<MedicalRecords />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
