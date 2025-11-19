import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Key,
  Eye,
  Settings,
} from 'lucide-react';

const RoleCard = ({ role, onViewPermissions, onManagePermissions, index = 0 }) => {
  return (
    <motion.li
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`
        group relative w-full min-w-0 rounded-2xl p-5 mb-4
        bg-gradient-to-r from-amber-50 to-yellow-50
        border border-amber-200/60
        shadow-[0_0_20px_rgba(245,158,11,0.15)]
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
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/60 backdrop-blur-sm border border-white/40">
              <Shield className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-[#3c2b21] text-lg">
                {role.role_name || 'Unnamed Role'}
              </h3>
              {role.role_description && (
                <p className="text-sm text-[#6b5c55] mt-1">
                  {role.role_description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <motion.button
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onViewPermissions(role)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/70 hover:bg-white/90 backdrop-blur-sm border border-white/50 text-[#3c2b21] transition-all duration-200 shadow-sm hover:shadow-md font-medium text-sm"
            title="View Permissions"
          >
            <Eye className="h-4 w-4" />
            <span>View</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onManagePermissions(role)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-[#c1a38f] to-[#a78974] hover:from-[#a78974] hover:to-[#8d6f5a] text-white transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
            title="Manage Permissions"
          >
            <Settings className="h-4 w-4" />
            <span>Manage</span>
          </motion.button>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-50 to-yellow-50 opacity-50" />
    </motion.li>
  );
};

export default RoleCard;

