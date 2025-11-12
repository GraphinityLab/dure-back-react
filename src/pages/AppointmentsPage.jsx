/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RefreshCcw, AlertTriangle, Search as SearchIcon, X } from "lucide-react";

import axiosInstance from "../../utils/axiosInstance";
import AppointmentList from "../components/appointments/AppointmentList";
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
  const start = appt.start_time || appt.appointment_date || "";
  const end = appt.end_time || "";
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
    appointment_date: start,
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
      <section className="relative w-full py-20 px-6 text-[#3e2e3d] min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="h-9 w-64 rounded bg-neutral-200/70 animate-pulse" />
            <div className="h-10 w-72 rounded bg-neutral-200/70 animate-pulse" />
          </div>
          {/* Skeleton list */}
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-xl border border-[#e8dcd4] bg-white/70 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-x-hidden w-full py-20 px-4 sm:px-6 lg:px-8 text-[#3e2e3d] min-h-screen box-border">
      {/* Action loading overlay */}
      {actionLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="w-14 h-14 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div className="relative max-w-6xl mx-auto z-10">
        {/* Header + Search + Sort + Refresh */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 w-full min-w-0">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-4xl md:text-5xl font-[Soligant] tracking-tight truncate min-w-0"
          >
            Appointments
          </motion.h1>

          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto min-w-0">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by client, service, or category"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-white/70 rounded-lg border border-[#e8dcd4] focus:outline-none focus:ring-2 focus:ring-[#c1a38f] text-sm md:text-base"
              />
              <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-[#9b8a83]" />
              {searchQuery && (
                <button
                  aria-label="Clear search"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5"
                >
                  <X className="h-5 w-5 text-[#9b8a83]" />
                </button>
              )}
            </div>

            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
              className="px-3 py-2 bg-white/70 rounded-lg border border-[#e8dcd4] focus:outline-none focus:ring-2 focus:ring-[#c1a38f] text-sm md:text-base md:w-44"
            >
              <option value="upcoming">Sort by upcoming</option>
              <option value="recent">Sort by recent</option>
              <option value="client">Sort by client</option>
            </select>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3e2e3d] text-white hover:bg-[#5f4b5a] transition shadow w-full md:w-auto justify-center"
            >
              <RefreshCcw className="w-5 h-5" />
              Refresh
            </motion.button>
          </div>
        </div>

        {/* Error banner with retry */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 text-red-800 p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 mt-0.5" />
            <div className="flex-1">
              <div className="font-medium">Failed to fetch latest data</div>
              <div className="text-sm opacity-90">{error}</div>
            </div>
            <button
              onClick={fetchData}
              className="px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm"
            >
              Retry
            </button>
          </div>
        )}

        <AnimatePresence>{message && <MessageBanner message={message} />}</AnimatePresence>

        {/* Empty state */}
        {sortedAppointments.length === 0 ? (
          <div className="mt-16 text-center">
            <div className="text-2xl font-semibold mb-2">No appointments</div>
            <div className="text-[#6b5c55]">
              Try clearing search or refreshing to load the latest.
            </div>
          </div>
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
