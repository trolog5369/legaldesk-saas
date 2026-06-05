import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, animate } from 'framer-motion';
import { Briefcase, CheckCircle2, IndianRupee, AlertCircle } from 'lucide-react';
import { selectUser } from '../../store/slices/authSlice';

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

export default function AdminDashboard() {
  const user = useSelector(selectUser);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Firm Overview</h1>
        <p className="text-sm text-[#64748B] mt-1">Good morning, {user?.name}. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} stat={stat} />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Left card (col-span-2) */}
        <div className="col-span-2 bg-white border border-[#E2E8F0] rounded-xl p-5">
          <h2 className="text-lg font-semibold text-[#0F172A] mb-4">Lawyer Workload</h2>
          <div className="text-sm text-[#94A3B8] py-8 text-center">
            Bar chart coming in Week 2 — Day 3
          </div>
        </div>

        {/* Right card (col-span-1) */}
        <div className="col-span-1 bg-white border border-[#E2E8F0] rounded-xl p-5">
          <h2 className="text-lg font-semibold text-[#0F172A] mb-4">Case Status Summary</h2>
          <div className="space-y-2 flex flex-col items-start">
            <span className="rounded-full px-3 py-1 text-xs font-semibold bg-blue-500/15 text-blue-600 border-l-4 border-blue-500 w-full flex justify-between">
              <span>Active</span><span>28</span>
            </span>
            <span className="rounded-full px-3 py-1 text-xs font-semibold bg-red-500/15 text-red-600 border-l-4 border-red-500 w-full flex justify-between">
              <span>Urgent</span><span>7</span>
            </span>
            <span className="rounded-full px-3 py-1 text-xs font-semibold bg-amber-500/15 text-amber-600 border-l-4 border-amber-500 w-full flex justify-between">
              <span>Hearing Soon</span><span>12</span>
            </span>
            <span className="rounded-full px-3 py-1 text-xs font-semibold bg-green-500/15 text-green-600 border-l-4 border-green-500 w-full flex justify-between">
              <span>Completed</span><span>12</span>
            </span>
            <span className="rounded-full px-3 py-1 text-xs font-semibold bg-gray-500/15 text-gray-600 border-l-4 border-gray-500 w-full flex justify-between">
              <span>Closed</span><span>8</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
