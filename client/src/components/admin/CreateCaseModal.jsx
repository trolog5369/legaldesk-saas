import { useState } from 'react';
import { X, Check } from 'lucide-react';

const MOCK_CLIENTS = [
  { _id: 'cl-001', name: 'Rajesh Kapoor', email: 'rajesh.kapoor@gmail.com' },
  { _id: 'cl-002', name: 'Sneha Iyer', email: 'sneha.iyer@outlook.com' },
  { _id: 'cl-003', name: 'Amit Sharma', email: 'amit.sharma@yahoo.com' },
];

const MOCK_LAWYERS = [
  { _id: 'lw-001', name: 'Adv. Priya Mehta', specialization: 'Civil Litigation' },
  { _id: 'lw-002', name: 'Adv. Rohan Das', specialization: 'Criminal Defense' },
  { _id: 'lw-003', name: 'Adv. Kavita Nair', specialization: 'Family Law' },
  { _id: 'lw-004', name: 'Adv. Sunil Reddy', specialization: 'Corporate Law' },
];

const CASE_TYPES = [
  { value: 'civil', label: 'Civil' },
  { value: 'criminal', label: 'Criminal' },
  { value: 'family', label: 'Family' },
  { value: 'property', label: 'Property' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'other', label: 'Other' },
];

const initialFormData = {
  title: '',
  caseType: '',
  clientId: '',
  court: '',
  firstHearing: '',
  description: '',
  assignedLawyers: [],
};

export default function CreateCaseModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({ ...initialFormData });
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  if (!isOpen) return null;

  const updateField = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const toggleLawyer = (lawyerId) => {
    setFormData(prev => {
      const current = prev.assignedLawyers;
      const next = current.includes(lawyerId)
        ? current.filter(id => id !== lawyerId)
        : [...current, lawyerId];
      return { ...prev, assignedLawyers: next };
    });
  };

  const handleSubmit = () => {
    setHasAttemptedSubmit(true);

    const isValid =
      formData.title.trim() !== '' &&
      formData.caseType !== '' &&
      formData.clientId !== '' &&
      formData.assignedLawyers.length >= 1;

    if (!isValid) return;

    const newCasePayload = {
      title: formData.title,
      caseType: formData.caseType,
      clientId: formData.clientId,
      court: formData.court,
      firstHearing: formData.firstHearing,
      description: formData.description,
      assignedLawyers: formData.assignedLawyers,
      createdAt: new Date().toISOString(),
    };

    console.log('NEW CASE PAYLOAD:', newCasePayload);
    setFormData({ ...initialFormData });
    setHasAttemptedSubmit(false);
    onClose();
  };

  const handleBackdropClick = () => {
    onClose();
  };

  const handlePanelClick = (e) => {
    e.stopPropagation();
  };

  const labelClasses = 'block text-[13px] font-medium text-[#0F172A] mb-1';
  const inputClasses =
    'w-full border border-[#E2E8F0] rounded-md px-3 py-2 text-sm text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={handlePanelClick}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <h2 className="text-[18px] font-semibold text-[#0F172A]">New Case</h2>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#0F172A] transition-colors p-1 rounded-md hover:bg-[#F1F5F9]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Row 1: Title (full width) */}
          <div>
            <label className={labelClasses}>
              Case Title <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              className={inputClasses}
              placeholder="e.g. Kapoor vs. State of Maharashtra"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
            />
          </div>

          {/* Row 2: Case Type + Client (two-column) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>
                Case Type <span className="text-[#EF4444]">*</span>
              </label>
              <select
                className={inputClasses}
                value={formData.caseType}
                onChange={(e) => updateField('caseType', e.target.value)}
              >
                <option value="">Select type...</option>
                {CASE_TYPES.map(ct => (
                  <option key={ct.value} value={ct.value}>{ct.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClasses}>
                Client <span className="text-[#EF4444]">*</span>
              </label>
              <select
                className={inputClasses}
                value={formData.clientId}
                onChange={(e) => updateField('clientId', e.target.value)}
              >
                <option value="">Select client...</option>
                {MOCK_CLIENTS.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Court + First Hearing Date (two-column) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Court</label>
              <input
                type="text"
                className={inputClasses}
                placeholder="e.g. Bombay High Court"
                value={formData.court}
                onChange={(e) => updateField('court', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClasses}>First Hearing Date</label>
              <input
                type="date"
                className={inputClasses}
                value={formData.firstHearing}
                onChange={(e) => updateField('firstHearing', e.target.value)}
              />
            </div>
          </div>

          {/* Row 4: Description (full width) */}
          <div>
            <label className={labelClasses}>Description</label>
            <textarea
              rows={3}
              className={inputClasses + ' resize-none'}
              placeholder="Brief description of the case..."
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
            />
          </div>

          {/* Row 5: Assign Lawyers (multi-select cluster) */}
          <div>
            <label className={labelClasses}>
              Assign Lawyers <span className="text-[#EF4444]">*</span>
            </label>
            <div className="space-y-2 mt-1">
              {MOCK_LAWYERS.map(lawyer => {
                const isSelected = formData.assignedLawyers.includes(lawyer._id);
                return (
                  <div
                    key={lawyer._id}
                    onClick={() => toggleLawyer(lawyer._id)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-md border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#EFF6FF] border-[#1D4ED8] text-[#1D4ED8]'
                        : 'bg-white border-[#E2E8F0] text-[#0F172A] hover:border-[#CBD5E1]'
                    }`}
                  >
                    <div>
                      <span className="text-sm font-medium">{lawyer.name}</span>
                      <span className={`text-xs ml-2 ${isSelected ? 'text-[#1D4ED8]/70' : 'text-[#64748B]'}`}>
                        {lawyer.specialization}
                      </span>
                    </div>
                    {isSelected && <Check size={14} className="text-[#1D4ED8] flex-shrink-0" />}
                  </div>
                );
              })}
            </div>
            {/* Counter / Error */}
            {formData.assignedLawyers.length > 0 ? (
              <p className="text-[12px] text-[#64748B] mt-1.5">
                {formData.assignedLawyers.length} lawyer(s) selected
              </p>
            ) : hasAttemptedSubmit ? (
              <p className="text-[12px] text-[#EF4444] mt-1.5">
                At least 1 lawyer required
              </p>
            ) : (
              <p className="text-[12px] text-[#64748B] mt-1.5">
                0 lawyer(s) selected
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E2E8F0]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#64748B] hover:text-[#0F172A] transition-colors rounded-lg hover:bg-[#F1F5F9]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg transition-colors"
          >
            Create Case
          </button>
        </div>
      </div>
    </div>
  );
}
