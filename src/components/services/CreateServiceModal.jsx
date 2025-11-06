/* eslint-disable no-unused-vars */
import React, { useState } from 'react';

import { motion } from 'framer-motion';

import axiosInstance from '../../../utils/axiosInstance';
import { setTimedMessage } from '../appointments/utils';

const CreateServiceModal = ({ onClose, onSuccess, setMessage }) => {
  const [formData, setFormData] = useState({
    name: "",
    duration_minutes: "",
    price: "",
    category: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.duration_minutes || !formData.price) {
      setTimedMessage(setMessage, "Please fill all required fields.", "error");
      return;
    }
    try {
      setLoading(true);
      await axiosInstance.post("/services", formData);
      setTimedMessage(setMessage, "Service created successfully!", "success");
      onSuccess();
    } catch (err) {
      console.error("createService error:", err);
      setTimedMessage(
        setMessage,
        err.response?.data?.message || "Failed to create service.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 w-full max-w-lg shadow-lg text-[#3e2e3d] font-[CaviarDreams]"
      >
        <h2 className="text-2xl font-[Soligant] mb-4 text-center">
          Create New Service
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              className="px-4 py-2 rounded-lg bg-[#3e2e3d] text-white hover:bg-[#5f4b5a] transition"
            >
              {loading ? "Saving..." : "Create"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CreateServiceModal;
