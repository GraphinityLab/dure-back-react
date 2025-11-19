import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, UserCheck, TrendingUp, Clock, Package, History, FileText } from 'lucide-react';

const OverviewPage = () => {
  return (
    <div className="relative w-full py-8 px-4 sm:px-6 lg:px-8 text-[#3e2e3d] min-h-screen">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#c1a38f]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#a78974]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto z-10">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-[Soligant] tracking-tight bg-gradient-to-r from-[#3c2b21] via-[#5f4b5a] to-[#3c2b21] bg-clip-text text-transparent mb-2"
          >
            Dashboard Overview
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-[#6b5c55] font-medium"
          >
            Welcome to your salon management dashboard
          </motion.p>
        </motion.div>

        {/* Quick Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="rounded-2xl bg-gradient-to-br from-white/60 via-white/40 to-white/20 backdrop-blur-xl border border-white/50 shadow-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-blue-100/80 border border-blue-300/50">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-[#6b5c55] uppercase tracking-wider">Appointments</div>
                <div className="text-2xl font-bold text-[#3c2b21]">Manage</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-white/60 via-white/40 to-white/20 backdrop-blur-xl border border-white/50 shadow-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-emerald-100/80 border border-emerald-300/50">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs text-[#6b5c55] uppercase tracking-wider">Clients</div>
                <div className="text-2xl font-bold text-[#3c2b21]">Manage</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-white/60 via-white/40 to-white/20 backdrop-blur-xl border border-white/50 shadow-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-purple-100/80 border border-purple-300/50">
                <UserCheck className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-xs text-[#6b5c55] uppercase tracking-wider">Staff</div>
                <div className="text-2xl font-bold text-[#3c2b21]">Manage</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-white/60 via-white/40 to-white/20 backdrop-blur-xl border border-white/50 shadow-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-amber-100/80 border border-amber-300/50">
                <Package className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="text-xs text-[#6b5c55] uppercase tracking-wider">Services</div>
                <div className="text-2xl font-bold text-[#3c2b21]">Manage</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-3xl bg-gradient-to-br from-white/60 via-white/40 to-white/20 backdrop-blur-xl border border-white/50 shadow-[0_20px_60px_rgba(60,43,33,0.15)] p-8"
        >
          <div className="text-center">
            <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-[#c1a38f]/20 to-[#a78974]/20 border border-[#c1a38f]/30 mb-6">
              <TrendingUp className="h-16 w-16 text-[#3c2b21]" />
            </div>
            <h2 className="text-3xl font-semibold text-[#3c2b21] mb-3">
              Welcome to Duré Aesthetics Staff Panel
            </h2>
            <p className="text-[#6b5c55] max-w-2xl mx-auto mb-6">
              Your comprehensive salon management system. Use the navigation menu to access appointments, 
              clients, staff management, and more. Metrics are displayed above for quick insights.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-[#6b5c55]">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Schedule Appointments</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Manage Clients</span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                <span>Track Staff</span>
              </div>
              <div className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span>View History</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OverviewPage;

