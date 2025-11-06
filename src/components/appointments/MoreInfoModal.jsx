/* eslint-disable no-unused-vars */
import React from 'react';

import { motion } from 'framer-motion';

import { formatDate } from './utils';

const MoreInfoModal = ({ appointment, onClose }) => (
  <motion.div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="relative w-full max-w-md p-6 bg-white/90 rounded-2xl shadow-xl border border-[#e8dcd4] text-[#3e2e3d] font-[CaviarDreams]"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
    >
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-[Soligant]">{appointment.serviceName}</h2>
        <button
          onClick={onClose}
          className="text-[#5f4b5a] hover:text-[#3e2e3d]"
        >
          ✖
        </button>
      </div>

      <div className="grid grid-cols-2 gap-y-2 text-sm">
        <div className="font-semibold">Client:</div>
        <div className="text-right">
          {appointment.clientFirstName} {appointment.clientLastName}
        </div>

        <div className="font-semibold">Date:</div>
        <div className="text-right">
          {formatDate(appointment.appointment_date)}
        </div>

        <div className="font-semibold">Time:</div>
        <div className="text-right">
          {appointment.startTime} - {appointment.endTime}
        </div>

        <div className="font-semibold">Category:</div>
        <div className="text-right">{appointment.serviceCategory}</div>

        <div className="font-semibold">Price:</div>
        <div className="text-right">
          ${Number(appointment.servicePrice || 0).toFixed(2)}
        </div>

        <div className="font-semibold">Duration:</div>
        <div className="text-right">
          {appointment.serviceDurationMinutes
            ? `${appointment.serviceDurationMinutes} mins`
            : "N/A"}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-semibold">Description</h3>
        <p className="text-sm text-[#5f4b5a]">
          {appointment.serviceDescription &&
          appointment.serviceDescription.trim() !== ""
            ? appointment.serviceDescription
            : "No description"}
        </p>
      </div>
      <div className="mt-6 text-right">
        <button
          onClick={onClose}
          className="px-6 py-2 rounded-full bg-[#3e2e3d] text-white hover:bg-[#5f4b5a] transition"
        >
          Close
        </button>
      </div>
    </motion.div>
  </motion.div>
);

export default MoreInfoModal;
