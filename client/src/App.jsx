import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/shared/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

function App() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ADMIN PROTECTED GROUP */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin/dashboard"   element={<div>Admin Dashboard — Coming Soon</div>} />
        <Route path="/admin/cases"       element={<div>Admin Cases — Coming Soon</div>} />
        <Route path="/admin/cases/:id"   element={<div>Admin Case Detail — Coming Soon</div>} />
        <Route path="/admin/clients"     element={<div>Admin Clients — Coming Soon</div>} />
        <Route path="/admin/staff"       element={<div>Admin Staff — Coming Soon</div>} />
        <Route path="/admin/billing"     element={<div>Admin Billing — Coming Soon</div>} />
      </Route>

      {/* LAWYER PROTECTED GROUP */}
      <Route element={<ProtectedRoute allowedRoles={["lawyer"]} />}>
        <Route path="/lawyer/dashboard"       element={<div>Lawyer Dashboard — Coming Soon</div>} />
        <Route path="/lawyer/cases/:id"       element={<div>Lawyer Case Detail — Coming Soon</div>} />
        <Route path="/lawyer/calendar"        element={<div>Lawyer Calendar — Coming Soon</div>} />
        <Route path="/lawyer/ai"              element={<div>Lawyer AI Analyzer — Coming Soon</div>} />
        <Route path="/lawyer/search"          element={<div>Indian Kanoon Search — Coming Soon</div>} />
        <Route path="/lawyer/news"            element={<div>Legal News Feed — Coming Soon</div>} />
        <Route path="/lawyer/appointments"    element={<div>Lawyer Appointments — Coming Soon</div>} />
      </Route>

      {/* CLIENT PROTECTED GROUP */}
      <Route element={<ProtectedRoute allowedRoles={["client"]} />}>
        <Route path="/client/dashboard"       element={<div>Client Dashboard — Coming Soon</div>} />
        <Route path="/client/cases"           element={<div>Client My Cases — Coming Soon</div>} />
        <Route path="/client/cases/:id"       element={<div>Client Case Detail — Coming Soon</div>} />
        <Route path="/client/documents"       element={<div>Client Documents — Coming Soon</div>} />
        <Route path="/client/appointments"    element={<div>Client Appointments — Coming Soon</div>} />
        <Route path="/client/notifications"   element={<div>Client Notifications — Coming Soon</div>} />
      </Route>

      {/* CATCH-ALL */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
