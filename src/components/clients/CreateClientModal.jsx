/* eslint-disable no-unused-vars */
import React, { useState } from 'react';

import { motion } from 'framer-motion';

import axiosInstance from '../../../utils/axiosInstance';
import { setTimedMessage } from '../appointments/utils';

const CreateClientModal = ({ onClose, onSuccess, setMessage }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address: "",
    city: "",
    postal_code: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone_number) {
      setTimedMessage(setMessage, "Please fill all required fields.", "error");
      return;
    }
    try {
      setLoading(true);
      await axiosInstance.post("/clients", formData);
      setTimedMessage(setMessage, "Client created successfully!", "success");
      onSuccess();
    } catch (err) {
      console.error("createClient error:", err);
      setTimedMessage(setMessage, err.response?.data?.message || "Failed to create client.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 max-w-lg w-full shadow-lg font-[CaviarDreams] text-[#3e2e3d]"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 15 }}
      >
        <h2 className="text-2xl font-[Soligant] text-center mb-4">Create New Client</h2>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              name="first_name"
              placeholder="First Name *"
              value={formData.first_name}
              onChange={handleChange}
              className="px-3 py-2 rounded-lg border border-[#c1a38f]/40 bg-white/70 focus:ring-2 focus:ring-[#c1a38f] outline-none"
            />
            <input
              type="text"
              name="last_name"
              placeholder="Last Name *"
              value={formData.last_name}
              onChange={handleChange}
              className="px-3 py-2 rounded-lg border border-[#c1a38f]/40 bg-white/70 focus:ring-2 focus:ring-[#c1a38f] outline-none"
            />
          </div>
          <input
            type="email"
            name="email"
            placeholder="Email *"
            value={formData.email}
            onChange={handleChange}
            className="px-3 py-2 rounded-lg border border-[#c1a38f]/40 bg-white/70 focus:ring-2 focus:ring-[#c1a38f] outline-none"
          />
          <input
            type="text"
            name="phone_number"
            placeholder="Phone Number *"
            value={formData.phone_number}
            onChange={handleChange}
            className="px-3 py-2 rounded-lg border border-[#c1a38f]/40 bg-white/70 focus:ring-2 focus:ring-[#c1a38f] outline-none"
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className="px-3 py-2 rounded-lg border border-[#c1a38f]/40 bg-white/70 focus:ring-2 focus:ring-[#c1a38f] outline-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              className="px-3 py-2 rounded-lg border border-[#c1a38f]/40 bg-white/70 focus:ring-2 focus:ring-[#c1a38f] outline-none"
            />
            <input
              type="text"
              name="postal_code"
              placeholder="Postal Code"
              value={formData.postal_code}
              onChange={handleChange}
              className="px-3 py-2 rounded-lg border border-[#c1a38f]/40 bg-white/70 focus:ring-2 focus:ring-[#c1a38f] outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#c1a38f] hover:bg-[#f5eeee] transition"
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

export default CreateClientModal;
