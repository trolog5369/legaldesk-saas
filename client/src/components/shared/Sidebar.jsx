import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Briefcase, Users, UserCheck, Receipt,
  CalendarDays, BrainCircuit, Search, Newspaper, Clock,
  FileText, Bell, LogOut
} from 'lucide-react';
import { logoutUser, selectUser } from '../../store/slices/authSlice';

const NAV_CONFIG = {
  admin: [
    { label: 'Dashboard',   icon: LayoutDashboard,  path: '/admin/dashboard' },
    { label: 'Cases',       icon: Briefcase,        path: '/admin/cases' },
    { label: 'Clients',     icon: Users,            path: '/admin/clients' },
    { label: 'Staff',       icon: UserCheck,        path: '/admin/staff' },
    { label: 'Billing',     icon: Receipt,          path: '/admin/billing' },
  ],
  lawyer: [
    { label: 'Dashboard',   icon: LayoutDashboard,  path: '/lawyer/dashboard' },
    { label: 'My Cases',    icon: Briefcase,        path: '/lawyer/cases' },
    { label: 'Calendar',    icon: CalendarDays,     path: '/lawyer/calendar' },
    { label: 'AI Analyzer', icon: BrainCircuit,     path: '/lawyer/ai' },
    { label: 'Search',      icon: Search,           path: '/lawyer/search' },
    { label: 'News',        icon: Newspaper,        path: '/lawyer/news' },
    { label: 'Appointments',icon: Clock,            path: '/lawyer/appointments' },
  ],
  client: [
    { label: 'Dashboard',      icon: LayoutDashboard, path: '/client/dashboard' },
    { label: 'My Cases',       icon: Briefcase,       path: '/client/cases' },
    { label: 'Documents',      icon: FileText,        path: '/client/documents' },
    { label: 'Appointments',   icon: CalendarDays,    path: '/client/appointments' },
    { label: 'Notifications',  icon: Bell,            path: '/client/notifications' },
  ]
};

const Tooltip = ({ children, label, disabled }) => {
  if (disabled) return <>{children}</>;
  return (
    <div className="group relative flex items-center w-full">
      {children}
      <div className="absolute left-full ml-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0F172A] text-white text-xs rounded py-1.5 px-2.5 pointer-events-none whitespace-nowrap z-50 shadow-lg border border-[#334155]">
        {label}
      </div>
    </div>
  );
};

export default function Sidebar({ isOpen }) {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const navItems = NAV_CONFIG[user?.role] ?? [];

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <motion.aside
      animate={{ width: isOpen ? 240 : 64 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="bg-[#1E293B] h-full flex flex-col overflow-hidden shrink-0"
    >
      <div className="h-16 flex items-center px-5 shrink-0 border-b border-[#334155]/50">
        {isOpen ? (
          <AnimatePresence mode="wait">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-white font-bold text-lg whitespace-nowrap pl-2"
            >
              LegalDesk
            </motion.span>
          </AnimatePresence>
        ) : (
          <span className="text-white font-bold text-lg mx-auto">LD</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 overflow-x-hidden w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.path} className="px-2 w-full">
              <Tooltip label={item.label} disabled={isOpen}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    isActive
                      ? 'flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#1D4ED8] text-white text-[13px] font-medium transition-all w-full'
                      : 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#94A3B8] hover:bg-[#334155] hover:text-white text-[13px] font-medium transition-all w-full'
                  }
                >
                  <div className="shrink-0 flex items-center justify-center">
                    <Icon size={20} strokeWidth={1.75} />
                  </div>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="overflow-hidden whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
              </Tooltip>
            </div>
          );
        })}
      </div>

      <div className="mt-auto pb-4 w-full px-2">
        <div className="border-t border-[#334155] mx-2 mb-2" />
        <Tooltip label="Sign Out" disabled={isOpen}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#94A3B8] hover:bg-[#334155] hover:text-red-400 text-[13px] font-medium transition-all w-full"
          >
            <div className="shrink-0 flex items-center justify-center">
              <LogOut size={20} strokeWidth={1.75} />
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </Tooltip>
      </div>
    </motion.aside>
  );
}
