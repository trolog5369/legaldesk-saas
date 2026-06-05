import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import Sidebar from './Sidebar';
import { selectUser } from '../../store/slices/authSlice';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const user = useSelector(selectUser);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(prev => !prev)} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="h-16 bg-white border-b border-[#E2E8F0] flex items-center px-6 justify-between shrink-0">
          <button 
            onClick={() => setSidebarOpen(prev => !prev)}
            className="text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          </button>
          <div className="flex items-center">
            <span className="text-sm font-medium text-[#0F172A]">{user?.name}</span>
            {user?.role && (
              <span className="text-[10px] font-semibold tracking-widest text-[#64748B] uppercase ml-2 bg-[#F1F5F9] px-2 py-0.5 rounded">
                {user.role}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
