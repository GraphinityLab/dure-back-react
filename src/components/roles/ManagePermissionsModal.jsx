import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Key, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const ManagePermissionsModal = ({ role, allPermissions, onTogglePermission, onClose, loading }) => {
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
          className="relative w-full max-w-3xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-[#3c2b21] to-[#5f4b5a] p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white mb-1">
                  Manage Permissions
                </h2>
                <p className="text-white/80 text-sm">Role: {role.role_name}</p>
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
            {allPermissions && allPermissions.length > 0 ? (
              <div className="space-y-3">
                {allPermissions.map((perm) => {
                  const assigned = role.permissions?.some(
                    (p) => p.permission_id === perm.permission_id
                  );
                  
                  return (
                    <motion.div
                      key={perm.permission_id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`
                        p-4 rounded-xl border transition-all duration-200
                        ${assigned
                          ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200/50'
                          : 'bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200/50'
                        }
                        hover:shadow-md
                      `}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={`p-2 rounded-lg ${assigned ? 'bg-emerald-100/50' : 'bg-slate-100/50'}`}>
                            <Key className={`h-4 w-4 ${assigned ? 'text-emerald-600' : 'text-slate-400'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold text-sm ${assigned ? 'text-[#3c2b21]' : 'text-[#6b5c55]'}`}>
                              {perm.permission_name}
                            </p>
                            {perm.permission_description && (
                              <p className="text-xs text-[#6b5c55] mt-1">
                                {perm.permission_description}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onTogglePermission(role.role_id, perm.permission_id, assigned)}
                          disabled={loading}
                          className={`
                            relative p-3 rounded-xl border-2 transition-all duration-200 shrink-0
                            ${assigned
                              ? 'bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600'
                              : 'bg-white border-slate-300 text-slate-400 hover:border-slate-400 hover:text-slate-600'
                            }
                            ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                          `}
                          title={assigned ? 'Remove permission' : 'Add permission'}
                        >
                          {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : assigned ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <XCircle className="h-5 w-5" />
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200/50 mb-4">
                  <Shield className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-[#3c2b21] mb-2">
                  No Permissions Available
                </h3>
                <p className="text-sm text-[#6b5c55] max-w-md">
                  There are no permissions defined in the system.
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

export default ManagePermissionsModal;

