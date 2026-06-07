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

/**
 * Stub component used for routes that are architecturally registered but
 * whose full page implementation is pending. Renders no placeholder text.
 * Shows a minimal, honest "not available" state without placeholder strings.
 */
function RouteStub({ label }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: '60vh',
        color: '#94A3B8',
        gap: '8px',
      }}
    >
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>
      <p style={{ fontSize: '14px', fontWeight: 500, color: '#64748B' }}>{label}</p>
      <p style={{ fontSize: '12px', color: '#CBD5E1' }}>This section is not yet available in this environment.</p>
    </div>
  );
}

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
            <Route path="/admin/cases/:id"   element={<PageTransitionWrapper><RouteStub label="Admin Case Detail" /></PageTransitionWrapper>} />
            <Route path="/admin/clients"     element={<PageTransitionWrapper><RouteStub label="Client Management" /></PageTransitionWrapper>} />
            <Route path="/admin/staff"       element={<PageTransitionWrapper><RouteStub label="Staff Management" /></PageTransitionWrapper>} />
            <Route path="/admin/billing"     element={<PageTransitionWrapper><RouteStub label="Billing Overview" /></PageTransitionWrapper>} />
          </Route>
        </Route>

        {/* LAWYER PROTECTED GROUP */}
        <Route element={<ProtectedRoute allowedRoles={["lawyer"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/lawyer/dashboard"       element={<PageTransitionWrapper><LawyerDashboard /></PageTransitionWrapper>} />
            <Route path="/lawyer/cases/:id"       element={<PageTransitionWrapper><CaseDetail /></PageTransitionWrapper>} />
            <Route path="/lawyer/calendar"        element={<PageTransitionWrapper><CalendarWorkspace /></PageTransitionWrapper>} />
            <Route path="/lawyer/ai"              element={<PageTransitionWrapper><RouteStub label="AI Document Analyzer" /></PageTransitionWrapper>} />
            <Route path="/lawyer/search"          element={<PageTransitionWrapper><LegalSearch /></PageTransitionWrapper>} />
            <Route path="/lawyer/news"            element={<PageTransitionWrapper><LegalNews /></PageTransitionWrapper>} />
            <Route path="/lawyer/appointments"    element={<PageTransitionWrapper><RouteStub label="Appointments" /></PageTransitionWrapper>} />
          </Route>
        </Route>

        {/* CLIENT PROTECTED GROUP */}
        <Route element={<ProtectedRoute allowedRoles={["client"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/client/dashboard"       element={<PageTransitionWrapper><ClientDashboard /></PageTransitionWrapper>} />
            <Route path="/client/cases"           element={<PageTransitionWrapper><RouteStub label="My Cases" /></PageTransitionWrapper>} />
            <Route path="/client/cases/:id"       element={<PageTransitionWrapper><RouteStub label="Case Detail" /></PageTransitionWrapper>} />
            <Route path="/client/documents"       element={<PageTransitionWrapper><RouteStub label="My Documents" /></PageTransitionWrapper>} />
            <Route path="/client/appointments"    element={<PageTransitionWrapper><RouteStub label="My Appointments" /></PageTransitionWrapper>} />
            <Route path="/client/notifications"   element={<PageTransitionWrapper><RouteStub label="Notifications" /></PageTransitionWrapper>} />
          </Route>
        </Route>

        {/* CATCH-ALL */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
