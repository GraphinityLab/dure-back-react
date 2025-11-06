/* eslint-disable no-unused-vars */
import React from 'react';

import { motion } from 'framer-motion';

const StaffMoreInfoModal = ({ staff, onClose }) => (
  <motion.div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
  >
    <motion.div
      className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-[#e8dcd4]/60 p-6 max-w-md w-full text-[#3e2e3d] font-[CaviarDreams]"
      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 15 }}
    >
      <h3 className="text-2xl font-[Soligant] mb-4">{staff.first_name} {staff.last_name}</h3>
      <div className="text-sm text-[#5f4b5a] space-y-1">
        <p><strong>Username:</strong> {staff.username}</p>
        <p><strong>Email:</strong> {staff.email}</p>
        <p><strong>Role ID:</strong> {staff.role_id}</p>
        {staff.phone_number && <p><strong>Phone:</strong> {staff.phone_number}</p>}
        {staff.address && <p><strong>Address:</strong> {staff.address}, {staff.city}, {staff.province} {staff.postal_code}</p>}
      </div>

      <div className="flex justify-end mt-6">
        <button onClick={onClose} className="px-5 py-2.5 rounded-full bg-[#c1a38f] text-white hover:bg-[#a78974] transition font-semibold text-sm">
          Close
        </button>
      </div>
    </motion.div>
  </motion.div>
);

export default StaffMoreInfoModal;
