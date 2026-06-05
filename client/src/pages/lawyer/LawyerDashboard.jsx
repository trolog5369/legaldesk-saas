import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, MapPin, User } from 'lucide-react';

const todayHearings = [
  { caseTitle: 'Sharma vs. State of Maharashtra', court: 'Bombay HC — Court 12', time: '10:30 AM', caseNumber: 'LD-2024-0023', preArgNotes: 'Focus on Section 302 IPC arguments. Cite State vs. Ratan 2019 SC.' },
  { caseTitle: 'Patel Property Dispute',           court: 'Civil Court Pune — Room 4', time: '2:00 PM',  caseNumber: 'LD-2024-0031', preArgNotes: 'Present survey report Exhibit C. Witness cross-examination first.' },
];

const cases = [
  { id: 1, title: 'Sharma vs. State of Maharashtra', caseNumber: 'LD-2024-0023', status: 'urgent',       client: 'Rajesh Sharma',   nextHearing: '2024-12-18', documentsPending: true  },
  { id: 2, title: 'Patel Property Dispute',           caseNumber: 'LD-2024-0031', status: 'hearing_soon', client: 'Meena Patel',     nextHearing: '2024-12-22', documentsPending: false },
  { id: 3, title: 'Desai Family Settlement',          caseNumber: 'LD-2024-0044', status: 'active',       client: 'Vikram Desai',    nextHearing: '2025-01-10', documentsPending: false },
  { id: 4, title: 'TechCorp NDA Review',              caseNumber: 'LD-2024-0052', status: 'active',       client: 'TechCorp Pvt Ltd',nextHearing: '2025-01-15', documentsPending: true  },
  { id: 5, title: 'Kulkarni Divorce Petition',        caseNumber: 'LD-2024-0058', status: 'completed',    client: 'Asha Kulkarni',   nextHearing: null,         documentsPending: false },
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

export default function LawyerDashboard() {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const visibleCases = selectedFilter === 'all' ? cases : cases.filter(c => c.status === selectedFilter);

  const formattedDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">My Dashboard</h1>
        <p className="text-sm text-[#64748B] mt-1">Today is {formattedDate}. You have {todayHearings.length} hearings scheduled.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Panel — Today's Schedule */}
        <div className="col-span-1 bg-white border border-[#E2E8F0] rounded-xl p-5 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays size={16} className="text-[#1D4ED8]" />
            <h2 className="text-lg font-semibold text-[#0F172A]">Today's Schedule</h2>
          </div>

          <div className="space-y-0">
            {todayHearings.length === 0 ? (
              <div className="text-sm text-[#94A3B8] py-6 text-center">No hearings scheduled for today.</div>
            ) : (
              todayHearings.map((hearing, idx) => (
                <div key={idx}>
                  <div className="flex py-4">
                    <div className="w-1 rounded-full bg-[#1D4ED8] mr-3 self-stretch shrink-0" />
                    <div className="flex-1">
                      <div className="mb-1">
                        <span className="text-xs font-semibold text-[#1D4ED8] bg-[#EFF6FF] px-2 py-0.5 rounded inline-block mb-1">
                          {hearing.time}
                        </span>
                        <h3 className="text-sm font-semibold text-[#0F172A]">{hearing.caseTitle}</h3>
                        <p className="font-mono text-xs text-[#94A3B8] mt-0.5">{hearing.caseNumber}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#64748B] mt-1.5">
                        <MapPin size={12} />
                        <span>{hearing.court}</span>
                      </div>
                      {hearing.preArgNotes && (
                        <div className="mt-2">
                          <div className="text-[10px] uppercase tracking-widest text-[#94A3B8]">Pre-Argument Notes</div>
                          <div className="text-xs text-[#64748B] italic mt-0.5">{hearing.preArgNotes}</div>
                        </div>
                      )}
                    </div>
                  </div>
                  {idx < todayHearings.length - 1 && <div className="border-t border-[#E2E8F0]" />}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel — Case Cards */}
        <div className="col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#0F172A]">My Cases</h2>
            <div className="flex gap-2">
              {['all', 'active', 'urgent', 'hearing_soon'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
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

          <div className="grid grid-cols-2 gap-3">
            {visibleCases.map(c => (
              <motion.div
                key={c.id}
                whileHover={{ y: -3, boxShadow: '0 8px 30px rgba(0,0,0,0.10)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="bg-white border border-[#E2E8F0] rounded-xl p-4 relative overflow-hidden cursor-pointer"
              >
                {c.documentsPending && (
                  <div className="flex items-center gap-1 absolute top-3 right-3">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-[10px] text-red-500 font-medium">Docs Pending</span>
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-2 mt-1">
                  <h3 className="text-sm font-semibold text-[#0F172A] flex-1 pr-12">{c.title}</h3>
                </div>

                <div className="mb-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border-l-4 ${STATUS_STYLES[c.status]}`}>
                    {STATUS_LABELS[c.status]}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#94A3B8]">{c.caseNumber}</span>
                    <div className="flex items-center gap-1 text-xs text-[#64748B]">
                      <User size={12} />
                      {c.client}
                    </div>
                  </div>

                  {c.nextHearing && (
                    <div className="flex items-center gap-1 text-xs text-[#64748B] pt-1">
                      <CalendarDays size={12} />
                      {new Date(c.nextHearing).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
