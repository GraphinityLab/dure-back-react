/* eslint-disable no-unused-vars */
import React, { useState } from 'react';

import { motion } from 'framer-motion';

import axiosInstance from '../../../utils/axiosInstance';
import { setTimedMessage } from '../appointments/utils';

const EditClientModal = ({ client, onClose, onSuccess, setMessage }) => {
  const [formData, setFormData] = useState({
    first_name: client.first_name || "",
    last_name: client.last_name || "",
    email: client.email || "",
    phone_number: client.phone_number || "",
    address: client.address || "",
    city: client.city || "",
    postal_code: client.postal_code || "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone_number) {
      setTimedMessage(setMessage, "Please fill all required fields.", "error");
      return;
    }
    try {
      setLoading(true);
      await axiosInstance.put(`/clients/${client.client_id}`, formData);
      setTimedMessage(setMessage, "Client updated successfully!", "success");
      onSuccess();
    } catch (err) {
      console.error("updateClient error:", err);
      setTimedMessage(setMessage, err.response?.data?.message || "Failed to update client.", "error");
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
        <h2 className="text-2xl font-[Soligant] text-center mb-4">Edit Client</h2>
        <form className="flex flex-col gap-3" onSubmit={handleUpdate}>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="First Name *" className="px-3 py-2 rounded-lg border border-[#c1a38f]/40 bg-white/70 focus:ring-2 focus:ring-[#c1a38f] outline-none" />
            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Last Name *" className="px-3 py-2 rounded-lg border border-[#c1a38f]/40 bg-white/70 focus:ring-2 focus:ring-[#c1a38f] outline-none" />
          </div>
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email *" className="px-3 py-2 rounded-lg border border-[#c1a38f]/40 bg-white/70 focus:ring-2 focus:ring-[#c1a38f] outline-none" />
          <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="Phone Number *" className="px-3 py-2 rounded-lg border border-[#c1a38f]/40 bg-white/70 focus:ring-2 focus:ring-[#c1a38f] outline-none" />
          <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="px-3 py-2 rounded-lg border border-[#c1a38f]/40 bg-white/70 focus:ring-2 focus:ring-[#c1a38f] outline-none" />
          <div className="grid grid-cols-2 gap-3">
            <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" className="px-3 py-2 rounded-lg border border-[#c1a38f]/40 bg-white/70 focus:ring-2 focus:ring-[#c1a38f] outline-none" />
            <input type="text" name="postal_code" value={formData.postal_code} onChange={handleChange} placeholder="Postal Code" className="px-3 py-2 rounded-lg border border-[#c1a38f]/40 bg-white/70 focus:ring-2 focus:ring-[#c1a38f] outline-none" />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-[#c1a38f] hover:bg-[#f5eeee] transition">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-[#c1a38f] text-white hover:bg-[#a78974] transition">{loading ? "Updating..." : "Update"}</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditClientModal;
