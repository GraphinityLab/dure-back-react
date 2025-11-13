import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, Save, X, Lock, UserCircle, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import axiosInstance from '../../utils/axiosInstance';
import MessageBanner from '../components/appointments/MessageBanner';
import MetricCard from '../components/dashboard/MetricCard';
import { setTimedMessage } from '../components/appointments/utils';

const UserSettingsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone_number: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  // Fetch current user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get('/auth/me');
        setUser(data.user);
        setFormData({
          first_name: data.user.first_name || '',
          last_name: data.user.last_name || '',
          username: data.user.username || '',
          email: data.user.email || '',
          phone_number: data.user.phone_number || '',
          address: data.user.address || '',
          city: data.user.city || '',
          province: data.user.province || '',
          postal_code: data.user.postal_code || '',
          password: '',
          confirmPassword: '',
        });
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setTimedMessage(setMessage, 'Failed to load user information', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Fetch user statistics
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setStatsLoading(true);
        const { data } = await axiosInstance.get('/auth/me/stats');
        setUserStats(data);
      } catch (err) {
        console.error('Failed to fetch user stats:', err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchUserStats();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    // Reset save success state when user makes changes
    if (saveSuccess) setSaveSuccess(false);
  };

  const handleReload = () => {
    window.location.reload();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validation
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSaving(true);
      const payload = { ...formData };
      delete payload.confirmPassword;
      if (!payload.password) delete payload.password;

      const { data } = await axiosInstance.put('/auth/me', payload);
      setTimedMessage(setMessage, 'Profile updated successfully!', 'success');
      
      // Update local user state
      setUser(data.user);
      
      // Clear password fields
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
      
      // Show reload button
      setSaveSuccess(true);
    } catch (err) {
      console.error('Failed to update profile:', err);
      const errorMsg = err?.response?.data?.message || 'Failed to update profile';
      setTimedMessage(setMessage, errorMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#c1a38f]/30 border-t-[#c1a38f] rounded-full animate-spin" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-[#a78974]/50 rounded-full animate-spin" style={{ animationDuration: '0.8s' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full py-8 px-4 sm:px-6 lg:px-8 text-[#3e2e3d] min-h-screen">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#c1a38f]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#a78974]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto z-10">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-6xl font-[Soligant] tracking-tight bg-gradient-to-r from-[#3c2b21] via-[#5f4b5a] to-[#3c2b21] bg-clip-text text-transparent mb-2"
              >
                User Settings
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-[#6b5c55] font-medium"
              >
                Manage your account information and preferences
              </motion.p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="p-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/50 text-[#3c2b21] hover:bg-white/90 shadow-lg hover:shadow-xl transition-all"
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Messages */}
        <AnimatePresence>{message && <MessageBanner message={message} setMessage={setMessage} />}</AnimatePresence>

        {/* Metrics Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold text-[#3c2b21] mb-4 flex items-center gap-2">
            <UserCircle className="h-6 w-6" />
            Your Overview
          </h2>
          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl p-[1px] bg-gradient-to-br from-white/70 via-white/50 to-white/20 border border-white/60"
                >
                  <div className="h-[110px] rounded-2xl bg-white/65 animate-pulse" />
                </div>
              ))}
            </div>
          ) : userStats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Appointments"
                value={userStats.counts?.totalAppointments || 0}
                icon="total"
                tone="default"
                change="All time"
              />
              <MetricCard
                title="Upcoming"
                value={userStats.counts?.upcomingAppointments || 0}
                icon="today"
                tone="info"
                change="Scheduled"
              />
              <MetricCard
                title="Today"
                value={userStats.counts?.todaysAppointments || 0}
                icon="clock"
                tone="warn"
                change="This day"
              />
              <MetricCard
                title="Completed"
                value={userStats.counts?.completedAppointments || 0}
                icon="check"
                tone="success"
                change={`Pending: ${userStats.counts?.pendingAppointments || 0}`}
              />
            </div>
          ) : null}
        </motion.div>

        {/* Premium Form Card */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="rounded-3xl bg-gradient-to-br from-white/60 via-white/40 to-white/20 backdrop-blur-xl border border-white/50 shadow-[0_20px_60px_rgba(60,43,33,0.15)] p-8"
        >
          {/* Personal Information Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-br from-[#3c2b21] to-[#5f4b5a]">
                <UserCircle className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-[#3c2b21]">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#3c2b21] mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-2xl bg-white/70 backdrop-blur-xl border ${
                    errors.first_name ? 'border-rose-300' : 'border-white/50'
                  } focus:outline-none focus:ring-2 focus:ring-[#c1a38f]/50 focus:border-[#c1a38f] text-sm shadow-lg transition-all`}
                />
                {errors.first_name && (
                  <p className="mt-1 text-xs text-rose-600">{errors.first_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3c2b21] mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-2xl bg-white/70 backdrop-blur-xl border ${
                    errors.last_name ? 'border-rose-300' : 'border-white/50'
                  } focus:outline-none focus:ring-2 focus:ring-[#c1a38f]/50 focus:border-[#c1a38f] text-sm shadow-lg transition-all`}
                />
                {errors.last_name && (
                  <p className="mt-1 text-xs text-rose-600">{errors.last_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3c2b21] mb-2 flex items-center gap-2">
                  <UserCircle className="h-4 w-4" />
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-2xl bg-white/70 backdrop-blur-xl border ${
                    errors.username ? 'border-rose-300' : 'border-white/50'
                  } focus:outline-none focus:ring-2 focus:ring-[#c1a38f]/50 focus:border-[#c1a38f] text-sm shadow-lg transition-all`}
                />
                {errors.username && (
                  <p className="mt-1 text-xs text-rose-600">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3c2b21] mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-2xl bg-white/70 backdrop-blur-xl border ${
                    errors.email ? 'border-rose-300' : 'border-white/50'
                  } focus:outline-none focus:ring-2 focus:ring-[#c1a38f]/50 focus:border-[#c1a38f] text-sm shadow-lg transition-all`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-rose-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3c2b21] mb-2 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/50 focus:outline-none focus:ring-2 focus:ring-[#c1a38f]/50 focus:border-[#c1a38f] text-sm shadow-lg transition-all"
                />
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-br from-[#3c2b21] to-[#5f4b5a]">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-[#3c2b21]">Address</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#3c2b21] mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/50 focus:outline-none focus:ring-2 focus:ring-[#c1a38f]/50 focus:border-[#c1a38f] text-sm shadow-lg transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3c2b21] mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/50 focus:outline-none focus:ring-2 focus:ring-[#c1a38f]/50 focus:border-[#c1a38f] text-sm shadow-lg transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3c2b21] mb-2">Province</label>
                <input
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/50 focus:outline-none focus:ring-2 focus:ring-[#c1a38f]/50 focus:border-[#c1a38f] text-sm shadow-lg transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3c2b21] mb-2">Postal Code</label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/50 focus:outline-none focus:ring-2 focus:ring-[#c1a38f]/50 focus:border-[#c1a38f] text-sm shadow-lg transition-all"
                />
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-br from-[#3c2b21] to-[#5f4b5a]">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-[#3c2b21]">Change Password</h2>
              <span className="text-xs text-[#6b5c55]">(Leave blank to keep current password)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#3c2b21] mb-2">New Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/50 focus:outline-none focus:ring-2 focus:ring-[#c1a38f]/50 focus:border-[#c1a38f] text-sm shadow-lg transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3c2b21] mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-2xl bg-white/70 backdrop-blur-xl border ${
                    errors.confirmPassword ? 'border-rose-300' : 'border-white/50'
                  } focus:outline-none focus:ring-2 focus:ring-[#c1a38f]/50 focus:border-[#c1a38f] text-sm shadow-lg transition-all`}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-rose-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-white/30">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/50 text-[#3c2b21] font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Cancel
            </motion.button>
            {saveSuccess ? (
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReload}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#3c2b21] to-[#5f4b5a] hover:from-[#5f4b5a] hover:to-[#3c2b21] text-white font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <RefreshCcw className="h-4 w-4" />
                Reload
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={saving}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#c1a38f] to-[#a78974] hover:from-[#a78974] hover:to-[#8d6f5a] text-white font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </motion.button>
            )}
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default UserSettingsPage;

