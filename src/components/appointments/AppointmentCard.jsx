import React from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  FileText,
  Tag,
  Trash2,
  User,
  Edit2,
  Sparkles,
} from 'lucide-react';

import { formatDate } from './utils';

const getStatusConfig = (status) => {
  const configs = {
    confirmed: {
      bg: 'bg-gradient-to-r from-emerald-50 to-green-50',
      border: 'border-emerald-200/60',
      text: 'text-emerald-700',
      badge: 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
      icon: '✓',
    },
    declined: {
      bg: 'bg-gradient-to-r from-rose-50 to-red-50',
      border: 'border-rose-200/60',
      text: 'text-rose-700',
      badge: 'bg-rose-500/10 text-rose-700 border-rose-200/50',
      glow: 'shadow-[0_0_20px_rgba(244,63,94,0.15)]',
      icon: '✕',
    },
    pending: {
      bg: 'bg-gradient-to-r from-amber-50 to-yellow-50',
      border: 'border-amber-200/60',
      text: 'text-amber-700',
      badge: 'bg-amber-500/10 text-amber-700 border-amber-200/50',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
      icon: '⏱',
    },
    completed: {
      bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
      border: 'border-blue-200/60',
      text: 'text-blue-700',
      badge: 'bg-blue-500/10 text-blue-700 border-blue-200/50',
      glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]',
      icon: '✓',
    },
  };
  return configs[status?.toLowerCase()] || configs.pending;
};

const AppointmentCard = ({ appointment, onEdit, onInfo, onDelete, index = 0 }) => {
  const statusConfig = getStatusConfig(appointment.status);
  const isUpcoming = new Date(`${appointment.appointment_date}T${appointment.startTime}`) > new Date();

  return (
    <motion.li
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`
        group relative w-full min-w-0 rounded-2xl p-5 mb-4
        ${statusConfig.bg} ${statusConfig.border} border
        ${statusConfig.glow}
        backdrop-blur-sm
        hover:scale-[1.02] hover:shadow-xl
        transition-all duration-300 ease-out
        overflow-hidden
      `}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Main Info */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-lg bg-white/60 backdrop-blur-sm border border-white/40">
                  <User className="h-4 w-4 text-[#3c2b21]" />
                </div>
                <h3 className="font-semibold text-[#3c2b21] text-base truncate">
                  {appointment.clientName}
                </h3>
                {isUpcoming && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/70 text-xs font-medium text-[#3c2b21] border border-white/50"
                  >
                    <Sparkles className="h-3 w-3" />
                    Upcoming
                  </motion.span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-[#5f4b5a]">
                <Tag className="h-3.5 w-3.5" />
                <span className="font-medium">{appointment.serviceName}</span>
                {appointment.servicePrice > 0 && (
                  <>
                    <span className="text-[#9b8a83]">•</span>
                    <span className="font-semibold text-[#3c2b21]">
                      ${appointment.servicePrice.toFixed(2)}
                    </span>
                  </>
                )}
              </div>
            </div>
            
            {/* Status Badge */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`
                px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider
                ${statusConfig.badge} border backdrop-blur-sm
                flex items-center gap-1.5 shrink-0
              `}
            >
              <span>{statusConfig.icon}</span>
              <span>{appointment.status}</span>
            </motion.div>
          </div>

          {/* Date & Time Row */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-[#5f4b5a]">
              <div className="p-1.5 rounded-lg bg-white/50 backdrop-blur-sm">
                <Calendar className="h-3.5 w-3.5 text-[#3c2b21]" />
              </div>
              <span className="font-medium">
                {formatDate(appointment.appointment_date)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#5f4b5a]">
              <div className="p-1.5 rounded-lg bg-white/50 backdrop-blur-sm">
                <Clock className="h-3.5 w-3.5 text-[#3c2b21]" />
              </div>
              <span className="font-medium">
                {appointment.startTime} - {appointment.endTime}
              </span>
            </div>
            {appointment.serviceDurationMinutes && (
              <div className="text-xs text-[#9b8a83]">
                {appointment.serviceDurationMinutes} min
              </div>
            )}
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onInfo(appointment)}
            className="p-2.5 rounded-xl bg-white/70 hover:bg-white/90 backdrop-blur-sm border border-white/50 text-[#3c2b21] transition-all duration-200 shadow-sm hover:shadow-md"
            title="View Details"
          >
            <FileText className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(appointment)}
            className="p-2.5 rounded-xl bg-gradient-to-br from-[#c1a38f] to-[#a78974] hover:from-[#a78974] hover:to-[#8d6f5a] text-white transition-all duration-200 shadow-md hover:shadow-lg"
            title="Edit Appointment"
          >
            <Edit2 className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(appointment.id)}
            className="p-2.5 rounded-xl bg-gradient-to-br from-rose-100 to-red-100 hover:from-rose-200 hover:to-red-200 text-rose-700 border border-rose-200/50 transition-all duration-200 shadow-sm hover:shadow-md"
            title="Delete Appointment"
          >
            <Trash2 className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${statusConfig.bg} opacity-50`} />
    </motion.li>
  );
};

export default AppointmentCard;
