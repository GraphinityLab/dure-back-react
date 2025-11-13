import React from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  DollarSign,
  Tag,
  FileText,
  Edit2,
  Trash2,
} from 'lucide-react';

const ServiceCard = ({ service, onEdit, onDelete, onMoreInfo, index = 0 }) => {
  const formatDuration = (minutes) => {
    if (!minutes) return "0m";
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  return (
    <motion.li
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`
        group relative w-full min-w-0 rounded-2xl p-5 mb-4
        bg-gradient-to-r from-teal-50 to-cyan-50
        border border-teal-200/60
        shadow-[0_0_20px_rgba(20,184,166,0.15)]
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
                  <Tag className="h-4 w-4 text-[#3c2b21]" />
                </div>
                <h3 className="font-semibold text-[#3c2b21] text-base truncate">
                  {service.name || 'Unnamed Service'}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#5f4b5a]">
                <Tag className="h-3.5 w-3.5" />
                <span className="font-medium">{service.category || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Price & Duration Row */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-[#5f4b5a]">
              <div className="p-1.5 rounded-lg bg-white/50 backdrop-blur-sm">
                <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <span className="font-semibold text-[#3c2b21]">
                ${Number(service.price || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#5f4b5a]">
              <div className="p-1.5 rounded-lg bg-white/50 backdrop-blur-sm">
                <Clock className="h-3.5 w-3.5 text-[#3c2b21]" />
              </div>
              <span className="font-medium">
                {formatDuration(service.duration_minutes)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onMoreInfo(service)}
            className="p-2.5 rounded-xl bg-white/70 hover:bg-white/90 backdrop-blur-sm border border-white/50 text-[#3c2b21] transition-all duration-200 shadow-sm hover:shadow-md"
            title="View Details"
          >
            <FileText className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(service)}
            className="p-2.5 rounded-xl bg-gradient-to-br from-[#c1a38f] to-[#a78974] hover:from-[#a78974] hover:to-[#8d6f5a] text-white transition-all duration-200 shadow-md hover:shadow-lg"
            title="Edit Service"
          >
            <Edit2 className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(service.id)}
            className="p-2.5 rounded-xl bg-gradient-to-br from-rose-100 to-red-100 hover:from-rose-200 hover:to-red-200 text-rose-700 border border-rose-200/50 transition-all duration-200 shadow-sm hover:shadow-md"
            title="Delete Service"
          >
            <Trash2 className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-50" />
    </motion.li>
  );
};

export default ServiceCard;
