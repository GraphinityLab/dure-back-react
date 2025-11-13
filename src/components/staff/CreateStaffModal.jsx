/* eslint-disable no-unused-vars */
import React, {
  useEffect,
  useState,
} from 'react';

import { motion } from 'framer-motion';
import {
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';

import axiosInstance from '../../../utils/axiosInstance';
import PremiumSelect from '../common/PremiumSelect';

const passwordStrength = (password) => {
  const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
  return regex.test(password);
};

const CreateStaffModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role_id: '',
    phone_number: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
  });

  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data } = await axiosInstance.get('/rolePermissions');
        setRoles(data.roles);
      } catch (err) {
        console.error('Error fetching roles:', err);
      }
    };
    fetchRoles();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: '' });
    setSuccessMessage('');
    if (name === 'username') setUsernameAvailable(null);
    if (name === 'email') setEmailAvailable(null);
  };

  // Check username/email availability
  const handleCheckAvailability = async (field) => {
    const value = form[field];
    if (!value) {
      setErrors((prev) => ({ ...prev, [field]: `${field === 'username' ? 'Username' : 'Email'} required` }));
      return;
    }

    try {
      const { data } = await axiosInstance.post('/auth/check-username', {
        username: field === 'username' ? value : undefined,
        email: field === 'email' ? value : undefined,
      });

      if (data.exists) {
        setErrors((prev) => ({ ...prev, [field]: `${field === 'username' ? 'Username' : 'Email'} already exists` }));
        if (field === 'username') setUsernameAvailable(false);
        if (field === 'email') setEmailAvailable(false);
      } else {
        setErrors((prev) => ({ ...prev, [field]: '' }));
        if (field === 'username') setUsernameAvailable(true);
        if (field === 'email') setEmailAvailable(true);
      }
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({ ...prev, [field]: 'Error checking availability' }));
    }
  };

  // Submit
  const handleSubmit = async () => {
    const newErrors = {};

    if (!form.first_name.trim()) newErrors.first_name = 'First name required';
    if (!form.last_name.trim()) newErrors.last_name = 'Last name required';
    if (!form.username.trim()) newErrors.username = 'Username required';
    if (!form.email.trim()) newErrors.email = 'Email required';
    if (!form.role_id) newErrors.role_id = 'Role required';
    if (!form.password) newErrors.password = 'Password required';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (form.password && !passwordStrength(form.password))
      newErrors.password = 'Password too weak (min 8 chars, uppercase, lowercase, number, special char)';
    if (usernameAvailable === false) newErrors.username = 'Username already exists';
    if (emailAvailable === false) newErrors.email = 'Email already exists';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSuccessMessage('');
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post('/staff/create', {
        ...form,
        phone_number: form.phone_number || null,
        address: form.address || null,
        city: form.city || null,
        province: form.province || null,
        postal_code: form.postal_code || null,
      });

      // Success inside modal only
      setSuccessMessage('Staff created successfully');
      setErrors({});
      setUsernameAvailable(null);
      setEmailAvailable(null);
      setForm({
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role_id: '',
        phone_number: '',
        address: '',
        city: '',
        province: '',
        postal_code: '',
      });

      // Refresh parent data
      onSuccess();
    } catch (err) {
      console.error(err);
      setErrors({ submit: err?.response?.data?.message || 'Failed to create staff' });
      setSuccessMessage('');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    setUsernameAvailable(null);
    setEmailAvailable(null);
    setSuccessMessage('');
    onClose();
  };

  const canCreate =
    form.first_name &&
    form.last_name &&
    form.username &&
    form.email &&
    form.role_id &&
    form.password &&
    form.password === form.confirmPassword &&
    passwordStrength(form.password) &&
    usernameAvailable &&
    emailAvailable;

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        className="bg-white/80 rounded-3xl shadow-lg border border-[#e8dcd4] p-6 max-w-2xl w-full text-[#3e2e3d] font-[CaviarDreams]"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 15 }}
      >
        <h3 className="text-2xl font-[Soligant] mb-2">Create Staff</h3>

        {/* Form-level errors */}
        {Object.values(errors).some((e) => e?.trim()) && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
            <ul className="list-disc list-inside">
              {Object.entries(errors).map(([key, error]) => error?.trim() && <li key={key}>{error}</li>)}
            </ul>
          </div>
        )}

        {/* Success */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded text-green-700 text-sm">
            {successMessage}
          </div>
        )}

        {/* Form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <input type="text" name="first_name" placeholder="First Name" value={form.first_name} onChange={handleChange} className="px-3 py-2 rounded-lg border border-[#e8dcd4]" />
          <input type="text" name="last_name" placeholder="Last Name" value={form.last_name} onChange={handleChange} className="px-3 py-2 rounded-lg border border-[#e8dcd4]" />

          <div className="relative flex items-center gap-2">
            <input type="text" name="username" placeholder="Username" value={form.username} onChange={handleChange} className="px-3 py-2 rounded-lg border border-[#e8dcd4] flex-1" />
            <button type="button" onClick={() => handleCheckAvailability('username')} className="px-2 py-1 bg-[#c1a38f] text-white rounded hover:bg-[#a78974] text-sm">Check</button>
            {usernameAvailable === true && <FaCheckCircle className="text-green-500" />}
            {usernameAvailable === false && <FaTimesCircle className="text-red-500" />}
          </div>

          <div className="relative flex items-center gap-2">
            <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="px-3 py-2 rounded-lg border border-[#e8dcd4] flex-1" />
            <button type="button" onClick={() => handleCheckAvailability('email')} className="px-2 py-1 bg-[#c1a38f] text-white rounded hover:bg-[#a78974] text-sm">Check</button>
            {emailAvailable === true && <FaCheckCircle className="text-green-500" />}
            {emailAvailable === false && <FaTimesCircle className="text-red-500" />}
          </div>

          <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} className="px-3 py-2 rounded-lg border border-[#e8dcd4]" />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} className="px-3 py-2 rounded-lg border border-[#e8dcd4]" />

          <PremiumSelect
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

          <input type="text" name="phone_number" placeholder="Phone (optional)" value={form.phone_number} onChange={handleChange} className="px-3 py-2 rounded-lg border border-[#e8dcd4]" />
          <input type="text" name="address" placeholder="Address" value={form.address} onChange={handleChange} className="px-3 py-2 rounded-lg border border-[#e8dcd4]" />
          <input type="text" name="city" placeholder="City" value={form.city} onChange={handleChange} className="px-3 py-2 rounded-lg border border-[#e8dcd4]" />
          <input type="text" name="province" placeholder="Province" value={form.province} onChange={handleChange} className="px-3 py-2 rounded-lg border border-[#e8dcd4]" />
          <input type="text" name="postal_code" placeholder="Postal Code" value={form.postal_code} onChange={handleChange} className="px-3 py-2 rounded-lg border border-[#e8dcd4]" />
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <button onClick={handleClose} className="px-5 py-2.5 rounded-full bg-white border border-[#d8c9c9] text-[#3e2e3d] hover:bg-[#f5eeee] transition font-semibold text-sm">Cancel</button>
          <button onClick={handleSubmit} disabled={!canCreate || loading} className={`px-5 py-2.5 rounded-full text-white transition font-semibold text-sm ${canCreate ? 'bg-[#c1a38f] hover:bg-[#a78974]' : 'bg-gray-300 cursor-not-allowed'}`}>
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreateStaffModal;
