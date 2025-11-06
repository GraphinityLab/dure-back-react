/* eslint-disable no-unused-vars */
import React from 'react';

import { motion } from 'framer-motion';
import {
  FaAlignLeft,
  FaClock,
  FaDollarSign,
  FaLayerGroup,
} from 'react-icons/fa';

const ServiceMoreInfoModal = ({ service, onClose }) => (
  <motion.div
    className="fixed inset-0 z-10000 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="relative w-full max-w-md p-6 bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-[#e8dcd4]/40 text-[#3e2e3d] font-[CaviarDreams]"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 15 }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl md:text-3xl font-[Soligant] truncate">
          {service.name}
        </h2>
        <button
          onClick={onClose}
          className="text-[#3e2e3d]/70 hover:text-[#3e2e3d] text-lg transition"
        >
          ✖
        </button>
      </div>

      {/* Details Section */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center border-b border-[#e8dcd4]/50 pb-2">
          <div className="flex items-center gap-2 font-semibold">
            <FaLayerGroup className="text-[#c1a38f]" /> Category
          </div>
          <span className="text-right truncate">{service.category || "N/A"}</span>
        </div>

        <div className="flex justify-between items-center border-b border-[#e8dcd4]/50 pb-2">
          <div className="flex items-center gap-2 font-semibold">
            <FaDollarSign className="text-[#a78974]" /> Price
          </div>
          <span className="text-right truncate">
            ${Number(service.price || 0).toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-center border-b border-[#e8dcd4]/50 pb-2">
          <div className="flex items-center gap-2 font-semibold">
            <FaClock className="text-[#5f4b5a]" /> Duration
          </div>
          <span className="text-right truncate">
            {service.duration_minutes ? `${service.duration_minutes} mins` : "N/A"}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-1 font-semibold">
          <FaAlignLeft className="text-[#c1a38f]" /> Description
        </div>
        <p className="text-sm text-[#5f4b5a] bg-white/50 rounded-xl p-3 border border-[#e8dcd4]/40 min-h-[60px]">
          {service.description && service.description.trim() !== ""
            ? service.description
            : "No description provided for this service."}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center">
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2.5 rounded-full bg-[#c1a38f] text-white hover:bg-[#a78974] shadow-sm transition font-[CaviarDreams] text-sm"
        >
          Close
        </motion.button>
      </div>
    </motion.div>
  </motion.div>
);

export default ServiceMoreInfoModal;
