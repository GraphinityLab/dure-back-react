import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  LogIn, 
  LogOut, 
  History, 
  TrendingUp, 
  Calendar,
  Clock as ClockIcon,
  User,
  RefreshCcw,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

import axiosInstance from '../../utils/axiosInstance';
import MessageBanner from '../components/appointments/MessageBanner';
import { setTimedMessage } from '../components/appointments/utils';

const ClockInOutPage = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [showLogs, setShowLogs] = useState(false);
  const [notes, setNotes] = useState('');

  // Fetch current status
  const fetchStatus = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/clock/status');
      setStatus(data);
    } catch (err) {
      console.error('Failed to fetch status:', err);
      setTimedMessage(setMessage, 'Failed to load clock status', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch logs
  const fetchLogs = async () => {
    try {
      const { data } = await axiosInstance.get('/clock/my-logs?limit=50');
      setLogs(data.logs || []);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const { data } = await axiosInstance.get('/clock/statistics');
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchLogs();
    fetchStats();
  }, []);

  // Auto-refresh status every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!actionLoading) {
        fetchStatus();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [actionLoading]);

  const handleClockIn = async () => {
    try {
      setActionLoading(true);
      const { data } = await axiosInstance.post('/clock/clock-in', { notes });
      setTimedMessage(setMessage, 'Clocked in successfully!', 'success');
      setNotes('');
      await fetchStatus();
      await fetchLogs();
      await fetchStats();
    } catch (err) {
      console.error('Clock in error:', err);
      const errorMsg = err?.response?.data?.message || 'Failed to clock in';
      setTimedMessage(setMessage, errorMsg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setActionLoading(true);
      const { data } = await axiosInstance.post('/clock/clock-out', { notes });
      setTimedMessage(setMessage, `Clocked out successfully! Duration: ${data.durationMinutes} minutes`, 'success');
      setNotes('');
      await fetchStatus();
      await fetchLogs();
      await fetchStats();
    } catch (err) {
      console.error('Clock out error:', err);
      const errorMsg = err?.response?.data?.message || 'Failed to clock out';
      setTimedMessage(setMessage, errorMsg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0m';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#c1a38f]/30 border-t-[#c1a38f] rounded-full animate-spin" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-[#a78974]/50 rounded-full animate-spin" style={{ animationDuration: '0.8s' }} />
        </div>
      </div>
    );
  }

  const isClockedIn = status?.isClockedIn || false;
  const currentDuration = status?.durationMinutes || 0;

  return (
    <div className="relative w-full py-8 px-4 sm:px-6 lg:px-8 text-[#3e2e3d] min-h-screen">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#c1a38f]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#a78974]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto z-10">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-6xl font-[Soligant] tracking-tight bg-gradient-to-r from-[#3c2b21] via-[#5f4b5a] to-[#3c2b21] bg-clip-text text-transparent mb-2"
              >
                Clock In/Out
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-[#6b5c55] font-medium"
              >
                Track your work hours and attendance
              </motion.p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                fetchStatus();
                fetchLogs();
                fetchStats();
              }}
              className="p-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/50 text-[#3c2b21] hover:bg-white/90 shadow-lg hover:shadow-xl transition-all"
            >
              <RefreshCcw className="h-5 w-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Messages */}
        <AnimatePresence>{message && <MessageBanner message={message} setMessage={setMessage} />}</AnimatePresence>

        {/* Main Clock In/Out Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 rounded-3xl bg-gradient-to-br from-white/60 via-white/40 to-white/20 backdrop-blur-xl border border-white/50 shadow-[0_20px_60px_rgba(60,43,33,0.15)] p-8"
        >
          {/* Current Status */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${isClockedIn ? 'bg-emerald-100/80' : 'bg-gray-100/80'} border ${isClockedIn ? 'border-emerald-300/50' : 'border-gray-300/50'}`}>
                {isClockedIn ? (
                  <LogIn className="h-8 w-8 text-emerald-600" />
                ) : (
                  <LogOut className="h-8 w-8 text-gray-600" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-[#3c2b21] mb-1">
                  {isClockedIn ? 'Currently Clocked In' : 'Currently Clocked Out'}
                </h2>
                {isClockedIn && status?.clockInTime && (
                  <div className="text-sm text-[#6b5c55]">
                    <div>Clocked in: {formatDateTime(status.clockInTime)}</div>
                    <div className="font-semibold text-emerald-600 mt-1">
                      Duration: {formatDuration(currentDuration)}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className={`px-4 py-2 rounded-xl ${isClockedIn ? 'bg-emerald-500' : 'bg-gray-400'} text-white font-semibold flex items-center gap-2`}>
              <div className={`h-2 w-2 rounded-full ${isClockedIn ? 'bg-white animate-pulse' : 'bg-white'}`} />
              {isClockedIn ? 'Online' : 'Offline'}
            </div>
          </div>

          {/* Notes Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#3c2b21] mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about your shift..."
              className="w-full px-4 py-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/50 focus:outline-none focus:ring-2 focus:ring-[#c1a38f]/50 focus:border-[#c1a38f] text-sm shadow-lg transition-all resize-none"
              rows="3"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            {!isClockedIn ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClockIn}
                disabled={actionLoading}
                className="flex-1 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <LogIn className="h-5 w-5" />
                {actionLoading ? 'Clocking In...' : 'Clock In'}
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClockOut}
                disabled={actionLoading}
                className="flex-1 px-6 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <LogOut className="h-5 w-5" />
                {actionLoading ? 'Clocking Out...' : 'Clock Out'}
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Statistics Cards - Always show, even if stats are null */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="rounded-2xl bg-gradient-to-br from-white/60 via-white/40 to-white/20 backdrop-blur-xl border border-white/50 shadow-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-blue-100/80 border border-blue-300/50">
                <History className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-[#6b5c55] uppercase tracking-wider">Total Sessions</div>
                <div className="text-2xl font-bold text-[#3c2b21]">{stats?.totalSessions || 0}</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-white/60 via-white/40 to-white/20 backdrop-blur-xl border border-white/50 shadow-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-emerald-100/80 border border-emerald-300/50">
                <ClockIcon className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs text-[#6b5c55] uppercase tracking-wider">Total Hours</div>
                <div className="text-2xl font-bold text-[#3c2b21]">
                  {formatDuration(stats?.totalMinutes || 0)}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-white/60 via-white/40 to-white/20 backdrop-blur-xl border border-white/50 shadow-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-amber-100/80 border border-amber-300/50">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="text-xs text-[#6b5c55] uppercase tracking-wider">This Week</div>
                <div className="text-2xl font-bold text-[#3c2b21]">
                  {formatDuration(stats?.minutesThisWeek || 0)}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Logs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-3xl bg-gradient-to-br from-white/60 via-white/40 to-white/20 backdrop-blur-xl border border-white/50 shadow-[0_20px_60px_rgba(60,43,33,0.15)] p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-[#3c2b21] flex items-center gap-2">
              <History className="h-6 w-6" />
              Clock History
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLogs(!showLogs)}
              className="px-4 py-2 rounded-xl bg-white/70 backdrop-blur-xl border border-white/50 text-[#3c2b21] hover:bg-white/90 shadow-lg transition-all text-sm font-medium"
            >
              {showLogs ? 'Hide' : 'Show'} Logs
            </motion.button>
          </div>

          <AnimatePresence>
            {showLogs && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#c1a38f]/60 scrollbar-thumb-rounded-full scrollbar-track-transparent"
              >
                {logs.length === 0 ? (
                  <div className="text-center py-12 text-[#6b5c55]">
                    <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No clock history yet</p>
                  </div>
                ) : (
                  logs.map((log, idx) => (
                    <motion.div
                      key={log.clock_id || idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 hover:bg-white/80 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {log.clock_out_time ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                          )}
                          <div>
                            <div className="font-semibold text-[#3c2b21]">
                              {formatDateTime(log.clock_in_time)}
                            </div>
                            {log.clock_out_time && (
                              <div className="text-sm text-[#6b5c55]">
                                Out: {formatDateTime(log.clock_out_time)}
                              </div>
                            )}
                          </div>
                        </div>
                        {log.duration_minutes && (
                          <div className="px-3 py-1 rounded-lg bg-emerald-100/80 text-emerald-700 text-sm font-medium">
                            {formatDuration(log.duration_minutes)}
                          </div>
                        )}
                      </div>
                      {log.notes && (
                        <div className="mt-2 text-sm text-[#6b5c55] italic pl-8">
                          {log.notes}
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default ClockInOutPage;

