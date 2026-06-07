import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scale, ChevronLeft, ChevronRight, LayoutDashboard, Briefcase, 
  Users, UserCheck, Receipt, CalendarDays, Sparkles, Search, 
  Newspaper, Clock, FileText, Bell, LogOut 
} from 'lucide-react';
import { toggleSidebar } from '../../store/uiSlice';
import { logoutUser as logout } from '../../store/slices/authSlice';

const NAV_CONFIG = {
  admin: [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/cases', label: 'Cases', icon: Briefcase },
    { path: '/admin/clients', label: 'Clients', icon: Users },
    { path: '/admin/staff', label: 'Staff', icon: UserCheck },
    { path: '/admin/billing', label: 'Billing', icon: Receipt },
  ],
  lawyer: [
    { path: '/lawyer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/lawyer/cases', label: 'My Cases', icon: Briefcase },
    { path: '/lawyer/calendar', label: 'Calendar', icon: CalendarDays },
    { path: '/lawyer/ai', label: 'AI Tools', icon: Sparkles },
    { path: '/lawyer/search', label: 'Search', icon: Search },
    { path: '/lawyer/news', label: 'News', icon: Newspaper },
    { path: '/lawyer/appointments', label: 'Appointments', icon: Clock },
  ],
  client: [
    { path: '/client/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/client/cases', label: 'My Cases', icon: Briefcase },
    { path: '/client/documents', label: 'Documents', icon: FileText },
    { path: '/client/appointments', label: 'Appointments', icon: CalendarDays },
    { path: '/client/notifications', label: 'Notifications', icon: Bell },
  ]
};

const ROLE_BADGES = {
  admin: { bg: '#7C3AED' },
  lawyer: { bg: '#1D4ED8' },
  client: { bg: '#0F766E' }
};

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isOpen = useSelector(state => state.ui.sidebarOpen);
  const user = useSelector(state => state.auth.user);
  
  const role = user?.role || 'client';
  const navItems = NAV_CONFIG[role] || NAV_CONFIG.client;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: isOpen ? 240 : 64 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="h-screen bg-[#1E293B] shrink-0 flex flex-col relative z-20"
      style={{ boxShadow: '2px 0 8px rgba(0,0,0,0.15)' }}
    >
      {/* Header / Logo */}
      <div className="h-16 flex items-center px-4 relative shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 flex justify-center shrink-0">
            <Scale size={20} color="#1D4ED8" />
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="text-white text-[18px] font-bold whitespace-nowrap"
              >
                LegalDesk
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        
        <button
          onClick={() => dispatch(toggleSidebar())}
          className={`absolute ${isOpen ? 'right-4' : 'left-1/2 -translate-x-1/2'} top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#334155] hover:bg-[#475569] flex items-center justify-center transition-colors z-10`}
        >
          {isOpen ? <ChevronLeft size={16} color="white" /> : <ChevronRight size={16} color="white" />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3 custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                relative flex items-center rounded-md h-10 transition-colors group
                ${isActive ? 'bg-[#1D4ED8] text-white' : 'text-[#94A3B8] hover:bg-[#334155] hover:text-[#CBD5E1]'}
                ${isOpen ? 'px-3' : 'justify-center'}
              `}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#60A5FA] rounded-l-md" />
                  )}
                  <div className={`flex justify-center ${isOpen ? 'mr-3' : ''}`}>
                    <Icon size={20} />
                  </div>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="text-[13px] font-medium truncate"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  
                  {!isOpen && (
                    <div className="absolute left-full ml-4 px-2 py-1 bg-white text-[#0F172A] text-[12px] font-medium rounded shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                      {item.label}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User Info Block */}
      <div className="p-4 border-t border-[#334155] shrink-0">
        <div className={`flex items-center ${isOpen ? 'justify-between' : 'justify-center'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#334155] text-white flex items-center justify-center text-[14px] font-bold shrink-0">
              {getInitials(user?.name)}
            </div>
            
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col overflow-hidden"
                >
                  <span className="text-[13px] font-semibold text-white truncate w-24">
                    {user?.name || 'User'}
                  </span>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider text-white px-1.5 py-0.5 rounded-full inline-flex w-max mt-0.5"
                    style={{ backgroundColor: ROLE_BADGES[role]?.bg }}
                  >
                    {role}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {isOpen && (
            <button 
              onClick={handleLogout}
              className="text-[#94A3B8] hover:text-[#EF4444] transition-colors p-1"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
