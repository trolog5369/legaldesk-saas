import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MoreHorizontal,
  AlertCircle,
  LayoutDashboard,
  FolderOpen,
  Sparkles,
  Receipt,
  Info,
  Calendar,
  FileText,
  FileType,
  Image,
  Upload,
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react';

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

// ── File-type icon map ─────────────────────────────────────────────────
const FILE_TYPE_ICONS = {
  pdf: { icon: FileText, color: '#EF4444' },
  docx: { icon: FileType, color: '#1D4ED8' },
  image: { icon: Image, color: '#22C55E' },
};

// ── Mock Data — Case ───────────────────────────────────────────────────
const MOCK_CASE = {
  _id: 'case-042',
  caseNumber: 'LD-2024-0042',
  title: 'Kapoor vs. State of Maharashtra — Criminal Appeal',
  description:
    'Appeal filed against the Sessions Court order dated 12 March 2024 in connection with FIR No. 187/2023. The appellant challenges the conviction on grounds of insufficient evidence and procedural irregularities during investigation.',
  caseType: 'criminal',
  status: 'active',
  court: 'Bombay High Court',
  judge: 'Hon. Justice R.K. Deshpande',
  filingDate: '2024-03-18T00:00:00.000Z',
  nextHearing: '2024-08-15T00:00:00.000Z',
  documentsPending: true,
  client: {
    _id: 'cl-001',
    name: 'Rajesh Kapoor',
    email: 'rajesh.kapoor@gmail.com',
    phone: '+91 98765 43210',
  },
  lawyers: [
    { _id: 'lw-001', name: 'Adv. Priya Mehta', specialization: 'Criminal Defense' },
    { _id: 'lw-002', name: 'Adv. Rohan Das', specialization: 'Appellate Practice' },
  ],
  notes: 'Client granted bail on personal surety of ₹2,00,000. Next arguments on admissibility of electronic evidence.',
};

// ── Mock Data — Hearings (chronologically ascending) ───────────────────
const MOCK_HEARINGS = [
  {
    _id: 'hr-001',
    date: '2024-05-10T00:00:00.000Z',
    time: '10:30 AM',
    court: 'Bombay High Court',
    courtRoom: 'Court Room 12',
    judge: 'Hon. Justice R.K. Deshpande',
    type: 'hearing',
    preArgumentNotes: '',
    outcome: 'Prosecution witness cross-examined. Matter adjourned for further arguments.',
  },
  {
    _id: 'hr-002',
    date: '2024-08-15T00:00:00.000Z',
    time: '11:00 AM',
    court: 'Bombay High Court',
    courtRoom: 'Court Room 12',
    judge: 'Hon. Justice R.K. Deshpande',
    type: 'arguments',
    preArgumentNotes: 'Focus on challenging the admissibility of CCTV footage under Section 65B of the Evidence Act. Prepare rebuttal to prosecution reliance on circumstantial chain.',
    outcome: '',
  },
  {
    _id: 'hr-003',
    date: '2024-11-20T00:00:00.000Z',
    time: '2:00 PM',
    court: 'Bombay High Court',
    courtRoom: 'Court Room 12',
    judge: 'Hon. Justice R.K. Deshpande',
    type: 'judgment',
    preArgumentNotes: '',
    outcome: '',
  },
];

// ── Mock Data — Documents ──────────────────────────────────────────────
const MOCK_DOCUMENTS = [
  {
    _id: 'doc-001',
    name: 'Criminal Appeal Petition.pdf',
    description: 'Primary appeal petition filed with Bombay High Court',
    fileType: 'pdf',
    fileSize: 2450000,
    isSharedWithClient: true,
    uploadedBy: { name: 'Adv. Priya Mehta' },
    createdAt: '2024-03-18T10:30:00.000Z',
    isDeleted: false,
  },
  {
    _id: 'doc-002',
    name: 'Witness Deposition — Prosecution.docx',
    description: 'Transcribed deposition of prosecution witnesses from Sessions Court',
    fileType: 'docx',
    fileSize: 890000,
    isSharedWithClient: false,
    uploadedBy: { name: 'Adv. Rohan Das' },
    createdAt: '2024-04-22T14:15:00.000Z',
    isDeleted: false,
  },
  {
    _id: 'doc-003',
    name: 'CCTV Footage Screenshot.png',
    description: 'Key frame capture from disputed CCTV evidence',
    fileType: 'image',
    fileSize: 3750000,
    isSharedWithClient: false,
    uploadedBy: { name: 'Adv. Priya Mehta' },
    createdAt: '2024-05-05T09:00:00.000Z',
    isDeleted: false,
  },
];

// ── Helpers ────────────────────────────────────────────────────────────
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatFileSize(bytes) {
  if (bytes < 1000000) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

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

// ── Hearing node color logic ───────────────────────────────────────────
function getHearingNodeColor(dateStr, index, total) {
  const hearingDate = new Date(dateStr);
  const now = new Date();
  if (hearingDate < now) return '#22C55E'; // past — green
  // Find first future hearing
  const isFirstFuture =
    hearingDate >= now &&
    (index === 0 || new Date(MOCK_HEARINGS[index - 1]?.date) < now);
  if (isFirstFuture) return '#F59E0B'; // upcoming — amber
  return '#3B82F6'; // further future — blue
}

function isPastHearing(dateStr) {
  return new Date(dateStr) < new Date();
}

// ════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════
export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [documents, setDocuments] = useState([...MOCK_DOCUMENTS]);

  // Tab config (UI-level, inside component)
  const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'documents', label: 'Documents', icon: FolderOpen },
    { id: 'ai', label: 'AI Analysis', icon: Sparkles },
    { id: 'billing', label: 'Expenses & Billing', icon: Receipt },
  ];

  // Document interactions
  const toggleShared = (docId) => {
    setDocuments(prev =>
      prev.map(d =>
        d._id === docId ? { ...d, isSharedWithClient: !d.isSharedWithClient } : d
      )
    );
  };

  const softDelete = (docId) => {
    setDocuments(prev =>
      prev.map(d => (d._id === docId ? { ...d, isDeleted: true } : d))
    );
  };

  const visibleDocs = documents.filter(d => !d.isDeleted);

  // ── Tab panel animation tokens ───────────────────────────────────────
  const panelTransition = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.2, ease: 'easeOut' },
  };

  // ════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-0">
      {/* ── Case Header Bar ───────────────────────────────────────── */}
      <div className="border-b border-[#E2E8F0] pb-4 mb-0">
        {/* Back nav + breadcrumb */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1 rounded-md hover:bg-[#F1F5F9] transition-colors"
          >
            <ArrowLeft size={18} className="text-[#64748B]" />
          </button>
          <span className="text-[13px] text-[#64748B]">
            Cases / {MOCK_CASE.title}
          </span>
        </div>

        {/* Title row */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[24px] font-bold text-[#0F172A]">{MOCK_CASE.title}</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="font-mono text-[13px] text-[#64748B]">
                {MOCK_CASE.caseNumber}
              </span>
              <StatusBadge status={MOCK_CASE.status} />
              {MOCK_CASE.documentsPending && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap"
                  style={{
                    backgroundColor: 'rgba(239,68,68,0.15)',
                    color: '#EF4444',
                    borderLeft: '3px solid #EF4444',
                  }}
                >
                  <AlertCircle size={12} />
                  Documents Pending
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => console.log('case options')}
            className="p-2 rounded-md hover:bg-[#F1F5F9] text-[#64748B] transition-colors"
          >
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* ── Tab Bar ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 border-b border-[#E2E8F0] -mt-px">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 cursor-pointer transition-colors ${
                isActive
                  ? 'text-[#1D4ED8] font-semibold border-b-2 border-[#1D4ED8]'
                  : 'text-[#64748B] font-normal hover:text-[#0F172A]'
              }`}
              style={{ fontSize: '14px' }}
            >
              <Icon size={16} />
              {tab.label}
            </div>
          );
        })}
      </div>

      {/* ── Tab Content ───────────────────────────────────────────── */}
      <div className="pt-5">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" {...panelTransition}>
              <OverviewTab />
            </motion.div>
          )}
          {activeTab === 'documents' && (
            <motion.div key="documents" {...panelTransition}>
              <DocumentsTab
                documents={documents}
                visibleDocs={visibleDocs}
                toggleShared={toggleShared}
                softDelete={softDelete}
              />
            </motion.div>
          )}
          {activeTab === 'ai' && (
            <motion.div key="ai" {...panelTransition}>
              <AITab />
            </motion.div>
          )}
          {activeTab === 'billing' && (
            <motion.div key="billing" {...panelTransition}>
              <BillingTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// TAB 1 — OVERVIEW
// ════════════════════════════════════════════════════════════════════════
function OverviewTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* ── Case Metadata Card ────────────────────────────────────── */}
      <div className="lg:col-span-1">
        <motion.div
          whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.10)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-5">
            <Info size={16} className="text-[#0F172A]" />
            <h3 className="text-[16px] font-semibold text-[#0F172A]">Case Information</h3>
          </div>

          <div className="space-y-3">
            <MetaRow label="Case Number">
              <span className="font-mono text-[14px] text-[#0F172A]">{MOCK_CASE.caseNumber}</span>
            </MetaRow>
            <MetaRow label="Case Type">
              <span className="text-[14px] text-[#0F172A]">{capitalize(MOCK_CASE.caseType)}</span>
            </MetaRow>
            <MetaRow label="Court">
              <span className="text-[14px] text-[#0F172A]">{MOCK_CASE.court}</span>
            </MetaRow>
            <MetaRow label="Judge">
              <span className="text-[14px] text-[#0F172A]">{MOCK_CASE.judge}</span>
            </MetaRow>
            <MetaRow label="Filing Date">
              <span className="text-[14px] text-[#0F172A]">{formatDate(MOCK_CASE.filingDate)}</span>
            </MetaRow>
            <MetaRow label="Next Hearing">
              <span className="text-[14px] text-[#0F172A]">{formatDate(MOCK_CASE.nextHearing)}</span>
            </MetaRow>
            <MetaRow label="Client Name">
              <span className="text-[14px] text-[#0F172A]">{MOCK_CASE.client.name}</span>
            </MetaRow>
            <MetaRow label="Client Phone">
              <span className="text-[14px] text-[#0F172A]">{MOCK_CASE.client.phone}</span>
            </MetaRow>
            <MetaRow label="Assigned Lawyers">
              <div className="flex flex-wrap gap-1.5">
                {MOCK_CASE.lawyers.map(l => (
                  <span
                    key={l._id}
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-medium bg-[#EFF6FF] text-[#1D4ED8]"
                  >
                    {l.name}
                  </span>
                ))}
              </div>
            </MetaRow>
          </div>
        </motion.div>
      </div>

      {/* ── Hearing Timeline ──────────────────────────────────────── */}
      <div className="lg:col-span-2">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#0F172A]" />
              <h3 className="text-[16px] font-semibold text-[#0F172A]">Hearing Timeline</h3>
            </div>
            <button
              onClick={() => console.log('add hearing')}
              className="text-[13px] text-[#1D4ED8] hover:underline font-medium bg-transparent border-none cursor-pointer"
            >
              + Add Hearing
            </button>
          </div>

          <div className="relative">
            {/* Vertical connector line */}
            <div
              className="absolute left-[9px] top-3 bottom-3 w-0.5 bg-[#E2E8F0]"
              aria-hidden="true"
            />

            <div className="space-y-4">
              {MOCK_HEARINGS.map((hearing, idx) => {
                const nodeColor = getHearingNodeColor(hearing.date, idx, MOCK_HEARINGS.length);
                const past = isPastHearing(hearing.date);

                return (
                  <div key={hearing._id} className="relative pl-8">
                    {/* Node circle */}
                    <div
                      className="absolute left-0 top-1 w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center"
                      style={{
                        borderColor: nodeColor,
                        backgroundColor: past ? nodeColor : '#FFFFFF',
                      }}
                    >
                      {past && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>

                    {/* Content */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-[#0F172A]">
                          {formatDate(hearing.date)}
                        </span>
                        <span className="text-[12px] text-[#64748B]">{hearing.time}</span>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[13px] text-[#64748B]">
                          {hearing.court} — {hearing.courtRoom}
                        </span>
                        <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[12px] bg-[#F1F5F9] text-[#64748B]">
                          {capitalize(hearing.type)}
                        </span>
                      </div>

                      {hearing.preArgumentNotes && (
                        <div className="flex items-start gap-1.5 mt-1.5">
                          <FileText size={12} className="text-[#64748B] mt-0.5 flex-shrink-0" />
                          <span className="text-[13px] italic text-[#64748B]">
                            {hearing.preArgumentNotes}
                          </span>
                        </div>
                      )}

                      {hearing.outcome && (
                        <div className="mt-1.5">
                          <span className="text-[12px] font-semibold text-[#94A3B8]">Outcome: </span>
                          <span className="text-[13px] text-[#22C55E]">{hearing.outcome}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-0">
      <span className="text-[12px] font-medium uppercase tracking-wide text-[#94A3B8] sm:w-[140px] flex-shrink-0">
        {label}
      </span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// TAB 2 — DOCUMENTS
// ════════════════════════════════════════════════════════════════════════
function DocumentsTab({ documents, visibleDocs, toggleShared, softDelete }) {
  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen size={20} className="text-[#0F172A]" />
          <h2 className="text-[18px] font-semibold text-[#0F172A]">Document Vault</h2>
        </div>
        <button
          onClick={() => console.log('upload document')}
          className="inline-flex items-center gap-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-[14px] font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Upload size={14} />
          Upload Document
        </button>
      </div>

      {/* Document table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
        {visibleDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <FolderOpen size={40} className="text-[#E2E8F0] mb-3" />
            <p className="text-[14px] text-[#94A3B8]">No documents uploaded yet.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th className="text-left px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-[#94A3B8]" style={{ width: '40%' }}>File</th>
                <th className="text-left px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-[#94A3B8]">Size</th>
                <th className="text-left px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-[#94A3B8]">Uploaded</th>
                <th className="text-left px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-[#94A3B8]">Shared with Client</th>
                <th className="text-left px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-[#94A3B8]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleDocs.map((doc, idx) => {
                const ftConfig = FILE_TYPE_ICONS[doc.fileType] || FILE_TYPE_ICONS.pdf;
                const FtIcon = ftConfig.icon;

                return (
                  <tr
                    key={doc._id}
                    className={`hover:bg-[#F8FAFC] transition-colors ${
                      idx < visibleDocs.length - 1 ? 'border-b border-[#F1F5F9]' : ''
                    }`}
                    style={{ minHeight: '48px' }}
                  >
                    {/* File */}
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2.5">
                        <FtIcon size={20} style={{ color: ftConfig.color }} className="mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-[14px] font-medium text-[#0F172A]">{doc.name}</div>
                          <div className="text-[12px] text-[#94A3B8] mt-0.5">{doc.description}</div>
                        </div>
                      </div>
                    </td>

                    {/* Size */}
                    <td className="px-4 py-3 text-[13px] text-[#64748B] whitespace-nowrap">
                      {formatFileSize(doc.fileSize)}
                    </td>

                    {/* Uploaded */}
                    <td className="px-4 py-3">
                      <div className="text-[13px] text-[#64748B]">{formatDate(doc.createdAt)}</div>
                      <div className="text-[12px] text-[#94A3B8] mt-0.5">by {doc.uploadedBy.name}</div>
                    </td>

                    {/* Shared toggle */}
                    <td className="px-4 py-3">
                      <div
                        onClick={() => toggleShared(doc._id)}
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[13px] font-medium cursor-pointer transition-colors ${
                          doc.isSharedWithClient
                            ? 'bg-[#22C55E] text-white'
                            : 'bg-[#F1F5F9] text-[#64748B]'
                        }`}
                      >
                        {doc.isSharedWithClient ? <Eye size={12} /> : <EyeOff size={12} />}
                        {doc.isSharedWithClient ? 'Shared' : 'Private'}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => softDelete(doc._id)}
                        className="text-[#EF4444] opacity-60 hover:opacity-100 cursor-pointer transition-opacity bg-transparent border-none p-1"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// TAB 3 — AI ANALYSIS (Placeholder)
// ════════════════════════════════════════════════════════════════════════
function AITab() {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 flex flex-col items-center justify-center text-center">
      <Sparkles size={48} className="text-[#1D4ED8] mb-4" />
      <h2 className="text-[18px] font-semibold text-[#0F172A] mb-2">AI Engine & Chat</h2>
      <p className="text-[14px] text-[#64748B] max-w-sm mb-6">
        Document analysis, risk flagging, and case-specific AI chat are coming in Week 3.
      </p>
      <button
        disabled
        className="inline-flex items-center gap-1.5 bg-[#1D4ED8] text-white text-[14px] font-medium px-4 py-2 rounded-lg opacity-40 cursor-not-allowed"
      >
        Analyze Document
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// TAB 4 — EXPENSES & BILLING (Placeholder)
// ════════════════════════════════════════════════════════════════════════
function BillingTab() {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 flex flex-col items-center justify-center text-center">
      <Receipt size={48} className="text-[#1D4ED8] mb-4" />
      <h2 className="text-[18px] font-semibold text-[#0F172A] mb-2">Expenses & Billing</h2>
      <p className="text-[14px] text-[#64748B] max-w-sm mb-6">
        Expense logging, invoice generation, and PDF export are coming in Week 4.
      </p>
      <button
        disabled
        className="inline-flex items-center gap-1.5 bg-[#1D4ED8] text-white text-[14px] font-medium px-4 py-2 rounded-lg opacity-40 cursor-not-allowed"
      >
        Log Expense
      </button>
    </div>
  );
}
