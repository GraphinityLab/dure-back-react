/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  Tag, 
  DollarSign,
  History,
  CheckCircle2,
  AlertCircle,
  UserCircle
} from 'lucide-react';

import axiosInstance from '../../../utils/axiosInstance';

const ClientMoreInfoModal = ({ client, onClose }) => {
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showHistory, setShowHistory] = useState(true);

  useEffect(() => {
    if (client?.client_id) {
      fetchAppointmentHistory();
    }
  }, [client?.client_id]);

  const fetchAppointmentHistory = async () => {
    try {
      setLoadingHistory(true);
      const { data } = await axiosInstance.get(`/clients/${client.client_id}/history`);
      setAppointmentHistory(data.appointments || []);
    } catch (err) {
      console.error('Failed to fetch appointment history:', err);
      setAppointmentHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        // Try parsing YYYY-MM-DD format
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          const parsed = new Date(parts[0], parts[1] - 1, parts[2]);
          if (!isNaN(parsed.getTime())) {
            return parsed.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
          }
        }
        return dateStr;
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (err) {
      return dateStr;
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    try {
      // Handle both HH:MM:SS and HH:MM formats
      const time = timeStr.includes(':') ? timeStr.split(':').slice(0, 2).join(':') : timeStr;
      const [hours, minutes] = time.split(':');
      const hour12 = parseInt(hours) % 12 || 12;
      const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${ampm}`;
    } catch (err) {
      return timeStr;
    }
  };

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return {
          bg: 'bg-emerald-100/80',
          border: 'border-emerald-200/50',
          text: 'text-emerald-700',
          icon: CheckCircle2,
          label: 'Completed'
        };
      case 'confirmed':
        return {
          bg: 'bg-blue-100/80',
          border: 'border-blue-200/50',
          text: 'text-blue-700',
          icon: CheckCircle2,
          label: 'Confirmed'
        };
      case 'pending':
        return {
          bg: 'bg-amber-100/80',
          border: 'border-amber-200/50',
          text: 'text-amber-700',
          icon: AlertCircle,
          label: 'Pending'
        };
      default:
        return {
          bg: 'bg-gray-100/80',
          border: 'border-gray-200/50',
          text: 'text-gray-700',
          icon: AlertCircle,
          label: status || 'Unknown'
        };
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-gradient-to-br from-white/90 via-white/80 to-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto text-[#3e2e3d] font-[CaviarDreams]"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 15 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200/50">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-3xl font-[Soligant] text-[#3c2b21]">
                  {client.first_name} {client.last_name}
                </h3>
                <p className="text-sm text-[#6b5c55] mt-1">Client Information & History</p>
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

        {/* Client Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-[#6b5c55]" />
              <span className="text-xs text-[#6b5c55] uppercase tracking-wider">Email</span>
            </div>
            <p className="text-sm font-semibold text-[#3c2b21] truncate">{client.email || 'N/A'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="h-4 w-4 text-[#6b5c55]" />
              <span className="text-xs text-[#6b5c55] uppercase tracking-wider">Phone</span>
            </div>
            <p className="text-sm font-semibold text-[#3c2b21]">{client.phone_number || 'N/A'}</p>
          </div>

          {client.address && (
            <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 md:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-[#6b5c55]" />
                <span className="text-xs text-[#6b5c55] uppercase tracking-wider">Address</span>
              </div>
              <p className="text-sm font-semibold text-[#3c2b21]">
                {client.address}
                {client.city && `, ${client.city}`}
                {client.postal_code && ` ${client.postal_code}`}
              </p>
            </div>
          )}
        </div>

        {/* Appointment History Section */}
        <div className="mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowHistory(!showHistory)}
            className="w-full px-4 py-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 hover:bg-white/80 transition-all flex items-center justify-between mb-4"
          >
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-[#6b5c55]" />
              <span className="font-semibold text-[#3c2b21]">
                Appointment History ({appointmentHistory.length})
              </span>
            </div>
            <span className="text-sm text-[#6b5c55]">{showHistory ? 'Hide' : 'Show'}</span>
          </motion.button>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#c1a38f]/60 scrollbar-thumb-rounded-full"
              >
                {loadingHistory ? (
                  <div className="text-center py-8 text-[#6b5c55]">
                    <div className="inline-block w-6 h-6 border-2 border-[#c1a38f] border-t-transparent rounded-full animate-spin" />
                    <p className="mt-2">Loading history...</p>
                  </div>
                ) : appointmentHistory.length === 0 ? (
                  <div className="text-center py-8 text-[#6b5c55] rounded-2xl bg-white/40 backdrop-blur-sm border border-white/50">
                    <History className="h-12 w-12 mx-auto mb-3 text-[#9b8a83]" />
                    <p className="font-medium">No appointment history</p>
                    <p className="text-sm mt-1">This client hasn't had any appointments yet.</p>
                  </div>
                ) : (
                  appointmentHistory.map((apt, index) => {
                    const statusConfig = getStatusConfig(apt.status);
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <motion.div
                        key={`${apt.appointment_id}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-xl bg-gradient-to-br from-white/60 via-white/40 to-white/20 backdrop-blur-sm border border-white/50 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-1.5 rounded-lg bg-white/60 backdrop-blur-sm">
                                <Tag className="h-4 w-4 text-blue-600" />
                              </div>
                              <h4 className="font-semibold text-[#3c2b21]">{apt.service_name || 'Unknown Service'}</h4>
                            </div>
                            {apt.service_category && (
                              <p className="text-xs text-[#6b5c55] ml-7">{apt.service_category}</p>
                            )}
                          </div>
                          <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${statusConfig.bg} ${statusConfig.border} border ${statusConfig.text}`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-[#6b5c55]" />
                            <span className="text-[#3c2b21] font-medium">{formatDate(apt.appointment_date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-[#6b5c55]" />
                            <span className="text-[#3c2b21] font-medium">
                              {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                            </span>
                          </div>
                          {apt.service_price && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-3.5 w-3.5 text-[#6b5c55]" />
                              <span className="text-[#3c2b21] font-medium">${Number(apt.service_price).toFixed(2)}</span>
                            </div>
                          )}
                          {apt.staff_first_name && (
                            <div className="flex items-center gap-2">
                              <UserCircle className="h-3.5 w-3.5 text-[#6b5c55]" />
                              <span className="text-[#3c2b21] font-medium truncate">
                                {apt.staff_first_name} {apt.staff_last_name}
                              </span>
                            </div>
                          )}
                        </div>

                        {apt.notes && (
                          <div className="mt-3 pt-3 border-t border-white/30">
                            <p className="text-xs text-[#6b5c55] italic">{apt.notes}</p>
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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

export default ClientMoreInfoModal;
