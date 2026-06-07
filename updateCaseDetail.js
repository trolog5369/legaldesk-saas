const fs = require('fs');

const caseDetailPath = 'client/src/pages/lawyer/CaseDetail.jsx';
let content = fs.readFileSync(caseDetailPath, 'utf8');

// 1. Add imports
const newImports = `
import { useDispatch } from 'react-redux';
import { fetchExpensesByCase, logExpense, deleteExpense } from '../../store/expenseSlice';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { Clock, IndianRupee, ReceiptText, Trash2, X } from 'lucide-react';
`;

content = content.replace(
  "import { useSelector } from 'react-redux';",
  "import { useSelector, useDispatch } from 'react-redux';\nimport { fetchExpensesByCase, logExpense, deleteExpense } from '../../store/expenseSlice';\nimport { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';\nimport { Clock, IndianRupee, ReceiptText, Trash2, X } from 'lucide-react';"
);

// 2. Replace BillingTab placeholder
const billingTabPlaceholder = `// ════════════════════════════════════════════════════════════════════════
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
}`;

const newBillingTab = `// ════════════════════════════════════════════════════════════════════════
// TAB 4 — EXPENSES & BILLING
// ════════════════════════════════════════════════════════════════════════
function BillingTab() {
  const { id: caseId } = useParams();
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.expense);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (caseId) {
      dispatch(fetchExpensesByCase(caseId));
    }
  }, [dispatch, caseId]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseType, setExpenseType] = useState('billable_hours');
  const [amount, setAmount] = useState('');
  const [hoursLogged, setHoursLogged] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogExpense = async () => {
    setIsSubmitting(true);
    const payload = {
      caseId,
      type: expenseType,
      description,
      date,
    };
    if (expenseType === 'billable_hours') {
      payload.hoursLogged = parseFloat(hoursLogged);
    } else {
      payload.amount = parseFloat(amount);
    }
    
    await dispatch(logExpense(payload)).unwrap();
    setIsSubmitting(false);
    setIsModalOpen(false);
    setExpenseType('billable_hours');
    setAmount('');
    setHoursLogged('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const totalBillableHours = React.useMemo(() => {
    return items.filter(i => i.type === 'billable_hours').reduce((sum, i) => sum + (i.hoursLogged || 0), 0);
  }, [items]);

  const totalFlatFees = React.useMemo(() => {
    return items.filter(i => i.type !== 'billable_hours').reduce((sum, i) => sum + (i.amount || 0), 0);
  }, [items]);

  const totalOutstandingBalance = React.useMemo(() => {
    return items.reduce((sum, i) => sum + (i.amount || 0), 0);
  }, [items]);

  const getTypeBadge = (type) => {
    switch (type) {
      case 'billable_hours': return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#EFF6FF] text-[#1D4ED8]">Billable Hours</span>;
      case 'court_fees': return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#FEF3C7] text-[#92400E]">Court Fees</span>;
      case 'travel': return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#F0FDF4] text-[#166534]">Travel</span>;
      case 'filing': return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#F5F3FF] text-[#5B21B6]">Filing</span>;
      default: return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#F8FAFC] text-[#475569]">Other</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Section 1 — Financial Metrics Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[18px] font-semibold text-[#0F172A]">Financial Ledger</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#1D4ED8] text-white hover:bg-[#1E40AF] rounded-md px-4 py-2 text-[14px] font-medium transition-colors"
        >
          + Log Expense
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          whileHover={{ y: -4 }}
          style={{ transition: 'box-shadow 0.2s', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
          className="bg-white border border-[#E2E8F0] rounded-lg p-5 relative"
        >
          <Clock size={20} className="text-[#3B82F6] absolute top-5 right-5" />
          <p className="text-[13px] font-medium text-[#64748B] mb-1">Total Billable Hours</p>
          <p className="text-[24px] font-semibold text-[#0F172A]">{totalBillableHours.toFixed(1)} <span className="text-[16px] text-[#94A3B8] font-normal">hrs</span></p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          whileHover={{ y: -4 }}
          style={{ transition: 'box-shadow 0.2s', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
          className="bg-white border border-[#E2E8F0] rounded-lg p-5 relative"
        >
          <Receipt size={20} className="text-[#F59E0B] absolute top-5 right-5" />
          <p className="text-[13px] font-medium text-[#64748B] mb-1">Total Flat Fees</p>
          <p className="text-[24px] font-semibold text-[#0F172A]">₹ {totalFlatFees.toLocaleString('en-IN')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          whileHover={{ y: -4 }}
          style={{ transition: 'box-shadow 0.2s', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
          className="bg-white border border-[#E2E8F0] rounded-lg p-5 relative"
        >
          <IndianRupee size={20} className="text-[#1D4ED8] absolute top-5 right-5" />
          <p className="text-[13px] font-medium text-[#64748B] mb-1">Total Outstanding Balance</p>
          <p className="text-[24px] font-semibold text-[#1D4ED8]">₹ {totalOutstandingBalance.toLocaleString('en-IN')}</p>
        </motion.div>
      </div>

      {/* Section 2 — Interactive Ledger Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <th className="px-4 py-3 text-[12px] font-medium text-[#64748B] uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-[12px] font-medium text-[#64748B] uppercase tracking-wider">Logged By</th>
              <th className="px-4 py-3 text-[12px] font-medium text-[#64748B] uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-[12px] font-medium text-[#64748B] uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-[12px] font-medium text-[#64748B] uppercase tracking-wider">Amount (₹)</th>
              <th className="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {status === 'loading' ? (
              Array(3).fill(0).map((_, i) => (
                <tr key={i} className="border-b border-[#E2E8F0]">
                  <td className="px-4 py-4" colSpan="6">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                  </td>
                </tr>
              ))
            ) : items.length === 0 && status === 'succeeded' ? (
              <tr>
                <td colSpan="6" className="py-16 text-center">
                  <ReceiptText size={48} className="text-[#94A3B8] mx-auto mb-3" />
                  <p className="text-[14px] text-[#64748B]">No expenses logged yet</p>
                </td>
              </tr>
            ) : (
              items.map((expense) => (
                <tr key={expense._id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] group transition-colors">
                  <td className="px-4 py-4 text-[14px] text-[#0F172A]">{new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="px-4 py-4 text-[14px] text-[#0F172A]">{expense.lawyerId?.name || 'Unknown'}</td>
                  <td className="px-4 py-4">{getTypeBadge(expense.type)}</td>
                  <td className="px-4 py-4 text-[14px] text-[#0F172A] max-w-xs truncate">{expense.description}</td>
                  <td className="px-4 py-4">
                    <div className="text-[14px] font-medium text-[#0F172A]">₹ {expense.amount?.toLocaleString('en-IN') || 0}</div>
                    {expense.type === 'billable_hours' && (
                      <div className="text-[12px] text-[#64748B] mt-0.5">{expense.hoursLogged} hrs × rate</div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => dispatch(deleteExpense(expense._id))}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} className="text-[#EF4444]" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Section 3 — Log Expense Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40" onClick={() => setIsModalOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-[480px] z-10 overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
                <h3 className="text-[18px] font-semibold text-[#0F172A]">Log New Expense</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-[#64748B] hover:text-[#0F172A] transition-colors p-1">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-[13px] font-medium text-[#64748B] mb-1.5">Expense Type</label>
                  <Select value={expenseType} onValueChange={(val) => { setExpenseType(val); setAmount(''); setHoursLogged(''); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="billable_hours">Billable Hours</SelectItem>
                      <SelectItem value="court_fees">Court Fees</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="filing">Filing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {expenseType === 'billable_hours' ? (
                  <div>
                    <label className="block text-[13px] font-medium text-[#64748B] mb-1.5">Hours Logged</label>
                    <input
                      type="number"
                      value={hoursLogged}
                      onChange={(e) => setHoursLogged(e.target.value)}
                      placeholder="e.g. 2.5"
                      className="w-full h-10 px-3 py-2 text-[14px] rounded-lg border border-[#E2E8F0] focus:outline-none focus:border-[#3B82F6]"
                    />
                    {user?.hourlyRate ? (
                      <div className="mt-2 text-[12px] bg-[#F1F5F9] text-[#64748B] px-3 py-1.5 rounded-md inline-block">
                        Billable at your configured hourly rate (₹ {user.hourlyRate}/hr)
                      </div>
                    ) : (
                      <div className="mt-2 text-[12px] bg-[#FEF2F2] text-[#EF4444] px-3 py-1.5 rounded-md inline-block">
                        Rate not configured — contact admin
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-[13px] font-medium text-[#64748B] mb-1.5">Amount (₹)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 5000"
                      className="w-full h-10 px-3 py-2 text-[14px] rounded-lg border border-[#E2E8F0] focus:outline-none focus:border-[#3B82F6]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[13px] font-medium text-[#64748B] mb-1.5">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Court appearance fee for Bombay HC"
                    className="w-full h-10 px-3 py-2 text-[14px] rounded-lg border border-[#E2E8F0] focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#64748B] mb-1.5">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-10 px-3 py-2 text-[14px] rounded-lg border border-[#E2E8F0] focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>

                <div
                  onClick={!isSubmitting ? handleLogExpense : undefined}
                  className={\`w-full h-10 flex items-center justify-center rounded-lg text-white font-medium text-[14px] cursor-pointer transition-colors \${isSubmitting ? 'bg-[#93C5FD]' : 'bg-[#1D4ED8] hover:bg-[#1E40AF]'}\`}
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Log Expense"
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}`;

content = content.replace(billingTabPlaceholder, newBillingTab);
fs.writeFileSync(caseDetailPath, content, 'utf8');
console.log('CaseDetail.jsx updated successfully.');
