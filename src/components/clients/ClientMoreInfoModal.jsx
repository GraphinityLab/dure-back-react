/* eslint-disable no-unused-vars */
import React from 'react';

import { motion } from 'framer-motion';

const ClientMoreInfoModal = ({ client, onClose }) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full shadow-lg font-[CaviarDreams] text-[#3e2e3d]"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 15 }}
      >
        <h2 className="text-2xl font-[Soligant] text-center mb-4">Client Details</h2>
        <div className="flex flex-col gap-2 text-sm">
          <p><strong>First Name:</strong> {client.first_name}</p>
          <p><strong>Last Name:</strong> {client.last_name}</p>
          <p><strong>Email:</strong> {client.email}</p>
          <p><strong>Phone:</strong> {client.phone_number}</p>
          {client.address && <p><strong>Address:</strong> {client.address}</p>}
          {client.city && <p><strong>City:</strong> {client.city}</p>}
          {client.postal_code && <p><strong>Postal Code:</strong> {client.postal_code}</p>}
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#c1a38f] hover:bg-[#f5eeee] transition"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ClientMoreInfoModal;
