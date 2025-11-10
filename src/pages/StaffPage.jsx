/* eslint-disable no-unused-vars */
import React, {
  useEffect,
  useState,
} from 'react';

import {
  AnimatePresence,
  motion,
} from 'framer-motion';
import { RefreshCcw } from 'lucide-react';

import axiosInstance from '../../utils/axiosInstance';
import MessageBanner from '../components/appointments/MessageBanner';
import { setTimedMessage } from '../components/appointments/utils';
import CreateStaffModal from '../components/staff/CreateStaffModal';
import DeleteStaffModal from '../components/staff/DeleteStaffModal';
import EditStaffModal from '../components/staff/EditStaffModal';
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

  return (
    <section className="relative overflow-x-hidden w-full py-20 px-4 sm:px-6 lg:px-8 text-[#3e2e3d] min-h-screen box-border">
      {actionLoading && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50">
          <div className="w-14 h-14 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="relative max-w-6xl mx-auto z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 w-full">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-[Soligant] tracking-tight truncate"
          >
            Staff
          </motion.h1>

          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search by name, username, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-[#e8dcd4] focus:outline-none focus:ring-2 focus:ring-[#c1a38f] text-sm md:text-base"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchStaff}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3e2e3d] text-white hover:bg-[#5f4b5a] transition shadow"
            >
              <RefreshCcw className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#c1a38f] text-white hover:bg-[#a78974] transition shadow"
            >
              + New Staff
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {message && (
            <MessageBanner message={message} setMessage={setMessage} />
          )}
        </AnimatePresence>

        {loading ? (
          <div className="w-full flex justify-center mt-12">
            <div className="w-14 h-14 border-4 border-[#c1a38f] border-t-transparent rounded-full animate-spin"></div>
          </div>
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
        {showInfo && (
          <StaffMoreInfoModal
            staff={selectedStaff}
            onClose={() => setShowInfo(false)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default StaffPage;
