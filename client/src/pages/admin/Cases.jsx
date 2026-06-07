import { useState, useEffect } from 'react';
import { Search, FileSearch, Loader2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import CreateCaseModal from '../../components/admin/CreateCaseModal';

// ── Status style map (Blueprint color tokens) ──────────────────────────
const STATUS_STYLES = {
  active: {
    bg: 'rgba(59,130,246,0.15)',
    text: '#3B82F6',
    border: '#3B82F6',
    label: 'Active',
  },
  urgent: {
    bg: 'rgba(239,68,68,0.15)',
    text: '#EF4444',
    border: '#EF4444',
    label: 'Urgent',
  },
  hearing_soon: {
    bg: 'rgba(245,158,11,0.15)',
    text: '#F59E0B',
    border: '#F59E0B',
    label: 'Hearing Soon',
  },
  completed: {
    bg: 'rgba(34,197,94,0.15)',
    text: '#22C55E',
    border: '#22C55E',
    label: 'Completed',
  },
  closed: {
    bg: 'rgba(107,114,128,0.15)',
    text: '#6B7280',
    border: '#6B7280',
    label: 'Closed',
  },
};

// ── Filter pills config ────────────────────────────────────────────────
const FILTER_PILLS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'urgent', label: 'Urgent' },
  { key: 'hearing_soon', label: 'Hearing Soon' },
  { key: 'completed', label: 'Completed' },
  { key: 'closed', label: 'Closed' },
];



// ── Helper: capitalize first letter ────────────────────────────────────
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ── Status Badge component ─────────────────────────────────────────────
function StatusBadge({ status }) {
  const style = STATUS_STYLES[status];
  if (!style) return null;

  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        borderLeft: `3px solid ${style.border}`,
      }}
    >
      {style.label}
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────────────────
export default function Cases() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await api.get('/cases');
        setCases(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load cases');
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  // Derived filtered list (not state)
  const filteredCases = cases.filter(c => {
    // Status filter
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    // Search filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      if (
        !c.title.toLowerCase().includes(q) &&
        !c.caseNumber.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold text-[#0F172A]">Case Ledger</h1>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-[14px] font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + New Case
        </button>
      </div>

      {/* ── Search Input ────────────────────────────────────── */}
      <div className="relative max-w-[400px]">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search by case title or number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm text-[#0F172A] bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
        />
      </div>

      {/* ── Filter Pills ────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTER_PILLS.map(pill => {
          const isActive = statusFilter === pill.key;
          return (
            <button
              key={pill.key}
              onClick={() => setStatusFilter(pill.key)}
              className={`px-3 py-1.5 text-[13px] font-medium rounded-full transition-colors ${
                isActive
                  ? 'bg-[#1D4ED8] text-white'
                  : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#CBD5E1]'
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* ── Data Table ──────────────────────────────────────── */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-[#1D4ED8] mb-3" />
            <p className="text-[14px] text-[#64748B]">Loading cases...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle size={40} className="text-[#EF4444] mb-3 opacity-70" />
            <p className="text-[14px] text-[#EF4444]">{error}</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#94A3B8]">
            <FileSearch size={40} className="mb-3 opacity-50" />
            <p className="text-[14px]">No cases match your search or filter.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                <th className="text-left px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-[#64748B]">Case No.</th>
                <th className="text-left px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-[#64748B]">Title</th>
                <th className="text-left px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-[#64748B]">Type</th>
                <th className="text-left px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-[#64748B]">Client</th>
                <th className="text-left px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-[#64748B]">Assigned Lawyers</th>
                <th className="text-left px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-[#64748B]">Status</th>
                <th className="text-left px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-[#64748B]">Next Hearing</th>
                <th className="text-left px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-[#64748B]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map(c => (
                <tr
                  key={c._id}
                  className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors"
                  style={{ height: '48px' }}
                >
                  <td className="px-4 py-2 font-mono text-[13px] text-[#64748B] whitespace-nowrap">
                    {c.caseNumber}
                  </td>
                  <td className="px-4 py-2 text-[14px] font-medium text-[#0F172A]">
                    {c.title}
                  </td>
                  <td className="px-4 py-2 text-[13px] text-[#64748B]">
                    {capitalize(c.caseType)}
                  </td>
                  <td className="px-4 py-2 text-[14px] text-[#0F172A]">
                    {c.client?.name}
                  </td>
                  <td className="px-4 py-2 text-[13px] text-[#64748B] max-w-[180px] truncate">
                    {c.lawyers?.map(l => l.name).join(', ')}
                  </td>
                  <td className="px-4 py-2">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-2 text-[13px] text-[#64748B] whitespace-nowrap">
                    {c.nextHearing ? new Date(c.nextHearing).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => console.log(c._id)}
                      className="text-[14px] text-[#1D4ED8] hover:underline font-medium bg-transparent border-none cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Create Case Modal ───────────────────────────────── */}
      <CreateCaseModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
