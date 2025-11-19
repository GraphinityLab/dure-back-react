/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RefreshCcw, AlertTriangle, Search as SearchIcon, X, Calendar, List } from "lucide-react";
import PremiumSelect from "../components/common/PremiumSelect";

import axiosInstance from "../../utils/axiosInstance";
import AppointmentList from "../components/appointments/AppointmentList";
import CalendarView from "../components/calendar/CalendarView";
import EditAppointmentModal from "../components/appointments/EditAppointmentModal";
import MessageBanner from "../components/appointments/MessageBanner";
import MoreInfoModal from "../components/appointments/MoreInfoModal";
import { setTimedMessage } from "../components/appointments/utils";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

// Force any possibly-wrong shape into an array
function toArray(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  // Some APIs return {rows:[...]} or {data:[...]}
  if (Array.isArray(value.rows)) return value.rows;
  if (Array.isArray(value.data)) return value.data;
  // If server returns a single object for convenience, wrap it
  return [value];
}

// Map API appointment into a stable UI shape
function mapAppointment(appt) {
  const start = appt.start_time || "";
  const end = appt.end_time || "";
  const appointmentDate = appt.appointment_date || "";
  const first = appt.client_first_name || "";
  const last = appt.client_last_name || "";
  const price = Number(appt.service_price ?? appt.price ?? 0) || 0;

  return {
    id: appt.appointment_id ?? appt.id ?? String(Math.random()),
    clientFirstName: first,
    clientLastName: last,
    clientName: `${first} ${last}`.trim(),
    serviceName: appt.service_name || "N/A",
    serviceCategory: appt.service_category || "N/A",
    servicePrice: price,
    serviceDescription: appt.service_description ?? "No description",
    startTime: start,
    endTime: end,
    notes: appt.notes || "",
    staff_id: appt.staff_id ?? null,
    appointment_date: appointmentDate, // Use the actual appointment_date field, not start_time
    serviceDurationMinutes: Number(appt.service_duration_minutes ?? 30) || 30,
    status: appt.status || "Pending",
  };
}

// Simple debounce for search input
function useDebouncedValue(value, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/* -------------------------------------------------------------------------- */

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
  const debouncedQuery = useDebouncedValue(searchQuery, 250);
  const [viewMode, setViewMode] = useState("list"); // "list" or "calendar"

  // optional: expose a sort mode; default by upcoming start time asc
  const [sortMode, setSortMode] = useState("upcoming");

  const lastSuccessfulSnapshot = useRef({ appointments: [], staff: [] });

  /* ----------------------------- Fetching data ---------------------------- */

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [appointmentsRes, staffRes] = await Promise.all([
        axiosInstance.get("/appointments"),
        axiosInstance.get("/staff"),
      ]);

      const rawAppointments =
        appointmentsRes?.data?.appointments ??
        appointmentsRes?.data ??
        [];
      const rawStaff = staffRes?.data?.staff ?? staffRes?.data ?? [];

      const mappedAppointments = toArray(rawAppointments).map(mapAppointment);
      const normalizedStaff = toArray(rawStaff);

      setAppointments(mappedAppointments);
      setStaff(normalizedStaff);
      lastSuccessfulSnapshot.current = {
        appointments: mappedAppointments,
        staff: normalizedStaff,
      };
      setError(null);
    } catch (err) {
      console.error("fetchData error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch data"
      );
      // Fall back to last successful data so UI remains usable
      setAppointments(lastSuccessfulSnapshot.current.appointments);
      setStaff(lastSuccessfulSnapshot.current.staff);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ----------------------------- Transformations ----------------------------- */

  const filteredAppointments = useMemo(() => {
    const list = Array.isArray(appointments) ? appointments : [];
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return list;

    return list.filter((appt) => {
      const name = appt.clientName?.toLowerCase() || "";
      const service = appt.serviceName?.toLowerCase() || "";
      const cat = appt.serviceCategory?.toLowerCase() || "";
      return (
        name.includes(q) ||
        service.includes(q) ||
        cat.includes(q)
      );
    });
  }, [appointments, debouncedQuery]);

  const sortedAppointments = useMemo(() => {
    const arr = [...filteredAppointments];
    if (sortMode === "upcoming") {
      arr.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    } else if (sortMode === "recent") {
      arr.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    } else if (sortMode === "client") {
      arr.sort((a, b) => (a.clientName || "").localeCompare(b.clientName || ""));
    }
    return arr;
  }, [filteredAppointments, sortMode]);

  /* --------------------------------- Render -------------------------------- */

  if (loading) {
    return (
      <section className="relative w-full py-12 px-4 sm:px-6 lg:px-8 text-[#3e2e3d] min-h-screen bg-gradient-to-br from-[#e5d4c3] via-[#f1e1d3] to-[#e5d4c3]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="h-12 w-72 rounded-2xl bg-white/40 backdrop-blur-sm animate-pulse" />
            <div className="h-12 w-96 rounded-2xl bg-white/40 backdrop-blur-sm animate-pulse" />
          </div>
          {/* Premium skeleton cards */}
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-2xl bg-gradient-to-r from-white/30 via-white/20 to-white/30 backdrop-blur-sm border border-white/30 animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-x-hidden w-full py-8 px-4 sm:px-6 lg:px-8 text-[#3e2e3d] min-h-screen box-border">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#c1a38f]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#a78974]/10 rounded-full blur-3xl" />
      </div>

      {/* Action loading overlay */}
      {actionLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-white/50 rounded-full animate-spin" style={{ animationDuration: '0.8s' }} />
          </div>
        </motion.div>
      )}

      <div className="relative max-w-7xl mx-auto z-10">
        {/* Premium Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl md:text-6xl font-[Soligant] tracking-tight bg-gradient-to-r from-[#3c2b21] via-[#5f4b5a] to-[#3c2b21] bg-clip-text text-transparent mb-2"
              >
                Appointments
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-sm text-[#6b5c55] font-medium"
              >
                Manage and track all your appointments
              </motion.p>
            </div>

            {/* Stats Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/50 shadow-lg"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-[#3c2b21]">{appointments.length}</div>
                <div className="text-xs text-[#6b5c55] uppercase tracking-wider">Total</div>
              </div>
              <div className="h-12 w-px bg-[#e8dcd4]" />
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {appointments.filter(a => a.status === 'confirmed').length}
                </div>
                <div className="text-xs text-[#6b5c55] uppercase tracking-wider">Confirmed</div>
              </div>
            </motion.div>
          </div>

          {/* Premium Search and Filters Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col md:flex-row gap-3 w-full"
          >
            <div className="relative flex-1 group">
              <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/60 rounded-2xl blur-sm group-hover:blur-md transition-all duration-300" />
              <div className="relative flex items-center">
                <div className="absolute left-4 p-2 rounded-lg bg-white/50 backdrop-blur-sm">
                  <SearchIcon className="h-5 w-5 text-[#6b5c55]" />
                </div>
                <input
                  type="text"
                  placeholder="Search by client, service, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-12 py-3.5 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 focus:outline-none focus:ring-2 focus:ring-[#c1a38f]/50 focus:border-[#c1a38f] text-sm md:text-base placeholder:text-[#9b8a83] shadow-lg transition-all duration-300"
                />
                {searchQuery && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Clear search"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 p-1.5 rounded-lg bg-white/60 hover:bg-white/80 backdrop-blur-sm transition-colors"
                  >
                    <X className="h-4 w-4 text-[#6b5c55]" />
                  </motion.button>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              {/* View Toggle */}
              <div className="flex rounded-xl bg-white/70 backdrop-blur-xl border border-white/50 overflow-hidden">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode("list")}
                  className={`px-4 py-3.5 flex items-center gap-2 text-sm font-medium transition-all ${
                    viewMode === "list"
                      ? "bg-gradient-to-r from-[#3c2b21] to-[#5f4b5a] text-white"
                      : "text-[#3c2b21] hover:bg-white/50"
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">List</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode("calendar")}
                  className={`px-4 py-3.5 flex items-center gap-2 text-sm font-medium transition-all ${
                    viewMode === "calendar"
                      ? "bg-gradient-to-r from-[#3c2b21] to-[#5f4b5a] text-white"
                      : "text-[#3c2b21] hover:bg-white/50"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Calendar</span>
                </motion.button>
              </div>

              {viewMode === "list" && (
                <PremiumSelect
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value)}
                  options={[
                    { value: "upcoming", label: "Sort by upcoming" },
                    { value: "recent", label: "Sort by recent" },
                    { value: "client", label: "Sort by client" },
                  ]}
                  className="min-w-[180px]"
                />
              )}

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={fetchData}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#3c2b21] to-[#5f4b5a] text-white hover:from-[#5f4b5a] hover:to-[#3c2b21] transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
              >
                <RefreshCcw className="w-5 h-5" />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* Premium Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 rounded-2xl border border-rose-200/60 bg-gradient-to-r from-rose-50 to-red-50 backdrop-blur-xl text-rose-800 p-5 flex items-start gap-4 shadow-lg"
            >
              <div className="p-2 rounded-xl bg-rose-100/50">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold mb-1">Failed to fetch latest data</div>
                <div className="text-sm opacity-90">{error}</div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchData}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-700 hover:to-red-700 text-sm font-medium shadow-md transition-all"
              >
                Retry
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>{message && <MessageBanner message={message} />}</AnimatePresence>

        {/* Premium Content Area */}
        {viewMode === "calendar" ? (
          <div className="mt-6" style={{ minHeight: "600px" }}>
            <CalendarView
              appointments={sortedAppointments}
              onAppointmentClick={(appt) => {
                setSelectedAppointment(appt);
                setIsMoreInfoModalOpen(true);
              }}
              viewMode="month"
            />
          </div>
        ) : sortedAppointments.length === 0 && !loading ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-12 rounded-3xl bg-gradient-to-br from-white/60 via-white/40 to-white/20 backdrop-blur-xl border border-white/50 shadow-[0_20px_60px_rgba(60,43,33,0.15)] p-16 text-center"
          >
            <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200/50 mb-6">
              <Calendar className="h-16 w-16 text-amber-600" />
            </div>
            <h3 className="text-3xl font-semibold text-[#3c2b21] mb-3">No Appointments Found</h3>
            <p className="text-[#6b5c55] max-w-md mx-auto mb-6">
              {searchQuery
                ? "No appointments match your search criteria. Try adjusting your search terms."
                : "You don't have any appointments yet. Create one to get started!"}
            </p>
            {searchQuery && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSearchQuery("")}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#c1a38f] to-[#a78974] text-white font-medium shadow-lg hover:shadow-xl transition-all"
              >
                Clear Search
              </motion.button>
            )}
          </motion.div>
        ) : (
          <AppointmentList
            appointments={sortedAppointments}
            onEdit={(appt) => {
              setSelectedAppointment(appt);
              setIsEditModalOpen(true);
            }}
            onInfo={(appt) => {
              setSelectedAppointment(appt);
              setIsMoreInfoModalOpen(true);
            }}
            onDelete={async (id) => {
              if (!window.confirm("Delete this appointment?")) return;

              // Optimistic UI: remove immediately, restore on failure
              const prev = appointments;
              const next = prev.filter((a) => a.id !== id);
              setAppointments(next);

              try {
                setActionLoading(true);
                const staffName = `${localStorage.getItem("first_name") || ""} ${localStorage.getItem("last_name") || ""}`.trim();
                await axiosInstance.delete(`/appointments/${id}`, {
                  data: { changed_by: staffName || "System" },
                });
                await fetchData();
                setTimedMessage(setMessage, "Appointment deleted", "success");
              } catch (e) {
                setAppointments(prev); // rollback
                setTimedMessage(setMessage, "Failed to delete", "error");
              } finally {
                setActionLoading(false);
              }
            }}
          />
        )}
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
