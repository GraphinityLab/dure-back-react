/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar as CalendarIcon, Clock, User, FileText, AlertCircle, Check, XCircle, CheckCircle2 } from 'lucide-react';
import axiosInstance from '../../../utils/axiosInstance';
import PremiumSelect from '../common/PremiumSelect';
import { setTimedMessage } from './utils';

const BUSINESS_HOURS = { start: "09:00", end: "17:00" };
const DECLINE_REASONS = [
  "Staff member is unavailable at this time",
  "Selected service is unavailable on this date",
  "Scheduling conflict with another appointment",
  "Unexpected operational issue (please reschedule)",
  "Booking error – please select another time",
  "Other",
];

const generateFutureDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });
    const dateString = date.toISOString().split("T")[0];
    dates.push({
      date: dateString,
      display: `${dayOfWeek}, ${date.toLocaleDateString()}`,
    });
  }
  return dates;
};

const generateTimeSlots = (date, durationMinutes) => {
  const slots = [];
  const start = new Date(`${date}T${BUSINESS_HOURS.start}:00`);
  const end = new Date(`${date}T${BUSINESS_HOURS.end}:00`);
  let current = new Date(start);

  while (current < end) {
    const next = new Date(current.getTime() + durationMinutes * 60000);
    if (next <= end) slots.push(current.toTimeString().slice(0, 5));
    current = next;
  }
  return slots;
};

const EditAppointmentModal = ({
  appointment,
  staff,
  onClose,
  onSuccess,
  setMessage,
}) => {
  const [activeTab, setActiveTab] = useState('update'); // 'update', 'confirm', 'decline'
  const [newDate, setNewDate] = useState(appointment.appointment_date?.split("T")[0] || "");
  const [newTime, setNewTime] = useState(appointment.start_time?.slice(0, 5) || "");
  const [notes, setNotes] = useState(appointment.notes || "");
  const [selectedStaffId, setSelectedStaffId] = useState(appointment.staff_id || "");
  const [availableTimes, setAvailableTimes] = useState([]);
  const [declineReason, setDeclineReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [loading, setLoading] = useState(false);

  const availableDates = generateFutureDates();
  const serviceDuration = appointment.serviceDurationMinutes || 30;

  useEffect(() => {
    if (newDate) {
      const slots = generateTimeSlots(newDate, serviceDuration);
      setAvailableTimes(slots);
      if (!slots.includes(newTime)) setNewTime(slots[0] || "");
    }
  }, [newDate, serviceDuration, newTime]);

  const handleUpdate = async () => {
    if (!selectedStaffId || !newTime) {
      setTimedMessage(setMessage, "Please select staff and time.", "error");
      return;
    }

    const startDateTime = new Date(`${newDate}T${newTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + serviceDuration * 60000);

    const formatDateTime = (dt) => {
      const pad = (n) => n.toString().padStart(2, "0");
      return (
        dt.getFullYear() + "-" + pad(dt.getMonth() + 1) + "-" + pad(dt.getDate()) +
        " " + pad(dt.getHours()) + ":" + pad(dt.getMinutes()) + ":" + pad(dt.getSeconds())
      );
    };

    const formattedStart = formatDateTime(startDateTime);
    const formattedEnd = formatDateTime(endDateTime);

    try {
      setLoading(true);
      await axiosInstance.put(`/appointments/${appointment.id}`, {
        notes,
        staff_id: selectedStaffId,
        appointment_date: newDate,
        start_time: formattedStart,
        end_time: formattedEnd,
        status: appointment.status,
      });
      setTimedMessage(setMessage, "Appointment updated successfully!", "success");
      onSuccess();
    } catch (err) {
      console.error(err);
      setTimedMessage(setMessage, "Failed to update appointment.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedStaffId) {
      setTimedMessage(setMessage, "Please assign a staff member first.", "error");
      return;
    }
    try {
      setLoading(true);
      await axiosInstance.patch(`/appointments/${appointment.id}/confirm`, {
        status: "confirmed",
        staff_id: selectedStaffId,
      });
      setTimedMessage(setMessage, "Appointment confirmed!", "success");
      onSuccess();
    } catch {
      setTimedMessage(setMessage, "Failed to confirm appointment.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    let reason = declineReason === "Other" ? customReason.trim() : declineReason;
    if (!reason) {
      setTimedMessage(setMessage, "Please select or enter a reason to decline.", "error");
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.patch(`/appointments/${appointment.id}/reschedule`, {
        new_date: appointment.appointment_date,
        new_start_time: appointment.start_time,
        new_end_time: appointment.end_time,
        notes: reason,
      });
      setTimedMessage(setMessage, "Appointment declined and client notified.", "success");
      onSuccess();
    } catch (err) {
      console.error(err);
      setTimedMessage(setMessage, "Failed to decline appointment.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      await axiosInstance.patch(`/appointments/${appointment.id}/complete`);
      setTimedMessage(setMessage, "Appointment marked as completed!", "success");
      onSuccess();
    } catch (err) {
      console.error(err);
      setTimedMessage(setMessage, "Failed to complete appointment.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-2xl bg-gradient-to-br from-white/95 via-white/90 to-white/85 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_rgba(60,43,33,0.25)] border border-white/50 overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#3c2b21] to-[#5f4b5a] text-white px-6 py-5 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-1">Edit Appointment</h3>
            <p className="text-sm text-white/80">
              {appointment.clientFirstName} {appointment.clientLastName} • {appointment.serviceName}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all"
          >
            <X className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/30 bg-white/40">
          <button
            onClick={() => setActiveTab('update')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
              activeTab === 'update'
                ? 'bg-white text-[#3c2b21] border-b-2 border-[#c1a38f]'
                : 'text-[#6b5c55] hover:bg-white/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4" />
              Reschedule
            </div>
          </button>
          <button
            onClick={() => setActiveTab('confirm')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
              activeTab === 'confirm'
                ? 'bg-white text-[#3c2b21] border-b-2 border-[#c1a38f]'
                : 'text-[#6b5c55] hover:bg-white/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Check className="h-4 w-4" />
              Confirm
            </div>
          </button>
          <button
            onClick={() => setActiveTab('complete')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
              activeTab === 'complete'
                ? 'bg-white text-[#3c2b21] border-b-2 border-[#c1a38f]'
                : 'text-[#6b5c55] hover:bg-white/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Complete
            </div>
          </button>
          <button
            onClick={() => setActiveTab('decline')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
              activeTab === 'decline'
                ? 'bg-white text-[#3c2b21] border-b-2 border-[#c1a38f]'
                : 'text-[#6b5c55] hover:bg-white/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <XCircle className="h-4 w-4" />
              Decline
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'update' && (
              <motion.div
                key="update"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    Update the appointment details below. The client will be notified of any changes.
                  </p>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#3c2b21] mb-2">
                    <CalendarIcon className="h-4 w-4 text-[#c1a38f]" />
                    Select New Date
                  </label>
                  <PremiumSelect
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    options={availableDates.map((d) => ({
                      value: d.date,
                      label: d.display,
                    }))}
                  />
                </div>

                {/* Time Selection */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#3c2b21] mb-2">
                    <Clock className="h-4 w-4 text-[#c1a38f]" />
                    Select New Time
                  </label>
                  <PremiumSelect
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    options={
                      availableTimes.length > 0
                        ? availableTimes.map((t) => ({ value: t, label: t }))
                        : [{ value: "", label: "No available times", disabled: true }]
                    }
                    disabled={availableTimes.length === 0}
                  />
                </div>

                {/* Staff Selection */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#3c2b21] mb-2">
                    <User className="h-4 w-4 text-[#c1a38f]" />
                    Assign Staff Member
                  </label>
                  <PremiumSelect
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    options={[
                      { value: "", label: "Select Staff" },
                      ...staff.map((s) => ({
                        value: s.staff_id,
                        label: `${s.first_name} ${s.last_name}`,
                      })),
                    ]}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#3c2b21] mb-2">
                    <FileText className="h-4 w-4 text-[#c1a38f]" />
                    Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    className="w-full border border-white/50 bg-white/60 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c1a38f]/50 transition-all"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any special instructions or notes..."
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpdate}
                  disabled={loading || !selectedStaffId || !newTime}
                  className={`w-full py-3.5 rounded-xl font-semibold text-white shadow-lg transition-all ${
                    loading || !selectedStaffId || !newTime
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#3c2b21] to-[#5f4b5a] hover:shadow-xl"
                  }`}
                >
                  {loading ? "Updating..." : "Update Appointment"}
                </motion.button>
              </motion.div>
            )}

            {activeTab === 'confirm' && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                  <Check className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-800">
                    Confirm this appointment. The client will receive a confirmation email.
                  </p>
                </div>

                {/* Staff Selection */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#3c2b21] mb-2">
                    <User className="h-4 w-4 text-[#c1a38f]" />
                    Assign Staff Member (Required)
                  </label>
                  <PremiumSelect
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    options={[
                      { value: "", label: "Select Staff" },
                      ...staff.map((s) => ({
                        value: s.staff_id,
                        label: `${s.first_name} ${s.last_name}`,
                      })),
                    ]}
                  />
                </div>

                {/* Appointment Summary */}
                <div className="p-4 rounded-2xl bg-white/80 border border-white/50">
                  <h4 className="font-semibold text-[#3c2b21] mb-3">Appointment Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#6b5c55]">Service:</span>
                      <span className="font-medium text-[#3c2b21]">{appointment.serviceName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b5c55]">Date:</span>
                      <span className="font-medium text-[#3c2b21]">
                        {new Date(appointment.appointment_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b5c55]">Time:</span>
                      <span className="font-medium text-[#3c2b21]">{appointment.startTime}</span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirm}
                  disabled={loading || !selectedStaffId}
                  className={`w-full py-3.5 rounded-xl font-semibold text-white shadow-lg transition-all ${
                    loading || !selectedStaffId
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-xl"
                  }`}
                >
                  {loading ? "Confirming..." : "Confirm Appointment"}
                </motion.button>
              </motion.div>
            )}

            {activeTab === 'complete' && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    Mark this appointment as completed. This action indicates the service has been successfully provided to the client.
                  </p>
                </div>

                {/* Appointment Summary */}
                <div className="p-5 rounded-2xl bg-white/80 border border-white/50">
                  <h4 className="font-semibold text-[#3c2b21] mb-4 text-center">Ready to Complete</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-white/80 to-white/40">
                      <span className="text-[#6b5c55] font-medium">Client:</span>
                      <span className="font-semibold text-[#3c2b21]">
                        {appointment.clientFirstName} {appointment.clientLastName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-white/80 to-white/40">
                      <span className="text-[#6b5c55] font-medium">Service:</span>
                      <span className="font-semibold text-[#3c2b21]">{appointment.serviceName}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-white/80 to-white/40">
                      <span className="text-[#6b5c55] font-medium">Date:</span>
                      <span className="font-semibold text-[#3c2b21]">
                        {new Date(appointment.appointment_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-white/80 to-white/40">
                      <span className="text-[#6b5c55] font-medium">Time:</span>
                      <span className="font-semibold text-[#3c2b21]">{appointment.startTime}</span>
                    </div>
                    {appointment.servicePrice && (
                      <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200">
                        <span className="text-emerald-700 font-semibold">Price:</span>
                        <span className="font-bold text-emerald-700 text-lg">
                          ${Number(appointment.servicePrice).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleComplete}
                  disabled={loading}
                  className={`w-full py-3.5 rounded-xl font-semibold text-white shadow-lg transition-all ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-xl"
                  }`}
                >
                  {loading ? "Completing..." : "Mark as Completed"}
                </motion.button>
              </motion.div>
            )}

            {activeTab === 'decline' && (
              <motion.div
                key="decline"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-rose-800">
                    Decline this appointment. The client will be notified and asked to reschedule.
                  </p>
                </div>

                {/* Decline Reason */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#3c2b21] mb-2">
                    <AlertCircle className="h-4 w-4 text-[#c1a38f]" />
                    Reason for Declining (Required)
                  </label>
                  <PremiumSelect
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    options={[
                      { value: "", label: "Select a reason" },
                      ...DECLINE_REASONS.map((r) => ({ value: r, label: r })),
                    ]}
                  />
                </div>

                {declineReason === "Other" && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-[#3c2b21] mb-2">
                      <FileText className="h-4 w-4 text-[#c1a38f]" />
                      Custom Reason
                    </label>
                    <textarea
                      rows={3}
                      className="w-full border border-white/50 bg-white/60 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c1a38f]/50 transition-all"
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Please explain why you're declining this appointment..."
                    />
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDecline}
                  disabled={loading || !declineReason || (declineReason === "Other" && !customReason.trim())}
                  className={`w-full py-3.5 rounded-xl font-semibold text-white shadow-lg transition-all ${
                    loading || !declineReason || (declineReason === "Other" && !customReason.trim())
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-rose-500 to-rose-600 hover:shadow-xl"
                  }`}
                >
                  {loading ? "Declining..." : "Decline Appointment"}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white/40 border-t border-white/30 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-white/80 hover:bg-white text-[#3c2b21] font-medium transition-all shadow-sm"
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EditAppointmentModal;
