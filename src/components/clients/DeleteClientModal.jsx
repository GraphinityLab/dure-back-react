/* eslint-disable no-unused-vars */
import React from 'react';

import { motion } from 'framer-motion';

const DeleteClientModal = ({ client, onCancel, onConfirm }) => (
  <motion.div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-[#e8dcd4]/60 p-6 max-w-md w-full text-[#3e2e3d] font-[CaviarDreams]"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 15 }}
    >
      <h3 className="text-2xl font-[Soligant] mb-4">
        Delete Client
      </h3>
      <p className="text-sm text-[#5f4b5a] mb-6">
        Are you sure you want to delete{" "}
        <span className="font-semibold">{client?.first_name} {client?.last_name}</span>? This action cannot be undone.
      </p>

      <div className="flex justify-end gap-4">
        <button
          onClick={onCancel}
          className="px-5 py-2.5 rounded-full bg-white border border-[#d8c9c9] text-[#3e2e3d] hover:bg-[#f5eeee] transition font-semibold text-sm"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-5 py-2.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition font-semibold text-sm"
        >
          Delete
        </button>
      </div>
    </motion.div>
  </motion.div>
);

export default DeleteClientModal;
