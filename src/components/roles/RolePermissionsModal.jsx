import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Key, CheckCircle2 } from 'lucide-react';

const RolePermissionsModal = ({ role, onClose }) => {
  if (!role) return null;

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
          className="relative w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-[#3c2b21] to-[#5f4b5a] p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white mb-1">
                  {role.role_name} Permissions
                </h2>
                <p className="text-white/80 text-sm">View all assigned permissions</p>
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
          <div className="p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-[#c1a38f]/60 scrollbar-track-transparent flex-1">
            {role.permissions && role.permissions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {role.permissions.map((perm) => (
                  <motion.div
                    key={perm.permission_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200/50 flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-emerald-100/50">
                      <Key className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#3c2b21] text-sm">
                        {perm.permission_name}
                      </p>
                      {perm.permission_description && (
                        <p className="text-xs text-[#6b5c55] mt-1">
                          {perm.permission_description}
                        </p>
                      )}
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200/50 mb-4">
                  <Shield className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-[#3c2b21] mb-2">
                  No Permissions Assigned
                </h3>
                <p className="text-sm text-[#6b5c55] max-w-md">
                  This role doesn't have any permissions assigned yet. Use "Manage Permissions" to add them.
                </p>
              </div>
            )}
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

export default RolePermissionsModal;

