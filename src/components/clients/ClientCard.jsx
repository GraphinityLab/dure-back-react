import React from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  FileText,
  Edit2,
  Trash2,
  User,
} from 'lucide-react';

const ClientCard = ({ client, onEdit, onDelete, onMoreInfo, index = 0 }) => {
  const fullName = `${client.first_name || ''} ${client.last_name || ''}`.trim();
  const hasLocation = client.city || client.address;

  return (
    <motion.li
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`
        group relative w-full min-w-0 rounded-2xl p-5 mb-4
        bg-gradient-to-r from-blue-50 to-indigo-50
        border border-blue-200/60
        shadow-[0_0_20px_rgba(59,130,246,0.15)]
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
                  {fullName || 'Unnamed Client'}
                </h3>
              </div>
              
              {/* Contact Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {client.email && (
                  <div className="flex items-center gap-2 text-[#5f4b5a]">
                    <div className="p-1.5 rounded-lg bg-white/50 backdrop-blur-sm">
                      <Mail className="h-3.5 w-3.5 text-[#3c2b21]" />
                    </div>
                    <span className="font-medium truncate max-w-[200px]">{client.email}</span>
                  </div>
                )}
                {client.phone_number && (
                  <div className="flex items-center gap-2 text-[#5f4b5a]">
                    <div className="p-1.5 rounded-lg bg-white/50 backdrop-blur-sm">
                      <Phone className="h-3.5 w-3.5 text-[#3c2b21]" />
                    </div>
                    <span className="font-medium">{client.phone_number}</span>
                  </div>
                )}
                {hasLocation && (
                  <div className="flex items-center gap-2 text-[#5f4b5a]">
                    <div className="p-1.5 rounded-lg bg-white/50 backdrop-blur-sm">
                      <MapPin className="h-3.5 w-3.5 text-[#3c2b21]" />
                    </div>
                    <span className="font-medium text-xs">
                      {[client.city, client.address].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onMoreInfo(client)}
            className="p-2.5 rounded-xl bg-white/70 hover:bg-white/90 backdrop-blur-sm border border-white/50 text-[#3c2b21] transition-all duration-200 shadow-sm hover:shadow-md"
            title="View Details"
          >
            <FileText className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(client)}
            className="p-2.5 rounded-xl bg-gradient-to-br from-[#c1a38f] to-[#a78974] hover:from-[#a78974] hover:to-[#8d6f5a] text-white transition-all duration-200 shadow-md hover:shadow-lg"
            title="Edit Client"
          >
            <Edit2 className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(client)}
            className="p-2.5 rounded-xl bg-gradient-to-br from-rose-100 to-red-100 hover:from-rose-200 hover:to-red-200 text-rose-700 border border-rose-200/50 transition-all duration-200 shadow-sm hover:shadow-md"
            title="Delete Client"
          >
            <Trash2 className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-50" />
    </motion.li>
  );
};

export default ClientCard;
