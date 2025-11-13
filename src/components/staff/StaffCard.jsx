import React from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  UserCircle,
  FileText,
  Edit2,
  Trash2,
  Download,
} from 'lucide-react';

const StaffCard = ({ staff, onEdit, onDelete, onMoreInfo, onExport, index = 0 }) => {
  if (!staff) return null;

  const fullName = `${staff.first_name || ""} ${staff.last_name || ""}`.trim() || "Unnamed Staff";
  const isOnline = staff.online === 1 || staff.online === true;

  return (
    <motion.li
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`
        group relative w-full min-w-0 rounded-2xl p-5 mb-4
        bg-gradient-to-r from-purple-50 to-violet-50
        border border-purple-200/60
        shadow-[0_0_20px_rgba(147,51,234,0.15)]
        backdrop-blur-sm
        hover:scale-[1.02] hover:shadow-xl
        transition-all duration-300 ease-out
        overflow-hidden
      `}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Online status indicator */}
      <div className={`absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-sm border ${
        isOnline 
          ? 'bg-emerald-100/80 border-emerald-200/50' 
          : 'bg-gray-100/80 border-gray-200/50'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          isOnline 
            ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]' 
            : 'bg-gray-400'
        }`} />
        <span className={`text-xs font-medium ${
          isOnline ? 'text-emerald-700' : 'text-gray-600'
        }`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
      
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
                  {fullName}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#5f4b5a]">
                <UserCircle className="h-3.5 w-3.5" />
                <span className="font-medium truncate">{staff.username || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Email Row */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-[#5f4b5a] min-w-0">
              <div className="p-1.5 rounded-lg bg-white/50 backdrop-blur-sm shrink-0">
                <Mail className="h-3.5 w-3.5 text-purple-600" />
              </div>
              <span className="font-medium truncate">{staff.email || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {onExport && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onExport(staff)}
              className="p-2.5 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-blue-700 border border-blue-200/50 transition-all duration-200 shadow-sm hover:shadow-md"
              title="Export Work Hours"
            >
              <Download className="h-4 w-4" />
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onMoreInfo(staff)}
            className="p-2.5 rounded-xl bg-white/70 hover:bg-white/90 backdrop-blur-sm border border-white/50 text-[#3c2b21] transition-all duration-200 shadow-sm hover:shadow-md"
            title="View Details"
          >
            <FileText className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(staff)}
            className="p-2.5 rounded-xl bg-gradient-to-br from-[#c1a38f] to-[#a78974] hover:from-[#a78974] hover:to-[#8d6f5a] text-white transition-all duration-200 shadow-md hover:shadow-lg"
            title="Edit Staff"
          >
            <Edit2 className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(staff)}
            className="p-2.5 rounded-xl bg-gradient-to-br from-rose-100 to-red-100 hover:from-rose-200 hover:to-red-200 text-rose-700 border border-rose-200/50 transition-all duration-200 shadow-sm hover:shadow-md"
            title="Delete Staff"
          >
            <Trash2 className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-50 to-violet-50 opacity-50" />
    </motion.li>
  );
};

export default StaffCard;
