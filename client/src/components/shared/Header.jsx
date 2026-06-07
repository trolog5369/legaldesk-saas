import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, Search, User } from 'lucide-react';
import { toggleSidebar } from '../../store/uiSlice';
import { logoutUser as logout } from '../../store/slices/authSlice';

const ROUTE_MAP = {
  '/admin/dashboard': 'Dashboard',
  '/admin/cases': 'Cases',
  '/admin/clients': 'Clients',
  '/admin/staff': 'Staff',
  '/admin/billing': 'Billing',
  '/lawyer/dashboard': 'Dashboard',
  '/lawyer/cases': 'My Cases',
  '/lawyer/calendar': 'Calendar',
  '/lawyer/ai': 'AI Tools',
  '/lawyer/search': 'Search',
  '/lawyer/news': 'News',
  '/lawyer/appointments': 'Appointments',
  '/client/dashboard': 'Dashboard',
  '/client/cases': 'My Cases',
  '/client/documents': 'Documents',
  '/client/appointments': 'Appointments',
  '/client/notifications': 'Notifications',
};

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(state => state.auth.user);
  
  // Safe check if notifications slice exists
  const unreadNotifications = useSelector(state => state.notifications?.items?.filter(i => !i.read).length > 0 || false);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (ROUTE_MAP[path]) return ROUTE_MAP[path];
    if (path.startsWith('/lawyer/cases/')) return 'Case Details';
    if (path.startsWith('/admin/cases/')) return 'Case Details';
    if (path.startsWith('/client/cases/')) return 'Case Details';
    return 'LegalDesk';
  };

  return (
    <div className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-6 shrink-0 z-30 relative">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => dispatch(toggleSidebar())}
          className="text-[#64748B] hover:text-[#0F172A] transition-colors p-1"
        >
          <Menu size={20} />
        </button>
        <span className="hidden md:inline-block text-[15px] font-medium text-[#0F172A]">
          {getPageTitle()}
        </span>
      </div>

      <div className="flex items-center gap-5">
        <button className="text-[#64748B] hover:text-[#0F172A] transition-colors relative p-1">
          <Bell size={20} />
          {unreadNotifications && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full border border-white"></span>
          )}
        </button>
        
        <button className="text-[#64748B] hover:text-[#0F172A] transition-colors p-1">
          <Search size={20} />
        </button>

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-[#334155] text-white flex items-center justify-center text-[14px] font-bold">
              {getInitials(user?.name)}
            </div>
            <span className="hidden md:inline-block text-[14px] font-medium text-[#0F172A]">
              {user?.name || 'User'}
            </span>
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-[#E2E8F0] z-50"
              >
                <div className="px-4 py-2 text-[13px] text-[#94A3B8] cursor-not-allowed">
                  Profile
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-[13px] text-[#EF4444] hover:bg-[#F8FAFC] transition-colors"
                >
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
