import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CalendarX, X, AlertTriangle, Loader2 } from 'lucide-react';
import { fetchAppointments, createAppointment, cancelAppointment } from '../../store/appointmentSlice';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';

const TYPE_COLORS = {
  court_appearance: { bg: '#FEE2E2', text: '#991B1B', border: '#EF4444', label: 'Court Appearance' },
  client_meeting: { bg: '#DBEAFE', text: '#1E40AF', border: '#3B82F6', label: 'Client Meeting' },
  document_review: { bg: '#EDE9FE', text: '#5B21B6', border: '#8B5CF6', label: 'Document Review' },
  other: { bg: '#F1F5F9', text: '#475569', border: '#64748B', label: 'Other' }
};

const STATUS_COLORS = {
  scheduled: { bg: '#DBEAFE', text: '#1E40AF', label: 'Scheduled' },
  completed: { bg: '#D1FAE5', text: '#065F46', label: 'Completed' },
  cancelled: { bg: '#F1F5F9', text: '#475569', label: 'Cancelled' }
};

export default function CalendarWorkspace() {
  const dispatch = useDispatch();
  const { items, status, createStatus, createError } = useSelector((state) => state.appointment);
  const { user } = useSelector((state) => state.auth);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0,0,0,0);
    return d;
  });

  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [type, setType] = useState('client_meeting');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState('');
  const [caseId, setCaseId] = useState('');
  const [timeError, setTimeError] = useState('');

  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  const handlePrevMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() - 1);
    setCurrentMonth(d);
  };

  const handleNextMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + 1);
    setCurrentMonth(d);
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

  const calendarCells = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayIndex = currentMonth.getDay();
    const totalDays = getDaysInMonth(year, month);
    const prevMonthDays = getDaysInMonth(year, month - 1);

    const cells = [];
    
    // Previous month filler
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthDays - i);
      cells.push({ date: d, isCurrentMonth: false });
    }
    
    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      cells.push({ date: d, isCurrentMonth: true });
    }
    
    // Next month filler
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      cells.push({ date: d, isCurrentMonth: false });
    }

    return cells;
  }, [currentMonth]);

  const appointmentsByDate = useMemo(() => {
    const map = {};
    items.forEach(appt => {
      const d = new Date(appt.start);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(appt);
    });
    return map;
  }, [items]);

  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    now.setHours(0,0,0,0);
    return [...items]
      .filter(a => new Date(a.start) >= now && a.status === 'scheduled')
      .sort((a, b) => new Date(a.start) - new Date(b.start))
      .slice(0, 10);
  }, [items]);

  const handleCellClick = (date) => {
    setSelectedDate(date);
    const dStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    setDateStr(dStr);
    setTitle('');
    setStartTime('');
    setEndTime('');
    setType('client_meeting');
    setDescription('');
    setClientId('');
    setCaseId('');
    setTimeError('');
    setModalMode('create');
    setShowModal(true);
  };

  const handleEventClick = (e, appt) => {
    e.stopPropagation();
    setSelectedEvent(appt);
    setModalMode('view');
    setShowModal(true);
  };

  const handleBookAppointment = async () => {
    if (!title || !dateStr || !startTime || !endTime || !clientId) return;
    
    const [startH, startM] = startTime.split(':');
    const [endH, endM] = endTime.split(':');
    
    const startObj = new Date(dateStr);
    startObj.setHours(parseInt(startH, 10), parseInt(startM, 10), 0, 0);
    
    const endObj = new Date(dateStr);
    endObj.setHours(parseInt(endH, 10), parseInt(endM, 10), 0, 0);

    if (endObj <= startObj) {
      setTimeError('End time must be after start time.');
      return;
    }
    setTimeError('');

    const payload = {
      lawyerId: user?._id || user?.userId,
      clientId,
      caseId: caseId || undefined,
      title,
      description,
      start: startObj.toISOString(),
      end: endObj.toISOString(),
      type
    };

    try {
      await dispatch(createAppointment(payload)).unwrap();
      setShowModal(false);
    } catch (err) {
      // handled by createError in state
    }
  };

  const handleCancel = async () => {
    if (!selectedEvent) return;
    try {
      await dispatch(cancelAppointment(selectedEvent._id)).unwrap();
      const updated = { ...selectedEvent, status: 'cancelled' };
      setSelectedEvent(updated);
    } catch (err) {
      window.alert("Failed to cancel appointment.");
    }
  };

  const today = new Date();
  today.setHours(0,0,0,0);

  return (
    <div className="flex flex-col md:flex-row gap-6">
      
      {/* Calendar Matrix Section (65%) */}
      <div className="flex-grow w-full md:w-[65%] bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-[#F1F5F9] transition-colors">
            <ChevronLeft size={20} className="text-[#64748B]" />
          </button>
          <h2 className="text-[18px] font-semibold text-[#0F172A]">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-[#F1F5F9] transition-colors">
            <ChevronRight size={20} className="text-[#64748B]" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-[14px] font-medium text-[#64748B] pb-2">
              {day}
            </div>
          ))}
        </div>

        {status === 'loading' ? (
          <SkeletonLoader variant="calendar" />
        ) : (
          <div className="overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMonth.toISOString()}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-7 gap-1"
              >
                {calendarCells.map((cell, idx) => {
                  const key = `${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}`;
                  const dayAppts = appointmentsByDate[key] || [];
                  const isToday = cell.date.getTime() === today.getTime();

                  return (
                    <div
                      key={idx}
                      onClick={() => handleCellClick(cell.date)}
                      className={`min-h-[80px] border border-[#E2E8F0] rounded-md p-1 cursor-pointer hover:bg-[#EFF6FF] transition-colors flex flex-col ${!cell.isCurrentMonth ? 'bg-gray-50 opacity-60' : 'bg-white'}`}
                    >
                      <div className="mb-1">
                        {isToday ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#1D4ED8] text-white text-[13px] font-medium">
                            {cell.date.getDate()}
                          </span>
                        ) : (
                          <span className="text-[13px] font-medium text-[#475569] ml-1">
                            {cell.date.getDate()}
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1 flex-1 overflow-hidden">
                        {dayAppts.slice(0, 2).map(appt => (
                          <div
                            key={appt._id}
                            onClick={(e) => handleEventClick(e, appt)}
                            className="px-2 py-0.5 rounded truncate text-[11px] font-medium"
                            style={{ backgroundColor: TYPE_COLORS[appt.type]?.bg, color: TYPE_COLORS[appt.type]?.text }}
                          >
                            {new Date(appt.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {appt.title}
                          </div>
                        ))}
                        {dayAppts.length > 2 && (
                          <div className="text-[11px] text-[#64748B] pl-1 font-medium hover:text-[#1D4ED8]">
                            +{dayAppts.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Upcoming Appointments Section (35%) */}
      <div className="w-full md:w-[35%] bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm flex flex-col">
        <h2 className="text-[16px] font-semibold text-[#0F172A] mb-4">Upcoming</h2>
        
        {status === 'loading' ? (
          <SkeletonLoader variant="list" />
        ) : upcomingAppointments.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-10">
            <CalendarX size={36} className="text-[#94A3B8] mb-3" />
            <p className="text-[13px] text-[#64748B]">No upcoming appointments</p>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[600px] space-y-3 pr-1">
            {upcomingAppointments.map(appt => (
              <div 
                key={appt._id} 
                onClick={(e) => handleEventClick(e, appt)}
                className="p-3 rounded-md bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer transition-colors shadow-sm"
                style={{ borderLeftWidth: '3px', borderLeftColor: TYPE_COLORS[appt.type]?.border }}
              >
                <div className="text-[14px] font-semibold text-[#0F172A] mb-1">{appt.title}</div>
                <div className="text-[12px] text-[#64748B] mb-1">
                  {new Date(appt.start).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })} · {new Date(appt.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-[12px] text-[#94A3B8] truncate">
                  {appt.clientId?.name || 'Unknown Client'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40" onClick={() => setShowModal(false)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] z-10 p-6 flex flex-col max-h-[90vh] overflow-y-auto"
            >
              {modalMode === 'create' && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[18px] font-semibold text-[#0F172A]">New Appointment</h2>
                    <button onClick={() => setShowModal(false)} className="text-[#94A3B8] hover:text-[#0F172A]">
                      <X size={20} />
                    </button>
                  </div>

                  {createError && createError.toLowerCase().includes('conflicts') && (
                    <div className="mb-4 bg-[#FEF3C7] border-l-4 border-[#F59E0B] rounded-[6px] p-3 flex items-start gap-2">
                      <AlertTriangle size={16} className="text-[#92400E] mt-0.5 shrink-0" />
                      <p className="text-[13px] text-[#92400E]">{createError}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[13px] font-medium text-[#64748B] mb-1.5">Title <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Pre-trial Consultation"
                        className="w-full h-10 px-3 text-[14px] rounded-lg border border-[#E2E8F0] focus:outline-none focus:border-[#3B82F6]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[13px] font-medium text-[#64748B] mb-1.5">Date <span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        value={dateStr}
                        onChange={(e) => setDateStr(e.target.value)}
                        className="w-full h-10 px-3 text-[14px] rounded-lg border border-[#E2E8F0] focus:outline-none focus:border-[#3B82F6]"
                      />
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-[13px] font-medium text-[#64748B] mb-1.5">Start Time <span className="text-red-500">*</span></label>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => { setStartTime(e.target.value); setTimeError(''); }}
                          className="w-full h-10 px-3 text-[14px] rounded-lg border border-[#E2E8F0] focus:outline-none focus:border-[#3B82F6]"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[13px] font-medium text-[#64748B] mb-1.5">End Time <span className="text-red-500">*</span></label>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => { setEndTime(e.target.value); setTimeError(''); }}
                          className="w-full h-10 px-3 text-[14px] rounded-lg border border-[#E2E8F0] focus:outline-none focus:border-[#3B82F6]"
                        />
                      </div>
                    </div>
                    {timeError && <p className="text-red-500 text-[12px] mt-1">{timeError}</p>}

                    <div>
                      <label className="block text-[13px] font-medium text-[#64748B] mb-1.5">Type</label>
                      <Select value={type} onValueChange={setType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="court_appearance">Court Appearance</SelectItem>
                          <SelectItem value="client_meeting">Client Meeting</SelectItem>
                          <SelectItem value="document_review">Document Review</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-[13px] font-medium text-[#64748B] mb-1.5">Description</label>
                      <textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 text-[14px] rounded-lg border border-[#E2E8F0] focus:outline-none focus:border-[#3B82F6] resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[13px] font-medium text-[#64748B] mb-1.5">Client ID <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        className="w-full h-10 px-3 text-[14px] rounded-lg border border-[#E2E8F0] focus:outline-none focus:border-[#3B82F6]"
                      />
                      <p className="text-[11px] text-[#94A3B8] mt-1">Enter the client's user ID. Client linking will be enhanced in a future update.</p>
                    </div>

                    <div>
                      <label className="block text-[13px] font-medium text-[#64748B] mb-1.5">Case ID</label>
                      <input
                        type="text"
                        value={caseId}
                        onChange={(e) => setCaseId(e.target.value)}
                        className="w-full h-10 px-3 text-[14px] rounded-lg border border-[#E2E8F0] focus:outline-none focus:border-[#3B82F6]"
                      />
                      <p className="text-[11px] text-[#94A3B8] mt-1">Optional — link this appointment to a specific case by ID.</p>
                    </div>

                    <div className="pt-2">
                      <div
                        onClick={createStatus !== 'loading' ? handleBookAppointment : undefined}
                        className={`w-full h-10 flex items-center justify-center rounded-lg text-white font-medium text-[14px] cursor-pointer transition-colors ${createStatus === 'loading' ? 'bg-[#93C5FD]' : 'bg-[#1D4ED8] hover:bg-[#1E40AF]'}`}
                      >
                        {createStatus === 'loading' ? <Loader2 size={18} className="animate-spin" /> : "Book Appointment"}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {modalMode === 'view' && selectedEvent && (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-[18px] font-semibold text-[#0F172A] mb-2">{selectedEvent.title}</h2>
                      <span className="px-2 py-1 rounded text-[12px] font-medium" style={{ backgroundColor: TYPE_COLORS[selectedEvent.type]?.bg, color: TYPE_COLORS[selectedEvent.type]?.text }}>
                        {TYPE_COLORS[selectedEvent.type]?.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 rounded-full text-[12px] font-medium" style={{ backgroundColor: STATUS_COLORS[selectedEvent.status]?.bg, color: STATUS_COLORS[selectedEvent.status]?.text }}>
                        {STATUS_COLORS[selectedEvent.status]?.label}
                      </span>
                      <button onClick={() => setShowModal(false)} className="text-[#94A3B8] hover:text-[#0F172A]">
                        <X size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="text-[13px] font-medium text-[#64748B] mb-1">Time</p>
                      <p className="text-[14px] text-[#0F172A]">
                        {new Date(selectedEvent.start).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}, {new Date(selectedEvent.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(selectedEvent.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {selectedEvent.description && (
                      <div>
                        <p className="text-[13px] font-medium text-[#64748B] mb-1">Description</p>
                        <p className="text-[14px] text-[#64748B] whitespace-pre-wrap">{selectedEvent.description}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-[13px] font-medium text-[#64748B] mb-1">Client</p>
                      <p className="text-[14px] text-[#1D4ED8] hover:underline cursor-pointer">
                        {selectedEvent.clientId?.name || 'Unknown Client'}
                      </p>
                    </div>

                    {selectedEvent.caseId && (
                      <div>
                        <p className="text-[13px] font-medium text-[#64748B] mb-1">Case</p>
                        <p className="text-[14px] text-[#1D4ED8] hover:underline cursor-pointer">
                          {selectedEvent.caseId?.title || 'Unknown Case'}
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedEvent.status === 'scheduled' && (
                    <div className="mt-auto">
                      <button
                        onClick={handleCancel}
                        className="w-full h-10 border border-[#EF4444] text-[#EF4444] hover:bg-[#FEF2F2] rounded-md font-medium text-[14px] transition-colors"
                      >
                        Cancel Appointment
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
