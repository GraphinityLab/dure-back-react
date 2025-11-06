/* eslint-disable no-unused-vars */
import React, { useState } from 'react';

import { motion } from 'framer-motion';

import axiosInstance from '../../../utils/axiosInstance';
import { setTimedMessage } from '../appointments/utils';

const EditServiceModal = ({ service, onClose, onSuccess, setMessage }) => {
  const [formData, setFormData] = useState({
    name: service.name || "",
    duration_minutes: service.duration_minutes || "",
    price: service.price || "",
    category: service.category || "",
    description: service.description || "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.duration_minutes || !formData.price) {
      setTimedMessage(setMessage, "Please fill all required fields.", "error");
      return;
    }
    try {
      setLoading(true);
      await axiosInstance.put(`/services/${service.id}`, formData);
      setTimedMessage(setMessage, "Service updated successfully!", "success");
      onSuccess();
    } catch (err) {
      console.error("updateService error:", err);
      setTimedMessage(
        setMessage,
        err.response?.data?.message || "Failed to update service.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
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
          <h3 className="text-2xl font-[Soligant]">Edit Service</h3>
          <button
            onClick={onClose}
            className="text-[#5f4b5a] hover:text-[#3e2e3d]"
          >
            ✖
          </button>
        </div>

        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <input
            type="text"
            name="name"
            placeholder="Service Name *"
            value={formData.name}
            onChange={handleChange}
            className="px-4 py-2 border border-[#c1a38f]/40 rounded-lg focus:ring-2 focus:ring-[#c1a38f] outline-none bg-white/70"
          />
          <input
            type="number"
            name="duration_minutes"
            placeholder="Duration (minutes) *"
            value={formData.duration_minutes}
            onChange={handleChange}
            className="px-4 py-2 border border-[#c1a38f]/40 rounded-lg focus:ring-2 focus:ring-[#c1a38f] outline-none bg-white/70"
          />
          <input
            type="number"
            step="0.01"
            name="price"
            placeholder="Price *"
            value={formData.price}
            onChange={handleChange}
            className="px-4 py-2 border border-[#c1a38f]/40 rounded-lg focus:ring-2 focus:ring-[#c1a38f] outline-none bg-white/70"
          />
          <input
            type="text"
            name="category"
            placeholder="Category (optional)"
            value={formData.category}
            onChange={handleChange}
            className="px-4 py-2 border border-[#c1a38f]/40 rounded-lg focus:ring-2 focus:ring-[#c1a38f] outline-none bg-white/70"
          />
          <textarea
            name="description"
            placeholder="Description (optional)"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="px-4 py-2 border border-[#c1a38f]/40 rounded-lg focus:ring-2 focus:ring-[#c1a38f] outline-none bg-white/70 resize-none"
          />

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-[#c1a38f] text-white hover:bg-[#a78974] transition"
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditServiceModal;
