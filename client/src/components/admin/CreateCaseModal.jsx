import { useState, useEffect } from 'react';
import { X, Check, Loader2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

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

export default function CreateCaseModal({ isOpen, onClose, onCaseCreated }) {
  const [formData, setFormData] = useState({ ...initialFormData });
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Live data from API
  const [clients, setClients] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState(null);

  // Fetch clients + lawyers when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setLoadingData(true);
      setDataError(null);
      try {
        const [clientsRes, lawyersRes] = await Promise.all([
          api.get('/admin/clients'),
          api.get('/admin/lawyers'),
        ]);
        setClients(clientsRes.data.clients || []);
        setLawyers(lawyersRes.data.lawyers || []);
      } catch (err) {
        setDataError(err.response?.data?.message || 'Failed to load clients and lawyers');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [isOpen]);

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

  const handleSubmit = async () => {
    setHasAttemptedSubmit(true);
    setSubmitError(null);

    const isValid =
      formData.title.trim() !== '' &&
      formData.caseType !== '' &&
      formData.clientId !== '' &&
      formData.assignedLawyers.length >= 1;

    if (!isValid) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        caseType: formData.caseType,
        client: formData.clientId,
        lawyers: formData.assignedLawyers,
        court: formData.court || undefined,
        nextHearing: formData.firstHearing || undefined,
        description: formData.description || undefined,
      };

      const res = await api.post('/cases', payload);

      // Notify parent to refresh the cases list
      if (onCaseCreated) onCaseCreated(res.data.data);

      // Reset and close
      setFormData({ ...initialFormData });
      setHasAttemptedSubmit(false);
      onClose();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to create case. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setFormData({ ...initialFormData });
    setHasAttemptedSubmit(false);
    setSubmitError(null);
    onClose();
  };

  const labelClasses = 'block text-[13px] font-medium text-[#0F172A] mb-1';
  const inputClasses =
    'w-full border border-[#E2E8F0] rounded-md px-3 py-2 text-sm text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <h2 className="text-[18px] font-semibold text-[#0F172A]">New Case</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-[#94A3B8] hover:text-[#0F172A] transition-colors p-1 rounded-md hover:bg-[#F1F5F9] disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Data loading error */}
          {dataError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
              <AlertCircle size={16} className="flex-shrink-0" />
              {dataError}
            </div>
          )}

          {/* Submit error */}
          {submitError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
              <AlertCircle size={16} className="flex-shrink-0" />
              {submitError}
            </div>
          )}

          {/* Row 1: Title */}
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
            {hasAttemptedSubmit && !formData.title.trim() && (
              <p className="text-[12px] text-[#EF4444] mt-1">Case title is required</p>
            )}
          </div>

          {/* Row 2: Case Type + Client */}
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
              {hasAttemptedSubmit && !formData.caseType && (
                <p className="text-[12px] text-[#EF4444] mt-1">Case type is required</p>
              )}
            </div>

            <div>
              <label className={labelClasses}>
                Client <span className="text-[#EF4444]">*</span>
              </label>
              {loadingData ? (
                <div className="flex items-center gap-2 h-[38px] px-3 border border-[#E2E8F0] rounded-md text-sm text-[#94A3B8]">
                  <Loader2 size={14} className="animate-spin" /> Loading clients...
                </div>
              ) : (
                <select
                  className={inputClasses}
                  value={formData.clientId}
                  onChange={(e) => updateField('clientId', e.target.value)}
                >
                  <option value="">Select client...</option>
                  {clients.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              )}
              {hasAttemptedSubmit && !formData.clientId && (
                <p className="text-[12px] text-[#EF4444] mt-1">Client is required</p>
              )}
            </div>
          </div>

          {/* Row 3: Court + First Hearing Date */}
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

          {/* Row 4: Description */}
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

          {/* Row 5: Assign Lawyers */}
          <div>
            <label className={labelClasses}>
              Assign Lawyers <span className="text-[#EF4444]">*</span>
            </label>
            {loadingData ? (
              <div className="flex items-center gap-2 py-3 text-sm text-[#94A3B8]">
                <Loader2 size={14} className="animate-spin" /> Loading lawyers...
              </div>
            ) : (
              <div className="space-y-2 mt-1 max-h-[180px] overflow-y-auto pr-1">
                {lawyers.length === 0 ? (
                  <p className="text-sm text-[#94A3B8]">No lawyers found.</p>
                ) : (
                  lawyers.map(lawyer => {
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
                          {lawyer.specialization && (
                            <span className={`text-xs ml-2 ${isSelected ? 'text-[#1D4ED8]/70' : 'text-[#64748B]'}`}>
                              {lawyer.specialization}
                            </span>
                          )}
                        </div>
                        {isSelected && <Check size={14} className="text-[#1D4ED8] flex-shrink-0" />}
                      </div>
                    );
                  })
                )}
              </div>
            )}
            {formData.assignedLawyers.length > 0 ? (
              <p className="text-[12px] text-[#64748B] mt-1.5">
                {formData.assignedLawyers.length} lawyer(s) selected
              </p>
            ) : hasAttemptedSubmit ? (
              <p className="text-[12px] text-[#EF4444] mt-1.5">At least 1 lawyer required</p>
            ) : (
              <p className="text-[12px] text-[#64748B] mt-1.5">0 lawyer(s) selected</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E2E8F0]">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-[#64748B] hover:text-[#0F172A] transition-colors rounded-lg hover:bg-[#F1F5F9] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || loadingData}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            {isSubmitting ? 'Creating...' : 'Create Case'}
          </button>
        </div>
      </div>
    </div>
  );
}
