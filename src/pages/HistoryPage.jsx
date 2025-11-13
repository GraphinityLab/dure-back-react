/* eslint-disable no-unused-vars */
import React, {
  useEffect,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  RefreshCcw,
  History,
  AlertTriangle,
} from 'lucide-react';

import axiosInstance from '../../utils/axiosInstance';
import MessageBanner from '../components/appointments/MessageBanner';
import { setTimedMessage } from '../components/appointments/utils';
import HistoryList from '../components/history/HistoryList';
import HistoryMoreInfoModal from '../components/history/HistoryMoreInfoModal';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [modalData, setModalData] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/history');
      setHistory(res.data.history);
    } catch (err) {
      console.error(err);
      setTimedMessage(setMessage, 'Failed to load appointment history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (history_id) => {
    if (!window.confirm('Are you sure you want to delete this history record?')) return;

    try {
      setActionLoading(true);
      await axiosInstance.delete(`/history/${history_id}`);
      setTimedMessage(setMessage, 'History record deleted successfully', 'success');
      await fetchHistory();
    } catch (err) {
      console.error(err);
      setTimedMessage(setMessage, err?.response?.data?.message || 'Failed to delete history record', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="relative w-full py-12 px-4 sm:px-6 lg:px-8 text-[#3e2e3d] min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="h-12 w-72 rounded-2xl bg-white/40 backdrop-blur-sm animate-pulse" />
            <div className="h-12 w-96 rounded-2xl bg-white/40 backdrop-blur-sm animate-pulse" />
          </div>
          {/* Premium skeleton cards */}
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-2xl bg-gradient-to-r from-white/30 via-white/20 to-white/30 backdrop-blur-sm border border-white/30 animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-x-hidden w-full py-8 px-4 sm:px-6 lg:px-8 text-[#3e2e3d] min-h-screen box-border">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#c1a38f]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#a78974]/10 rounded-full blur-3xl" />
      </div>

      {/* Action loading overlay */}
      {actionLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-white/50 rounded-full animate-spin" style={{ animationDuration: '0.8s' }} />
          </div>
        </motion.div>
      )}

      <div className="relative max-w-7xl mx-auto z-10">
        {/* Premium Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl md:text-6xl font-[Soligant] tracking-tight bg-gradient-to-r from-[#3c2b21] via-[#5f4b5a] to-[#3c2b21] bg-clip-text text-transparent mb-2"
              >
                Appointment History
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-sm text-[#6b5c55] font-medium"
              >
                View and manage completed appointment records
              </motion.p>
            </div>

            {/* Stats Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/50 shadow-lg"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-[#3c2b21]">{history.length}</div>
                <div className="text-xs text-[#6b5c55] uppercase tracking-wider">Total Records</div>
              </div>
              <div className="h-12 w-px bg-[#e8dcd4]" />
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {history.filter(h => h.status?.toLowerCase() === 'completed').length}
                </div>
                <div className="text-xs text-[#6b5c55] uppercase tracking-wider">Completed</div>
              </div>
            </motion.div>
          </div>

          {/* Premium Action Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-end"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={fetchHistory}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#3c2b21] to-[#5f4b5a] text-white hover:from-[#5f4b5a] hover:to-[#3c2b21] transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
            >
              <RefreshCcw className="w-5 h-5" />
              <span>Refresh</span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Messages */}
        <AnimatePresence>{message && <MessageBanner message={message} setMessage={setMessage} />}</AnimatePresence>

        {/* Premium Content Area */}
        {history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-12 rounded-3xl bg-gradient-to-br from-white/60 via-white/40 to-white/20 backdrop-blur-xl border border-white/50 shadow-[0_20px_60px_rgba(60,43,33,0.15)] p-16 text-center"
          >
            <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200/50 mb-6">
              <History className="h-16 w-16 text-slate-600" />
            </div>
            <h3 className="text-3xl font-semibold text-[#3c2b21] mb-3">No History Found</h3>
            <p className="text-[#6b5c55] max-w-md mx-auto">
              There are no appointment history records yet. History will appear here once appointments are completed or cancelled.
            </p>
          </motion.div>
        ) : (
          <HistoryList
            history={history}
            onInfo={(item) => setModalData(item)}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Premium Modal */}
      <AnimatePresence>
        {modalData && (
          <HistoryMoreInfoModal
            item={modalData}
            onClose={() => setModalData(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default HistoryPage;
