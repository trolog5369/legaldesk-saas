import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/shared/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardLayout from './components/shared/DashboardLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import Cases from './pages/admin/Cases';
import LawyerDashboard from './pages/lawyer/LawyerDashboard';
import CaseDetail from './pages/lawyer/CaseDetail';
import ClientDashboard from './pages/client/ClientDashboard';

function App() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ADMIN PROTECTED GROUP */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard"   element={<AdminDashboard />} />
          <Route path="/admin/cases"       element={<Cases />} />
          <Route path="/admin/cases/:id"   element={<div>Admin Case Detail — Coming Soon</div>} />
          <Route path="/admin/clients"     element={<div>Admin Clients — Coming Soon</div>} />
          <Route path="/admin/staff"       element={<div>Admin Staff — Coming Soon</div>} />
          <Route path="/admin/billing"     element={<div>Admin Billing — Coming Soon</div>} />
        </Route>
      </Route>

      {/* LAWYER PROTECTED GROUP */}
      <Route element={<ProtectedRoute allowedRoles={["lawyer"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/lawyer/dashboard"       element={<LawyerDashboard />} />
          <Route path="/lawyer/cases/:id"       element={<CaseDetail />} />
          <Route path="/lawyer/calendar"        element={<div>Lawyer Calendar — Coming Soon</div>} />
          <Route path="/lawyer/ai"              element={<div>Lawyer AI Analyzer — Coming Soon</div>} />
          <Route path="/lawyer/search"          element={<div>Indian Kanoon Search — Coming Soon</div>} />
          <Route path="/lawyer/news"            element={<div>Legal News Feed — Coming Soon</div>} />
          <Route path="/lawyer/appointments"    element={<div>Lawyer Appointments — Coming Soon</div>} />
        </Route>
      </Route>

      {/* CLIENT PROTECTED GROUP */}
      <Route element={<ProtectedRoute allowedRoles={["client"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/client/dashboard"       element={<ClientDashboard />} />
          <Route path="/client/cases"           element={<div>Client My Cases — Coming Soon</div>} />
          <Route path="/client/cases/:id"       element={<div>Client Case Detail — Coming Soon</div>} />
          <Route path="/client/documents"       element={<div>Client Documents — Coming Soon</div>} />
          <Route path="/client/appointments"    element={<div>Client Appointments — Coming Soon</div>} />
          <Route path="/client/notifications"   element={<div>Client Notifications — Coming Soon</div>} />
        </Route>
      </Route>

      {/* CATCH-ALL */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
