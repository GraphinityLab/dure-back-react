/* eslint-disable no-unused-vars */
import React, {
  useEffect,
  useState,
} from 'react';

import { motion } from 'framer-motion';

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
  const [newDate, setNewDate] = useState(
    appointment.appointment_date?.split("T")[0] || ""
  );
  const [newTime, setNewTime] = useState(
    appointment.start_time?.slice(0, 5) || ""
  );
  const [notes, setNotes] = useState(appointment.notes || "");
  const [selectedStaffId, setSelectedStaffId] = useState(
    appointment.staff_id || ""
  );
  const [availableTimes, setAvailableTimes] = useState([]);
  const [declineReason, setDeclineReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [loadingDecline, setLoadingDecline] = useState(false);

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
      setTimedMessage(setMessage, "Select staff and time.", "error");
      return;
    }

    const startDateTime = new Date(`${newDate}T${newTime}:00`);
    const endDateTime = new Date(
      startDateTime.getTime() + serviceDuration * 60000
    );

    const formatDateTime = (dt) => {
      const pad = (n) => n.toString().padStart(2, "0");
      return (
        dt.getFullYear() +
        "-" +
        pad(dt.getMonth() + 1) +
        "-" +
        pad(dt.getDate()) +
        " " +
        pad(dt.getHours()) +
        ":" +
        pad(dt.getMinutes()) +
        ":" +
        pad(dt.getSeconds())
      );
    };

    const formattedStart = formatDateTime(startDateTime);
    const formattedEnd = formatDateTime(endDateTime);

    try {
      setLoadingUpdate(true);
      await axiosInstance.put(`/appointments/${appointment.id}`, {
        notes,
        staff_id: selectedStaffId,
        appointment_date: newDate,
        start_time: formattedStart,
        end_time: formattedEnd,
        status: appointment.status,
      });
      setTimedMessage(setMessage, "Appointment updated!", "success");
      onSuccess();
    } catch (err) {
      console.error(err);
      setTimedMessage(setMessage, "Failed to update.", "error");
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedStaffId) {
      setTimedMessage(setMessage, "Select a staff member to confirm.", "error");
      return;
    }
    try {
      setLoadingConfirm(true);
      await axiosInstance.patch(`/appointments/${appointment.id}/confirm`, {
        status: "confirmed",
        staff_id: selectedStaffId,
      });
      setTimedMessage(setMessage, "Appointment confirmed!", "success");
      onSuccess();
    } catch {
      setTimedMessage(setMessage, "Failed to confirm appointment.", "error");
    } finally {
      setLoadingConfirm(false);
    }
  };

  const handleDecline = async () => {
    let reason =
      declineReason === "Other" ? customReason.trim() : declineReason;
    if (!reason) {
      setTimedMessage(
        setMessage,
        "Please select or enter a reason to decline.",
        "error"
      );
      return;
    }

    try {
      setLoadingDecline(true);
      await axiosInstance.patch(`/appointments/${appointment.id}/reschedule`, {
        new_date: appointment.appointment_date,
        new_start_time: appointment.start_time,
        new_end_time: appointment.end_time,
        notes: reason,
      });

      setTimedMessage(setMessage, "Appointment declined.", "success");
      onSuccess();
    } catch (err) {
      console.error(err);
      setTimedMessage(setMessage, "Failed to decline appointment.", "error");
    } finally {
      setLoadingDecline(false);
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
          <h3 className="text-2xl font-[Soligant]">Edit Appointment</h3>
          <button
            onClick={onClose}
            className="text-[#5f4b5a] hover:text-[#3e2e3d]"
          >
            ✖
          </button>
        </div>

        <p className="mb-4 text-sm">
          Editing appointment for{" "}
          <strong>
            {appointment.clientFirstName} {appointment.clientLastName}
          </strong>{" "}
          ({appointment.serviceName})
        </p>

        {/* Date */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-[#3c2b21]">
            Select New Date
          </label>
          <PremiumSelect
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            options={availableDates.map((d) => ({
              value: d.date,
              label: d.display,
            }))}
            placeholder="Select a date"
          />
        </div>

        {/* Time */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-[#3c2b21]">
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
            placeholder="Select a time"
            disabled={availableTimes.length === 0}
          />
        </div>

        {/* Staff */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-[#3c2b21]">Assign Staff</label>
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
            placeholder="Select Staff"
          />
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            rows={3}
            className="w-full border border-[#e8dcd4] rounded-md p-2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Decline */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-[#3c2b21]">
            Reason for Decline
          </label>
          <PremiumSelect
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            options={[
              { value: "", label: "Select a reason" },
              ...DECLINE_REASONS.map((r) => ({ value: r, label: r })),
            ]}
            placeholder="Select a reason"
          />
        </div>

        {declineReason === "Other" && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">
              Custom Reason
            </label>
            <textarea
              rows={2}
              className="w-full border border-[#e8dcd4] rounded-md p-2"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleUpdate}
            disabled={loadingUpdate}
            className={`flex-1 px-4 py-2 rounded-full ${
              loadingUpdate
                ? "bg-gray-300 text-gray-600"
                : "bg-[#c1a38f] text-white hover:bg-[#a78974]"
            }`}
          >
            {loadingUpdate ? "Updating..." : "Update"}
          </button>
          <button
            onClick={handleDecline}
            disabled={loadingDecline}
            className={`flex-1 px-4 py-2 rounded-full ${
              loadingDecline
                ? "bg-gray-300 text-gray-600"
                : "bg-red-200 text-red-800 hover:bg-red-300"
            }`}
          >
            {loadingDecline ? "Declining..." : "Decline"}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedStaffId || loadingConfirm}
            className={`flex-1 px-4 py-2 rounded-full ${
              loadingConfirm || !selectedStaffId
                ? "bg-gray-300 text-gray-600"
                : "bg-green-200 text-green-800 hover:bg-green-300"
            }`}
          >
            {loadingConfirm ? "Confirming..." : "Confirm"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-full bg-gray-200 text-[#3e2e3d] hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EditAppointmentModal;
