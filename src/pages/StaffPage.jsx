/* eslint-disable no-unused-vars */
import React, {
  useEffect,
  useState,
} from 'react';

import {
  AnimatePresence,
  motion,
} from 'framer-motion';
import { RefreshCcw, Search as SearchIcon, X, Users, Plus, Download, Calendar } from 'lucide-react';

import axiosInstance from '../../utils/axiosInstance';
import MessageBanner from '../components/appointments/MessageBanner';
import { setTimedMessage } from '../components/appointments/utils';
import CreateStaffModal from '../components/staff/CreateStaffModal';
import DeleteStaffModal from '../components/staff/DeleteStaffModal';
import EditStaffModal from '../components/staff/EditStaffModal';
import ExportWorkHoursModal from '../components/staff/ExportWorkHoursModal';
import StaffList from '../components/staff/StaffList';
import StaffMoreInfoModal from '../components/staff/StaffMoreInfoModal';

const StaffPage = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportStaff, setExportStaff] = useState(null);
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await axiosInstance.get("/auth/check");
        const permissions = res.data?.user?.permissions || [];
        setIsAdmin(permissions.includes('staff_read_all'));
      } catch (err) {
        console.error('Failed to check admin status:', err);
      }
    };
    checkAdmin();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/staff");
      setStaff(res.data.staff);
    } catch (err) {
      console.error(err);
      setTimedMessage(setMessage, "Failed to load staff.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const filteredStaff = staff.filter((s) => {
    if (!s) return false;

    const first = s.first_name?.toLowerCase() || "";
    const last = s.last_name?.toLowerCase() || "";
    const username = s.username?.toLowerCase() || "";
    const email = s.email?.toLowerCase() || "";

    const query = searchQuery.toLowerCase();
    return (
      first.includes(query) ||
      last.includes(query) ||
      username.includes(query) ||
      email.includes(query)
    );
  });

  const handleDelete = async (staffMember) => {
    setSelectedStaff(staffMember);
    setShowDelete(true);
  };

  const confirmDelete = async () => {
    try {
      setActionLoading(true);
      await axiosInstance.delete(`/staff/delete/${selectedStaff.staff_id}`);
      setTimedMessage(setMessage, "Staff deleted successfully", "success");
      setShowDelete(false);
      await fetchStaff();
    } catch (err) {
      console.error(err);
      setTimedMessage(setMessage, "Failed to delete staff", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const onlineCount = staff.filter((s) => s?.online === 1 || s?.online === true).length;
  const totalCount = staff.length;

  // Auto-refresh staff list every 30 seconds to update online status
  useEffect(() => {
    const interval = setInterval(() => {
      if (!actionLoading) {
        fetchStaff();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [actionLoading]);

  // Export work hours
  const handleExportWorkHours = async (staffMember = null, startDate = null, endDate = null) => {
    try {
      setActionLoading(true);
      const params = new URLSearchParams();
      if (staffMember) {
        params.append('staff_id', staffMember.staff_id);
      }
      if (startDate) {
        params.append('start_date', startDate);
      }
      if (endDate) {
        params.append('end_date', endDate);
      }

      const response = await axiosInstance.get(`/clock/export?${params.toString()}`, {
        responseType: 'blob',
      });

      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const filename = staffMember 
        ? `work-hours-${staffMember.username}-${new Date().toISOString().split('T')[0]}.csv`
        : `work-hours-all-${new Date().toISOString().split('T')[0]}.csv`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setTimedMessage(setMessage, `Work hours exported successfully`, 'success');
      setShowExportModal(false);
      setExportStaff(null);
      setExportStartDate("");
      setExportEndDate("");
    } catch (err) {
      console.error('Export error:', err);
      setTimedMessage(setMessage, err?.response?.data?.message || 'Failed to export work hours', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const openExportModal = (staffMember = null) => {
    setExportStaff(staffMember);
    setShowExportModal(true);
  };

  return (
    <section className="relative overflow-x-hidden w-full py-8 px-4 sm:px-6 lg:px-8 text-[#3e2e3d] min-h-screen box-border">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-violet-200/10 rounded-full blur-3xl" />
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
                Staff
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-sm text-[#6b5c55] font-medium"
              >
                Manage your team members and staff accounts
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
                <div className="text-2xl font-bold text-[#3c2b21]">{staff.length}</div>
                <div className="text-xs text-[#6b5c55] uppercase tracking-wider">Total</div>
              </div>
              <div className="h-12 w-px bg-[#e8dcd4]" />
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{onlineCount}</div>
                <div className="text-xs text-[#6b5c55] uppercase tracking-wider">Online</div>
              </div>
              <div className="h-12 w-px bg-[#e8dcd4]" />
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{filteredStaff.length}</div>
                <div className="text-xs text-[#6b5c55] uppercase tracking-wider">Showing</div>
              </div>
            </motion.div>
          </div>

          {/* Premium Search and Filters Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col md:flex-row gap-3 w-full mb-4"
          >
            <div className="relative flex-1 group">
              <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/60 rounded-2xl blur-sm group-hover:blur-md transition-all duration-300" />
              <div className="relative flex items-center">
                <div className="absolute left-4 p-2 rounded-lg bg-white/50 backdrop-blur-sm">
                  <SearchIcon className="h-5 w-5 text-[#6b5c55]" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name, username, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-12 py-3.5 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 focus:outline-none focus:ring-2 focus:ring-[#c1a38f]/50 focus:border-[#c1a38f] text-sm md:text-base placeholder:text-[#9b8a83] shadow-lg transition-all duration-300"
                />
                {searchQuery && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Clear search"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 p-1.5 rounded-lg bg-white/60 hover:bg-white/80 backdrop-blur-sm transition-colors"
                  >
                    <X className="h-4 w-4 text-[#6b5c55]" />
                  </motion.button>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              {isAdmin && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openExportModal(null)}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
                >
                  <Download className="w-5 h-5" />
                  <span className="hidden sm:inline">Export All Hours</span>
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={fetchStaff}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#3c2b21] to-[#5f4b5a] text-white hover:from-[#5f4b5a] hover:to-[#3c2b21] transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
              >
                <RefreshCcw className="w-5 h-5" />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#c1a38f] to-[#a78974] hover:from-[#a78974] hover:to-[#8d6f5a] text-white transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">New Staff</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* Messages */}
        <AnimatePresence>
          {message && (
            <MessageBanner message={message} setMessage={setMessage} />
          )}
        </AnimatePresence>

        {/* Premium Content Area */}
        {loading ? (
          <div className="w-full rounded-3xl bg-gradient-to-br from-white/60 via-white/40 to-white/20 backdrop-blur-xl border border-white/50 shadow-[0_20px_60px_rgba(60,43,33,0.15)] p-16">
            <div className="flex flex-col items-center justify-center">
              <div className="relative mb-4">
                <div className="w-16 h-16 border-4 border-[#c1a38f]/30 border-t-[#c1a38f] rounded-full animate-spin" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-[#a78974]/50 rounded-full animate-spin" style={{ animationDuration: '0.8s' }} />
              </div>
              <p className="text-[#6b5c55] font-medium">Loading staff...</p>
            </div>
          </div>
        ) : filteredStaff.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-12 rounded-3xl bg-gradient-to-br from-white/60 via-white/40 to-white/20 backdrop-blur-xl border border-white/50 shadow-[0_20px_60px_rgba(60,43,33,0.15)] p-16 text-center"
          >
            <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200/50 mb-6">
              <Users className="h-16 w-16 text-purple-600" />
            </div>
            <h3 className="text-3xl font-semibold text-[#3c2b21] mb-3">No Staff Found</h3>
            <p className="text-[#6b5c55] max-w-md mx-auto mb-6">
              {searchQuery
                ? "No staff members match your search criteria. Try adjusting your search."
                : "You don't have any staff members yet. Add one to get started!"}
            </p>
            <div className="flex justify-center gap-3">
              {searchQuery && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchQuery("")}
                  className="px-6 py-3 rounded-xl bg-white/70 backdrop-blur-xl border border-white/50 text-[#3c2b21] font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Clear Search
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreate(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#c1a38f] to-[#a78974] text-white font-medium shadow-lg hover:shadow-xl transition-all"
              >
                Add Staff
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <StaffList
            staffArray={filteredStaff}
            onEdit={(staff) => {
              setSelectedStaff(staff);
              setShowEdit(true);
            }}
            onDelete={handleDelete}
            onMoreInfo={(staff) => {
              setSelectedStaff(staff);
              setShowInfo(true);
            }}
            onExport={isAdmin ? (staff) => openExportModal(staff) : null}
          />
        )}
      </div>

      <AnimatePresence>
        {showCreate && (
          <CreateStaffModal
            onClose={() => setShowCreate(false)}
            onSuccess={fetchStaff}
            setMessage={setMessage}
          />
        )}
        {showEdit && (
          <EditStaffModal
            staff={selectedStaff}
            onClose={() => setShowEdit(false)}
            onSuccess={fetchStaff}
            setMessage={setMessage}
          />
        )}
        {showDelete && (
          <DeleteStaffModal
            staff={selectedStaff}
            onCancel={() => setShowDelete(false)}
            onConfirm={confirmDelete}
          />
        )}
        {showInfo && selectedStaff && (
          <StaffMoreInfoModal
            staff={selectedStaff}
            onClose={() => setShowInfo(false)}
            isAdmin={isAdmin}
          />
        )}
        {showExportModal && (
          <ExportWorkHoursModal
            staff={exportStaff}
            startDate={exportStartDate}
            endDate={exportEndDate}
            onStartDateChange={setExportStartDate}
            onEndDateChange={setExportEndDate}
            onExport={() => handleExportWorkHours(exportStaff, exportStartDate || null, exportEndDate || null)}
            onClose={() => {
              setShowExportModal(false);
              setExportStaff(null);
              setExportStartDate("");
              setExportEndDate("");
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default StaffPage;
