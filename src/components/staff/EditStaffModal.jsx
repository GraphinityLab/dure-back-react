/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';

import { motion } from 'framer-motion';

import axiosInstance from '../../../utils/axiosInstance';
import PremiumSelect from '../common/PremiumSelect';

const passwordStrength = (password) => {
  const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
  return regex.test(password);
};

const EditStaffModal = ({ staff, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    first_name: staff.first_name || '',
    last_name: staff.last_name || '',
    username: staff.username || '',
    email: staff.email || '',
    role_id: staff.role_id || '',
    phone_number: staff.phone_number || '',
    address: staff.address || '',
    city: staff.city || '',
    province: staff.province || '',
    postal_code: staff.postal_code || '',
    password: '',
    confirmPassword: '',
    online: staff.online || false, // <-- added online
  });

  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data } = await axiosInstance.get('/rolePermissions');
        setRoles(data.roles || []);
      } catch (err) {
        console.error('Error fetching roles:', err);
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: '' });
    setSuccessMessage('');
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setForm({ ...form, [name]: checked });
    setErrors({ ...errors, [name]: '' });
    setSuccessMessage('');
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!form.first_name.trim()) newErrors.first_name = 'First name required';
    if (!form.last_name.trim()) newErrors.last_name = 'Last name required';
    if (!form.username.trim()) newErrors.username = 'Username required';
    if (!form.email.trim()) newErrors.email = 'Email required';
    if (!form.role_id) newErrors.role_id = 'Role required';

    if (form.password) {
      if (!passwordStrength(form.password))
        newErrors.password =
          'Password too weak (min 8 chars, uppercase, lowercase, number, special char)';
      if (form.password !== form.confirmPassword)
        newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    try {
      setLoading(true);
      await axiosInstance.put(`/staff/update/${staff.staff_id}`, {
        ...form,
        phone_number: form.phone_number || null,
        address: form.address || null,
        city: form.city || null,
        province: form.province || null,
        postal_code: form.postal_code || null,
        ...(form.password ? { password: form.password } : {}),
      });

      setSuccessMessage('Staff updated successfully');
      setErrors({});
      setForm({ ...form, password: '', confirmPassword: '' });
      onSuccess();
    } catch (err) {
      console.error(err);
      setErrors({ general: err?.response?.data?.message || 'Failed to update staff' });
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
        className="bg-white/80 rounded-3xl shadow-lg border border-[#e8dcd4] p-6 max-w-2xl w-full text-[#3e2e3d] font-[CaviarDreams]"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 15 }}
      >
        <h3 className="text-2xl font-[Soligant] mb-2">Edit Staff</h3>

        {/* Error bar */}
        {Object.values(errors).some((e) => e?.trim()) && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
            <ul className="list-disc list-inside">
              {Object.entries(errors).map(
                ([key, error]) => error?.trim() && <li key={key}>{error}</li>
              )}
            </ul>
          </div>
        )}

        {/* Success bar */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded text-green-700 text-sm">
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <input
            type="text"
            name="first_name"
            placeholder="First Name"
            value={form.first_name}
            onChange={handleChange}
            className="px-3 py-2 rounded-lg border border-[#e8dcd4]"
          />
          <input
            type="text"
            name="last_name"
            placeholder="Last Name"
            value={form.last_name}
            onChange={handleChange}
            className="px-3 py-2 rounded-lg border border-[#e8dcd4]"
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="px-3 py-2 rounded-lg border border-[#e8dcd4]"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="px-3 py-2 rounded-lg border border-[#e8dcd4]"
          />
          <PremiumSelect
            name="role_id"
            value={form.role_id}
            onChange={handleChange}
            options={[
              { value: "", label: "Select Role" },
              ...roles.map((role) => ({
                value: role.role_id,
                label: role.role_name,
              })),
            ]}
            placeholder="Select Role"
            className="w-full"
          />
          <input
            type="text"
            name="phone_number"
            placeholder="Phone (optional)"
            value={form.phone_number}
            onChange={handleChange}
            className="px-3 py-2 rounded-lg border border-[#e8dcd4]"
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            className="px-3 py-2 rounded-lg border border-[#e8dcd4]"
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
            className="px-3 py-2 rounded-lg border border-[#e8dcd4]"
          />
          <input
            type="text"
            name="province"
            placeholder="Province"
            value={form.province}
            onChange={handleChange}
            className="px-3 py-2 rounded-lg border border-[#e8dcd4]"
          />
          <input
            type="text"
            name="postal_code"
            placeholder="Postal Code"
            value={form.postal_code}
            onChange={handleChange}
            className="px-3 py-2 rounded-lg border border-[#e8dcd4]"
          />
          <input
            type="password"
            name="password"
            placeholder="New Password (optional)"
            value={form.password}
            onChange={handleChange}
            className="px-3 py-2 rounded-lg border border-[#e8dcd4]"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="px-3 py-2 rounded-lg border border-[#e8dcd4]"
          />
        </div>

        {/* Online checkbox */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            id="online"
            name="online"
            checked={form.online}
            onChange={handleCheckboxChange}
            className="h-4 w-4 accent-[#c1a38f] rounded"
          />
          <label htmlFor="online" className="text-sm text-[#3e2e3d] font-medium">
            Online
          </label>
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-white border border-[#d8c9c9] text-[#3e2e3d] hover:bg-[#f5eeee] transition font-semibold text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 rounded-full bg-[#c1a38f] text-white hover:bg-[#a78974] transition font-semibold text-sm"
          >
            {loading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EditStaffModal;
