import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Calendar, User } from 'lucide-react';

const ExportWorkHoursModal = ({
  staff,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onExport,
  onClose,
}) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-gradient-to-br from-white/90 via-white/80 to-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 max-w-md w-full text-[#3e2e3d] font-[CaviarDreams]"
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 15 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200/50">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-[Soligant] text-[#3c2b21]">
                Export Work Hours
              </h3>
              {staff && (
                <p className="text-sm text-[#6b5c55] mt-1 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {staff.first_name} {staff.last_name}
                </p>
              )}
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

        {/* Date Range Selection */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-[#3c2b21] mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Start Date (Optional)
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm shadow-lg transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#3c2b21] mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              End Date (Optional)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              min={startDate || undefined}
              className="w-full px-4 py-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm shadow-lg transition-all"
            />
          </div>

          <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/50">
            <p className="text-xs text-[#6b5c55]">
              {!startDate && !endDate
                ? "Leave dates empty to export all work hours"
                : startDate && endDate
                ? `Exporting hours from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
                : startDate
                ? `Exporting hours from ${new Date(startDate).toLocaleDateString()} onwards`
                : `Exporting hours up to ${new Date(endDate).toLocaleDateString()}`}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 text-[#3c2b21] hover:bg-white/80 transition font-semibold text-sm shadow-lg"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onExport}
            className="flex-1 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transition font-semibold text-sm shadow-lg flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ExportWorkHoursModal;

