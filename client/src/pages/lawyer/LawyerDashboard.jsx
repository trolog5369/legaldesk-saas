import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, MapPin, User, CalendarX2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAppointments } from '../../store/appointmentSlice';
import SkeletonLoader from '../../components/ui/SkeletonLoader';

const cases = [
  { id: 1, title: 'Sharma vs. State of Maharashtra', caseNumber: 'LD-2024-0023', status: 'urgent',       client: 'Rajesh Sharma',   nextHearing: '2024-12-18', documentsPending: true  },
  { id: 2, title: 'Patel Property Dispute',           caseNumber: 'LD-2024-0031', status: 'hearing_soon', client: 'Meena Patel',     nextHearing: '2024-12-22', documentsPending: false },
  { id: 3, title: 'Desai Family Settlement',          caseNumber: 'LD-2024-0044', status: 'active',       client: 'Vikram Desai',    nextHearing: '2025-01-10', documentsPending: false },
  { id: 4, title: 'TechCorp NDA Review',              caseNumber: 'LD-2024-0052', status: 'active',       client: 'TechCorp Pvt Ltd',nextHearing: '2025-01-15', documentsPending: true  },
  { id: 5, title: 'Kulkarni Divorce Petition',        caseNumber: 'LD-2024-0058', status: 'completed',    client: 'Asha Kulkarni',   nextHearing: null,         documentsPending: false },
];

const STATUS_STYLES = {
  active:       'bg-[#EFF6FF] text-[#1D4ED8] border-[#1D4ED8]',
  urgent:       'bg-[#FEF2F2] text-[#EF4444] border-[#EF4444]',
  hearing_soon: 'bg-[#FEF3C7] text-[#F59E0B] border-[#F59E0B]',
  completed:    'bg-[#F0FDF4] text-[#22C55E] border-[#22C55E]',
  closed:       'bg-[#F3F4F6] text-[#6B7280] border-[#6B7280]',
};

const STATUS_LABELS = {
  active: 'Active',
  urgent: 'Urgent',
  hearing_soon: 'Hearing Soon',
  completed: 'Completed',
  closed: 'Closed',
};

const TYPE_COLORS = {
  court_appearance: { bg: '#FEE2E2', text: '#991B1B' },
  client_meeting: { bg: '#DBEAFE', text: '#1E40AF' },
  document_review: { bg: '#EDE9FE', text: '#5B21B6' },
  other: { bg: '#F1F5F9', text: '#475569' }
};

export default function LawyerDashboard() {
  const dispatch = useDispatch();
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  const { items: appointments, status: apptStatus } = useSelector(state => state.appointment);
  const caseStatus = useSelector(state => state.case?.status || 'succeeded');

  useEffect(() => {
    if (apptStatus === 'idle') {
      dispatch(fetchAppointments());
    }
  }, [dispatch, apptStatus]);

  const visibleCases = selectedFilter === 'all' ? cases : cases.filter(c => c.status === selectedFilter);

  const formattedDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const today = new Date();
  today.setHours(0,0,0,0);
  
  const upcomingEvents = [...appointments]
    .filter(a => new Date(a.start) >= today && a.status === 'scheduled')
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">My Dashboard</h1>
        <p className="text-sm text-[#64748B] mt-1">Today is {formattedDate}.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel — Upcoming Appointments / Hearings List Widget */}
        <div className="col-span-1 bg-white border border-[#E2E8F0] rounded-xl p-5 h-fit shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays size={18} className="text-[#1D4ED8]" />
            <h2 className="text-[16px] font-semibold text-[#0F172A]">Upcoming Events</h2>
          </div>

          <div className="space-y-0">
            {apptStatus === 'loading' ? (
              <SkeletonLoader variant="list" />
            ) : upcomingEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <CalendarX2 size={40} className="text-[#94A3B8] mb-3" />
                <p className="text-[13px] text-[#64748B]">No upcoming events</p>
              </div>
            ) : (
              upcomingEvents.map((event, idx) => {
                const isCourt = event.type === 'court_appearance';
                const dotColor = isCourt ? '#3B82F6' : '#22C55E';
                return (
                  <div key={event._id} className="relative flex py-3">
                    <div className="flex flex-col items-center mr-3 relative shrink-0 w-4">
                      <div className="w-2.5 h-2.5 rounded-full z-10" style={{ backgroundColor: dotColor, marginTop: '6px' }} />
                      {idx < upcomingEvents.length - 1 && (
                        <div className="absolute top-[16px] bottom-[-16px] w-[2px] bg-[#E2E8F0]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[14px] font-semibold text-[#0F172A] mb-0.5">{event.title}</h3>
                      <div className="text-[12px] text-[#64748B] mb-2">
                        {new Date(event.start).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })} · {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <span 
                        className="px-2 py-0.5 rounded text-[11px] font-medium inline-block"
                        style={{ backgroundColor: TYPE_COLORS[event.type]?.bg, color: TYPE_COLORS[event.type]?.text }}
                      >
                        {event.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel — Case Cards */}
        <div className="col-span-1 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-[#0F172A]">My Cases</h2>
            <div className="flex gap-2">
              {['all', 'active', 'urgent', 'hearing_soon'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-3 py-1.5 text-[12px] font-medium rounded-full transition-colors ${
                    selectedFilter === filter
                      ? 'bg-[#1D4ED8] text-white'
                      : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
                  }`}
                >
                  {filter === 'all' ? 'All' : STATUS_LABELS[filter]}
                </button>
              ))}
            </div>
          </div>

          {caseStatus === 'loading' ? (
            <SkeletonLoader variant="case-cards" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleCases.map(c => (
                <motion.div
                  key={c.id}
                  whileHover={{ y: -3, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="bg-white border border-[#E2E8F0] rounded-xl p-4 relative overflow-hidden cursor-pointer"
                >
                  {c.documentsPending && (
                    <div className="flex items-center gap-1.5 absolute top-4 right-4 bg-[#FEF2F2] px-2 py-1 rounded border border-[#EF4444]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                      <span className="text-[10px] text-[#EF4444] font-semibold">Docs Pending</span>
                    </div>
                  )}
                  
                  <h3 className="text-[14px] font-semibold text-[#0F172A] pr-20 mb-3">{c.title}</h3>

                  <div className="mb-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border-l-[3px] ${STATUS_STYLES[c.status]}`}>
                      {STATUS_LABELS[c.status]}
                    </span>
                  </div>

                  <div className="space-y-1.5 mt-auto">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[12px] text-[#94A3B8] font-medium">{c.caseNumber}</span>
                      <div className="flex items-center gap-1.5 text-[12px] text-[#64748B]">
                        <User size={13} />
                        {c.client}
                      </div>
                    </div>

                    {c.nextHearing && (
                      <div className="flex items-center gap-1.5 text-[12px] text-[#64748B] pt-0.5">
                        <CalendarDays size={13} />
                        {new Date(c.nextHearing).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
