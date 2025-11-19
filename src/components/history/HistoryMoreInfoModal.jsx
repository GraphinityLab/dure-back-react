import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, User, Tag, DollarSign, FileText, CheckCircle2, XCircle } from 'lucide-react';

const HistoryMoreInfoModal = ({ item, onClose }) => {
  if (!item) return null;

  const appointmentDate = item.appointment_date 
    ? new Date(item.appointment_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : 'N/A';

  const createdDate = item.created_at 
    ? new Date(item.created_at).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : 'N/A';

  const getStatusIcon = (status) => {
    if (status?.toLowerCase() === 'completed') return CheckCircle2;
    if (status?.toLowerCase() === 'cancelled') return XCircle;
    return Clock;
  };

  const StatusIcon = getStatusIcon(item.status);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-[#3c2b21] to-[#5f4b5a] p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white mb-1">Appointment Details</h2>
                <p className="text-white/80 text-sm">Complete history record information</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#c1a38f]/60 scrollbar-track-transparent">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Client Info */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Client</span>
                </div>
                <p className="text-[#3c2b21] font-medium">{item.client_name || 'N/A'}</p>
              </div>

              {/* Service Info */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/50">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Service</span>
                </div>
                <p className="text-[#3c2b21] font-medium">{item.service_name || 'N/A'}</p>
                {item.service_category && (
                  <p className="text-sm text-[#6b5c55] mt-1">{item.service_category}</p>
                )}
              </div>

              {/* Date */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200/50">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Date</span>
                </div>
                <p className="text-[#3c2b21] font-medium">{appointmentDate}</p>
              </div>

              {/* Time */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200/50">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Time</span>
                </div>
                <p className="text-[#3c2b21] font-medium">
                  {item.start_time || 'N/A'} - {item.end_time || 'N/A'}
                </p>
              </div>

              {/* Price */}
              {item.service_price && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200/50">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-teal-600" />
                    <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">Price</span>
                  </div>
                  <p className="text-[#3c2b21] font-semibold text-lg">${Number(item.service_price).toFixed(2)}</p>
                </div>
              )}

              {/* Status */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200/50">
                <div className="flex items-center gap-2 mb-2">
                  <StatusIcon className="h-4 w-4 text-slate-600" />
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</span>
                </div>
                <p className="text-[#3c2b21] font-medium capitalize">{item.status || 'Unknown'}</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-4 space-y-3">
              {item.notes && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200/50">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Notes</span>
                  </div>
                  <p className="text-[#3c2b21] text-sm">{item.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                {item.staff_id && (
                  <div className="p-3 rounded-lg bg-white/50 border border-white/50">
                    <span className="text-[#6b5c55] text-xs">Staff ID:</span>
                    <p className="text-[#3c2b21] font-medium">{item.staff_id}</p>
                  </div>
                )}
                {item.changed_by && (
                  <div className="p-3 rounded-lg bg-white/50 border border-white/50">
                    <span className="text-[#6b5c55] text-xs">Changed By:</span>
                    <p className="text-[#3c2b21] font-medium">{item.changed_by}</p>
                  </div>
                )}
                <div className="p-3 rounded-lg bg-white/50 border border-white/50">
                  <span className="text-[#6b5c55] text-xs">Created At:</span>
                  <p className="text-[#3c2b21] font-medium">{createdDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-white/50 border-t border-white/50 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#3c2b21] to-[#5f4b5a] text-white font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Close
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HistoryMoreInfoModal;

