import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Briefcase, FileText, CalendarDays, Zap, Scale } from 'lucide-react';
import { selectUser } from '../../store/slices/authSlice';

const heroCase = {
  title: 'Desai Property Dispute',
  caseNumber: 'LD-2024-0044',
  type: 'Property',
  status: 'hearing_soon',
  nextHearing: '2024-12-22',
  lawyerNote: 'Please bring all original property documents to the next hearing. I will be presenting Exhibit C to the court.',
  assignedLawyers: ['Adv. Priya Mehta', 'Adv. Suresh Nair'],
};

const quickLinks = [
  { label: 'My Cases',        icon: Briefcase,   path: '/client/cases',         desc: 'View all your active cases' },
  { label: 'Book Appointment',icon: CalendarDays, path: '/client/appointments',  desc: 'Schedule time with your lawyer' },
  { label: 'My Documents',    icon: FileText,     path: '/client/documents',     desc: 'Access shared documents' },
];

const STATUS_STYLES = {
  active:       'bg-blue-500/15 text-blue-600 border-blue-500',
  urgent:       'bg-red-500/15 text-red-600 border-red-500',
  hearing_soon: 'bg-amber-500/15 text-amber-600 border-amber-500',
  completed:    'bg-green-500/15 text-green-600 border-green-500',
  closed:       'bg-gray-500/15 text-gray-600 border-gray-500',
};

const STATUS_LABELS = {
  active: 'Active',
  urgent: 'Urgent',
  hearing_soon: 'Hearing Soon',
  completed: 'Completed',
  closed: 'Closed',
};

export default function ClientDashboard() {
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  const daysUntilHearing = Math.ceil((new Date(heroCase.nextHearing) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Welcome back, {user?.name}</h1>
        <p className="text-sm text-[#94A3B8] mt-1">Here's the latest on your case.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">{heroCase.title}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="font-mono text-xs text-[#94A3B8]">{heroCase.caseNumber}</span>
              <span className="text-xs bg-[#EFF6FF] text-[#1D4ED8] px-2 py-0.5 rounded font-medium">{heroCase.type}</span>
            </div>
          </div>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border-l-4 ${STATUS_STYLES[heroCase.status]}`}>
            {STATUS_LABELS[heroCase.status]}
          </span>
        </div>

        <div className="border-t border-[#E2E8F0] my-4" />

        <div>
          <div className="text-[10px] uppercase tracking-widest text-[#94A3B8] mb-1">NEXT HEARING</div>
          <div className="flex items-end gap-3">
            <div className="text-2xl font-bold text-[#0F172A]">
              {new Date(heroCase.nextHearing).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            {daysUntilHearing <= 3 ? (
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                className="bg-amber-500/15 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1 mb-1"
              >
                <Zap size={12} />
                In {daysUntilHearing} days
              </motion.div>
            ) : (
              <div className="bg-blue-500/15 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1 mb-1">
                <CalendarDays size={12} />
                In {daysUntilHearing} days
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-[#E2E8F0] my-4" />

        <div>
          <div className="text-[10px] uppercase tracking-widest text-[#94A3B8]">MESSAGE FROM YOUR LAWYER</div>
          <div className="bg-[#F8FAFC] border-l-4 border-[#1D4ED8] rounded-r-lg p-3 mt-1">
            <div className="text-sm text-[#0F172A] italic">{heroCase.lawyerNote}</div>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#64748B] mt-3">
            <Scale size={12} className="text-[#1D4ED8]" />
            Handled by: {heroCase.assignedLawyers.join(', ')}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        {quickLinks.map((link, idx) => {
          const Icon = link.icon;
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.09)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => navigate(link.path)}
              className="bg-white border border-[#E2E8F0] rounded-xl p-4 cursor-pointer flex items-start gap-3"
            >
              <div className="rounded-lg p-2 bg-[#EFF6FF] shrink-0">
                <Icon size={18} className="text-[#1D4ED8]" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#0F172A]">{link.label}</div>
                <div className="text-xs text-[#64748B] mt-0.5">{link.desc}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
