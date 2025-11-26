import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, X } from 'lucide-react';

const CalendarView = ({ appointments = [], onAppointmentClick, viewMode = 'month', onViewChange }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped = {};
    appointments.forEach(apt => {
      const date = apt.appointment_date?.split('T')[0] || apt.appointment_date;
      if (date) {
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(apt);
      }
    });
    return grouped;
  }, [appointments]);

  // Get appointments for a specific date
  const getAppointmentsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointmentsByDate[dateStr] || [];
  };

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      days.push(date);
    }
    
    return days;
  }, [currentDate, startingDayOfWeek, daysInMonth]);

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-emerald-500';
      case 'pending': return 'bg-amber-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled':
      case 'declined': return 'bg-rose-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-white/60 via-white/40 to-white/20 backdrop-blur-xl border border-white/50 rounded-3xl shadow-[0_20px_60px_rgba(60,43,33,0.15)] p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={goToPreviousMonth}
            className="p-2 rounded-xl bg-white/70 backdrop-blur-xl border border-white/50 hover:bg-white/90 transition-all"
          >
            <ChevronLeft className="h-5 w-5 text-[#3c2b21]" />
          </motion.button>
          
          <h2 className="text-2xl font-semibold text-[#3c2b21] min-w-[200px] text-center">
            {monthName}
          </h2>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={goToNextMonth}
            className="p-2 rounded-xl bg-white/70 backdrop-blur-xl border border-white/50 hover:bg-white/90 transition-all"
          >
            <ChevronRight className="h-5 w-5 text-[#3c2b21]" />
          </motion.button>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToToday}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#3c2b21] to-[#5f4b5a] text-white text-sm font-medium shadow-lg hover:shadow-xl transition-all"
          >
            Today
          </motion.button>
          
          {onViewChange && (
            <div className="flex rounded-xl bg-white/70 backdrop-blur-xl border border-white/50 overflow-hidden">
              {['month', 'week', 'day'].map((mode) => (
                <motion.button
                  key={mode}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onViewChange(mode)}
                  className={`px-4 py-2 text-sm font-medium capitalize transition-all ${
                    viewMode === mode
                      ? 'bg-gradient-to-r from-[#3c2b21] to-[#5f4b5a] text-white'
                      : 'text-[#3c2b21] hover:bg-white/50'
                  }`}
                >
                  {mode}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-[#6b5c55] py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 flex-1">
        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dateStr = date.toISOString().split('T')[0];
          const isToday = dateStr === today.toISOString().split('T')[0];
          const isSelected = selectedDate && dateStr === selectedDate.toISOString().split('T')[0];
          const isPast = date < today;
          const dayAppointments = getAppointmentsForDate(date);

          return (
            <motion.div
              key={dateStr}
              whileHover={!isPast ? { scale: 1.02 } : {}}
              onClick={() => {
                if (!isPast) {
                  setSelectedDate(date);
                  if (dayAppointments.length > 0 && onAppointmentClick) {
                    onAppointmentClick(dayAppointments[0]);
                  }
                }
              }}
              className={`
                aspect-square rounded-xl p-2 border-2 transition-all
                ${isPast ? 'cursor-not-allowed opacity-40 bg-gray-300/20' : 'cursor-pointer hover:bg-white/40 bg-white/30'}
                ${isToday ? 'border-[#c1a38f] bg-[#c1a38f]/10' : 'border-white/50'}
                ${isSelected && !isPast ? 'ring-2 ring-[#3c2b21] ring-offset-2' : ''}
                backdrop-blur-sm
              `}
            >
              <div className={`text-sm font-medium mb-1 ${isToday ? 'text-[#3c2b21] font-bold' : isPast ? 'text-gray-400' : 'text-[#6b5c55]'}`}>
                {date.getDate()}
              </div>
              
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map((apt, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`h-1.5 rounded-full ${getStatusColor(apt.status)} ${isPast ? 'opacity-50' : ''}`}
                    title={`${apt.clientName || 'Client'} - ${apt.serviceName || 'Service'}`}
                  />
                ))}
                {dayAppointments.length > 3 && (
                  <div className={`text-[10px] font-medium ${isPast ? 'text-gray-400' : 'text-[#6b5c55]'}`}>
                    +{dayAppointments.length - 3} more
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-white/30">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-[#6b5c55]">Confirmed</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-[#6b5c55]">Pending</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-[#6b5c55]">Completed</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-rose-500" />
          <span className="text-[#6b5c55]">Cancelled</span>
        </div>
      </div>

      {/* Selected Date Appointments Modal */}
      <AnimatePresence>
        {selectedDate && getAppointmentsForDate(selectedDate).length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedDate(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-white/90 via-white/80 to-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-[0_20px_60px_rgba(60,43,33,0.25)] p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-[#3c2b21]">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="p-2 rounded-xl hover:bg-white/50 transition-all"
                >
                  <X className="h-5 w-5 text-[#6b5c55]" />
                </button>
              </div>

              <div className="space-y-3">
                {getAppointmentsForDate(selectedDate).map((apt, idx) => (
                  <motion.div
                    key={apt.id || idx}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => {
                      if (onAppointmentClick) onAppointmentClick(apt);
                      setSelectedDate(null);
                    }}
                    className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 cursor-pointer hover:bg-white/80 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#6b5c55]" />
                        <span className="text-sm font-medium text-[#3c2b21]">
                          {apt.startTime} - {apt.endTime}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getStatusColor(apt.status)} text-white`}>
                        {apt.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-[#6b5c55]" />
                      <span className="text-sm text-[#3c2b21] font-medium">
                        {apt.clientName}
                      </span>
                    </div>
                    <div className="text-xs text-[#6b5c55]">
                      {apt.serviceName}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarView;

