/* eslint-disable no-unused-vars */
import React, {
  useEffect,
  useState,
} from 'react';

import {
  AnimatePresence,
  motion,
} from 'framer-motion';
import { RefreshCcw } from 'lucide-react';

import axiosInstance from '../../utils/axiosInstance';
import AppointmentList from '../components/appointments/AppointmentList';
import EditAppointmentModal
  from '../components/appointments/EditAppointmentModal';
import MessageBanner from '../components/appointments/MessageBanner';
import MoreInfoModal from '../components/appointments/MoreInfoModal';
import { setTimedMessage } from '../components/appointments/utils';

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isMoreInfoModalOpen, setIsMoreInfoModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [message, setMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // -------------------- FETCH DATA --------------------
  const fetchData = async () => {
    setLoading(true);
    try {
      const [appointmentsRes, staffRes] = await Promise.all([
        axiosInstance.get("/appointments"),
        axiosInstance.get("/staff"),
      ]);

      const rawAppointments =
        appointmentsRes.data.appointments || appointmentsRes.data || [];
      const rawStaff = staffRes.data.staff || staffRes.data || [];

      const mappedAppointments = rawAppointments.map((appt) => ({
        id: appt.appointment_id,
        clientFirstName: appt.client_first_name || "",
        clientLastName: appt.client_last_name || "",
        clientName: `${appt.client_first_name || ""} ${
          appt.client_last_name || ""
        }`.trim(),
        serviceName: appt.service_name || "N/A",
        serviceCategory: appt.service_category || "N/A",
        servicePrice: appt.service_price || appt.price || 0,
        serviceDescription: appt.service_description ?? "No description",
        startTime: appt.start_time || "",
        endTime: appt.end_time || "",
        notes: appt.notes || "",
        staff_id: appt.staff_id || null,
        appointment_date: appt.appointment_date || appt.start_time || "",
        serviceDurationMinutes: appt.service_duration_minutes || 30,
        status: appt.status || "Pending",
      }));

      setAppointments(mappedAppointments);
      setStaff(rawStaff);
      setError(null);
    } catch (err) {
      console.error("fetchData error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to fetch data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // -------------------- FILTER APPOINTMENTS --------------------
  const filteredAppointments = appointments.filter((appt) => {
    const q = searchQuery.toLowerCase();
    return (
      (appt.clientName?.toLowerCase().includes(q) ?? false) ||
      (appt.serviceName?.toLowerCase().includes(q) ?? false) ||
      (appt.serviceCategory?.toLowerCase().includes(q) ?? false)
    );
  });

  if (loading)
    return <div className="text-center mt-10">Loading appointments...</div>;
  if (error)
    return <div className="text-center mt-10 text-red-600">{error}</div>;

  return (
    <section className="relative overflow-x-hidden w-full py-20 px-4 sm:px-6 lg:px-8 text-[#3e2e3d] min-h-screen box-border">

      {/* Action loading overlay */}
      {actionLoading && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50">
          <div className="w-14 h-14 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="relative max-w-5xl mx-auto z-10">
        {/* Header + Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 w-full min-w-0">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-[Soligant] tracking-tight truncate min-w-0"
          >
            Appointments
          </motion.h1>

          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto min-w-0">
            <input
              type="text"
              placeholder="Search by client, service, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-[#e8dcd4] focus:outline-none focus:ring-2 focus:ring-[#c1a38f] text-sm md:text-base w-full box-border min-w-0"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3e2e3d] text-white hover:bg-[#5f4b5a] transition shadow w-full md:w-auto justify-center min-w-0"
            >
              <RefreshCcw className="w-5 h-5" />
              Refresh
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {message && <MessageBanner message={message} />}
        </AnimatePresence>

        <AppointmentList
          appointments={filteredAppointments}
          onEdit={(appt) => {
            setSelectedAppointment(appt);
            setIsEditModalOpen(true);
          }}
          onInfo={(appt) => {
            setSelectedAppointment(appt);
            setIsMoreInfoModalOpen(true);
          }}
          onDelete={async (id) => {
            if (window.confirm("Delete this appointment?")) {
              try {
                setActionLoading(true);
                const staffName = `${localStorage.getItem(
                  "first_name"
                )} ${localStorage.getItem("last_name")}`;
                await axiosInstance.delete(`/appointments/${id}`, {
                  data: { changed_by: staffName },
                });
                await fetchData();
                setTimedMessage(setMessage, "Appointment deleted!", "success");
              } catch {
                setTimedMessage(setMessage, "Failed to delete.", "error");
              } finally {
                setActionLoading(false);
              }
            }
          }}
        />
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isMoreInfoModalOpen && selectedAppointment && (
          <MoreInfoModal
            appointment={selectedAppointment}
            onClose={() => setIsMoreInfoModalOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditModalOpen && selectedAppointment && (
          <EditAppointmentModal
            appointment={selectedAppointment}
            staff={staff}
            onClose={() => setIsEditModalOpen(false)}
            onSuccess={async () => {
              setActionLoading(true);
              await fetchData();
              setIsEditModalOpen(false);
              setActionLoading(false);
            }}
            setMessage={setMessage}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default AppointmentsPage;
