import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Login from './pages/auth/Login';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardLayout from './components/shared/DashboardLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import Cases from './pages/admin/Cases';
import LawyerDashboard from './pages/lawyer/LawyerDashboard';
import CaseDetail from './pages/lawyer/CaseDetail';
import LegalSearch from './pages/lawyer/LegalSearch';
import LegalNews from './pages/lawyer/LegalNews';
import CalendarWorkspace from './pages/lawyer/CalendarWorkspace';
import ClientDashboard from './pages/client/ClientDashboard';
import PageTransitionWrapper from './components/layout/PageTransitionWrapper';

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* PUBLIC */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<PageTransitionWrapper><Login /></PageTransitionWrapper>} />
        <Route path="/register" element={<PageTransitionWrapper><RegisterPage /></PageTransitionWrapper>} />

        {/* ADMIN PROTECTED GROUP */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/dashboard"   element={<PageTransitionWrapper><AdminDashboard /></PageTransitionWrapper>} />
            <Route path="/admin/cases"       element={<PageTransitionWrapper><Cases /></PageTransitionWrapper>} />
            <Route path="/admin/cases/:id"   element={<PageTransitionWrapper><div>Admin Case Detail — Coming Soon</div></PageTransitionWrapper>} />
            <Route path="/admin/clients"     element={<PageTransitionWrapper><div>Admin Clients — Coming Soon</div></PageTransitionWrapper>} />
            <Route path="/admin/staff"       element={<PageTransitionWrapper><div>Admin Staff — Coming Soon</div></PageTransitionWrapper>} />
            <Route path="/admin/billing"     element={<PageTransitionWrapper><div>Admin Billing — Coming Soon</div></PageTransitionWrapper>} />
          </Route>
        </Route>

        {/* LAWYER PROTECTED GROUP */}
        <Route element={<ProtectedRoute allowedRoles={["lawyer"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/lawyer/dashboard"       element={<PageTransitionWrapper><LawyerDashboard /></PageTransitionWrapper>} />
            <Route path="/lawyer/cases/:id"       element={<PageTransitionWrapper><CaseDetail /></PageTransitionWrapper>} />
            <Route path="/lawyer/calendar"        element={<PageTransitionWrapper><CalendarWorkspace /></PageTransitionWrapper>} />
            <Route path="/lawyer/ai"              element={<PageTransitionWrapper><div>Lawyer AI Analyzer — Coming Soon</div></PageTransitionWrapper>} />
            <Route path="/lawyer/search"          element={<PageTransitionWrapper><LegalSearch /></PageTransitionWrapper>} />
            <Route path="/lawyer/news"            element={<PageTransitionWrapper><LegalNews /></PageTransitionWrapper>} />
            <Route path="/lawyer/appointments"    element={<PageTransitionWrapper><div>Lawyer Appointments — Coming Soon</div></PageTransitionWrapper>} />
          </Route>
        </Route>

        {/* CLIENT PROTECTED GROUP */}
        <Route element={<ProtectedRoute allowedRoles={["client"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/client/dashboard"       element={<PageTransitionWrapper><ClientDashboard /></PageTransitionWrapper>} />
            <Route path="/client/cases"           element={<PageTransitionWrapper><div>Client My Cases — Coming Soon</div></PageTransitionWrapper>} />
            <Route path="/client/cases/:id"       element={<PageTransitionWrapper><div>Client Case Detail — Coming Soon</div></PageTransitionWrapper>} />
            <Route path="/client/documents"       element={<PageTransitionWrapper><div>Client Documents — Coming Soon</div></PageTransitionWrapper>} />
            <Route path="/client/appointments"    element={<PageTransitionWrapper><div>Client Appointments — Coming Soon</div></PageTransitionWrapper>} />
            <Route path="/client/notifications"   element={<PageTransitionWrapper><div>Client Notifications — Coming Soon</div></PageTransitionWrapper>} />
          </Route>
        </Route>

        {/* CATCH-ALL */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
