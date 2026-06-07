import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, animate } from 'framer-motion';
import { Briefcase, CheckCircle2, IndianRupee, AlertCircle, Scale, Receipt, FileUp, Activity } from 'lucide-react';
import { selectUser } from '../../store/slices/authSlice';
import SkeletonLoader from '../../components/ui/SkeletonLoader';

const stats = [
  { label: 'Active Cases',      value: 47, icon: Briefcase,  color: '#3B82F6' },
  { label: 'Closed This Month', value: 12, icon: CheckCircle2, color: '#22C55E' },
  { label: 'Total Revenue',     value: '₹8.4L', icon: IndianRupee, color: '#1D4ED8', isRupee: true },
  { label: 'Pending Invoices',  value: 9, icon: AlertCircle, color: '#F59E0B' },
];

function StatCard({ stat }) {
  const Icon = stat.icon;
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    if (!stat.isRupee) {
      const controls = animate(0, stat.value, { 
        duration: 1.5, 
        ease: "easeOut",
        onUpdate: value => setDisplayCount(Math.round(value))
      });
      return controls.stop;
    }
  }, [stat]);

  const displayValue = stat.isRupee ? stat.value : displayCount;

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex items-start justify-between cursor-default"
    >
      <div>
        <div className="text-[32px] font-bold text-[#0F172A]">
          {displayValue}
        </div>
        <div className="text-[13px] text-[#64748B] mt-1">{stat.label}</div>
      </div>
      <div 
        className="rounded-lg p-2.5"
        style={{ backgroundColor: `${stat.color}20` }}
      >
        <Icon size={20} color={stat.color} />
      </div>
    </motion.div>
  );
}

// Helper to get relative time
const getRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now - d) / 1000);
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return d.toLocaleDateString();
};

export default function AdminDashboard() {
  const user = useSelector(selectUser);
  const adminStatus = useSelector(state => state.admin?.status || 'succeeded');
  const invoices = useSelector(state => state.invoice?.items || []);
  const appointments = useSelector(state => state.appointment?.items || []);

  const recentActivity = React.useMemo(() => {
    const activities = [];
    
    invoices.forEach(inv => {
      activities.push({
        id: inv._id,
        type: 'invoice',
        title: `Invoice ${inv.invoiceNumber} generated for ${inv.clientId?.name || 'Client'}`,
        createdAt: new Date(inv.createdAt || Date.now()),
        icon: Receipt,
        color: '#F59E0B',
        bg: '#FEF3C7'
      });
    });

    appointments.forEach(appt => {
      activities.push({
        id: appt._id,
        type: 'appointment',
        title: `Appointment booked: ${appt.title}`,
        createdAt: new Date(appt.createdAt || appt.start),
        icon: Scale,
        color: '#1D4ED8',
        bg: '#DBEAFE'
      });
    });

    return activities
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);
  }, [invoices, appointments]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Firm Overview</h1>
        <p className="text-sm text-[#64748B] mt-1">Good morning, {user?.name}. Here's what's happening today.</p>
      </div>

      {adminStatus === 'loading' ? (
        <SkeletonLoader variant="stat-cards" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <StatCard key={i} stat={stat} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left card (Recent Activity) */}
        <div className="col-span-1 lg:col-span-2 bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
          <h2 className="text-[16px] font-semibold text-[#0F172A] mb-4">Recent Activity</h2>
          
          {adminStatus === 'loading' ? (
            <SkeletonLoader variant="list" />
          ) : recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Activity size={40} className="text-[#94A3B8] mb-3" />
              <p className="text-[13px] text-[#64748B]">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-0 relative">
              {recentActivity.map((activity, idx) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="relative flex py-3">
                    <div className="flex flex-col items-center mr-4 relative shrink-0 w-8">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center z-10 shadow-sm border border-white"
                        style={{ backgroundColor: activity.bg }}
                      >
                        <Icon size={14} color={activity.color} />
                      </div>
                      {idx < recentActivity.length - 1 && (
                        <div className="absolute top-[32px] bottom-[-12px] w-[2px] bg-[#E2E8F0]" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="text-[14px] font-medium text-[#0F172A]">{activity.title}</h3>
                      <p className="text-[12px] text-[#64748B] mt-0.5">{getRelativeTime(activity.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right card (Case Status Summary) */}
        <div className="col-span-1 bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
          <h2 className="text-[16px] font-semibold text-[#0F172A] mb-5">Case Status Summary</h2>
          {adminStatus === 'loading' ? (
            <SkeletonLoader variant="list" />
          ) : (
            <div className="space-y-3 flex flex-col items-start">
              <span className="rounded-full px-3 py-1.5 text-[12px] font-semibold bg-[#EFF6FF] text-[#1D4ED8] border-l-[3px] border-[#1D4ED8] w-full flex justify-between items-center">
                <span>Active</span><span>28</span>
              </span>
              <span className="rounded-full px-3 py-1.5 text-[12px] font-semibold bg-[#FEF2F2] text-[#EF4444] border-l-[3px] border-[#EF4444] w-full flex justify-between items-center">
                <span>Urgent</span><span>7</span>
              </span>
              <span className="rounded-full px-3 py-1.5 text-[12px] font-semibold bg-[#FEF3C7] text-[#F59E0B] border-l-[3px] border-[#F59E0B] w-full flex justify-between items-center">
                <span>Hearing Soon</span><span>12</span>
              </span>
              <span className="rounded-full px-3 py-1.5 text-[12px] font-semibold bg-[#F0FDF4] text-[#22C55E] border-l-[3px] border-[#22C55E] w-full flex justify-between items-center">
                <span>Completed</span><span>12</span>
              </span>
              <span className="rounded-full px-3 py-1.5 text-[12px] font-semibold bg-[#F3F4F6] text-[#6B7280] border-l-[3px] border-[#6B7280] w-full flex justify-between items-center">
                <span>Closed</span><span>8</span>
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Fallback for table skeleton request */}
      {adminStatus === 'loading' && (
        <div className="mt-6">
          <SkeletonLoader variant="table" />
        </div>
      )}
    </div>
  );
}
