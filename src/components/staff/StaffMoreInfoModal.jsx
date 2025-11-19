/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, MapPin, Clock, Activity, TrendingUp } from 'lucide-react';

import axiosInstance from '../../../utils/axiosInstance';

const StaffMoreInfoModal = ({ staff, onClose, isAdmin = false }) => {
  const [clockLogs, setClockLogs] = useState([]);
  const [clockStats, setClockStats] = useState(null);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    if (showLogs && isAdmin) {
      fetchClockLogs();
      fetchClockStats();
    }
  }, [showLogs, isAdmin, staff?.staff_id]);

  const fetchClockLogs = async () => {
    try {
      setLoadingLogs(true);
      const { data } = await axiosInstance.get(`/clock/logs?staff_id=${staff.staff_id}&limit=10`);
      setClockLogs(data.logs || []);
    } catch (err) {
      console.error('Failed to fetch clock logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchClockStats = async () => {
    try {
      const { data } = await axiosInstance.get(`/clock/statistics?staff_id=${staff.staff_id}`);
      setClockStats(data);
    } catch (err) {
      console.error('Failed to fetch clock stats:', err);
    }
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

  const formatDuration = (minutes) => {
    if (!minutes) return '0m';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const isOnline = staff.online === 1 || staff.online === true;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-gradient-to-br from-white/90 via-white/80 to-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto text-[#3e2e3d] font-[CaviarDreams]"
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 15 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 border border-purple-200/50">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-3xl font-[Soligant] text-[#3c2b21]">
                  {staff.first_name} {staff.last_name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                    isOnline 
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
                    }`} />
                    {isOnline ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/50 transition-all"
          >
            <X className="h-5 w-5 text-[#6b5c55]" />
          </motion.button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-[#6b5c55]" />
              <span className="text-xs text-[#6b5c55] uppercase tracking-wider">Username</span>
            </div>
            <p className="text-sm font-semibold text-[#3c2b21]">{staff.username || 'N/A'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-[#6b5c55]" />
              <span className="text-xs text-[#6b5c55] uppercase tracking-wider">Email</span>
            </div>
            <p className="text-sm font-semibold text-[#3c2b21] truncate">{staff.email || 'N/A'}</p>
          </div>

          {staff.phone_number && (
            <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4 text-[#6b5c55]" />
                <span className="text-xs text-[#6b5c55] uppercase tracking-wider">Phone</span>
              </div>
              <p className="text-sm font-semibold text-[#3c2b21]">{staff.phone_number}</p>
            </div>
          )}

          {staff.address && (
            <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-[#6b5c55]" />
                <span className="text-xs text-[#6b5c55] uppercase tracking-wider">Address</span>
              </div>
              <p className="text-sm font-semibold text-[#3c2b21]">
                {staff.address}, {staff.city}, {staff.province} {staff.postal_code}
              </p>
            </div>
          )}
        </div>

        {/* Clock Stats (Admin Only) */}
        {isAdmin && clockStats && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200/50">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-purple-600" />
              <h4 className="text-lg font-semibold text-[#3c2b21]">Clock Statistics</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-[#6b5c55] uppercase tracking-wider mb-1">Total Sessions</div>
                <div className="text-2xl font-bold text-[#3c2b21]">{clockStats.totalSessions || 0}</div>
              </div>
              <div>
                <div className="text-xs text-[#6b5c55] uppercase tracking-wider mb-1">Total Hours</div>
                <div className="text-2xl font-bold text-[#3c2b21]">{formatDuration(clockStats.totalMinutes || 0)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Clock Logs (Admin Only) */}
        {isAdmin && (
          <div className="mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowLogs(!showLogs)}
              className="w-full px-4 py-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 hover:bg-white/80 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#6b5c55]" />
                <span className="font-semibold text-[#3c2b21]">Clock History</span>
              </div>
              <span className="text-sm text-[#6b5c55]">{showLogs ? 'Hide' : 'Show'}</span>
            </motion.button>

            <AnimatePresence>
              {showLogs && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#c1a38f]/60 scrollbar-thumb-rounded-full"
                >
                  {loadingLogs ? (
                    <div className="text-center py-8 text-[#6b5c55]">Loading...</div>
                  ) : clockLogs.length === 0 ? (
                    <div className="text-center py-8 text-[#6b5c55]">No clock history</div>
                  ) : (
                    clockLogs.map((log) => (
                      <div
                        key={log.clock_id}
                        className="p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/50"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-[#3c2b21]">
                            {formatDateTime(log.clock_in_time)}
                          </span>
                          {log.duration_minutes && (
                            <span className="text-xs text-emerald-600 font-medium">
                              {formatDuration(log.duration_minutes)}
                            </span>
                          )}
                        </div>
                        {log.clock_out_time && (
                          <div className="text-xs text-[#6b5c55]">
                            Out: {formatDateTime(log.clock_out_time)}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#c1a38f] to-[#a78974] text-white hover:from-[#a78974] hover:to-[#8d6f5a] transition font-semibold text-sm shadow-lg"
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StaffMoreInfoModal;
