/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  RefreshCcw,
  Plus,
  Download,
  ChevronDown,
  Search as SearchIcon,
  X,
  Users,
  AlertTriangle,
} from "lucide-react";

import axiosInstance from "../../utils/axiosInstance";
import MessageBanner from "../components/appointments/MessageBanner";
import { setTimedMessage } from "../components/appointments/utils";
import ClientList from "../components/clients/ClientList";
import ClientMoreInfoModal from "../components/clients/ClientMoreInfoModal";
import CreateClientModal from "../components/clients/CreateClientModal";
import DeleteClientModal from "../components/clients/DeleteClientModal";
import EditClientModal from "../components/clients/EditClientModal";
import PremiumSelect from "../components/common/PremiumSelect";

/* -------------------------------------------------------------------------- */
/* Small utilities                                                             */
/* -------------------------------------------------------------------------- */
function useDebouncedValue(value, delay = 220) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function downloadBlobCSV(rows, filename = "clients.csv") {
  if (!rows?.length) return;
  const headers = [
    "client_id",
    "first_name",
    "last_name",
    "email",
    "phone_number",
    "address",
    "city",
    "postal_code",
  ];
  const escape = (v) => {
    if (v == null) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */
const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [selectedClient, setSelectedClient] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebouncedValue(searchQuery, 220);

  const [sortKey, setSortKey] = useState("first_name"); // first_name | last_name | email | city | created
  const [sortDir, setSortDir] = useState("asc"); // asc | desc

  const searchRef = useRef(null);

  /* ------------------------------ FETCH CLIENTS ----------------------------- */
  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/clients");
      // Expecting array of clients with fields used below
      setClients(res.data || []);
    } catch (err) {
      console.error("fetchClients error:", err);
      setTimedMessage(setMessage, "Failed to load clients.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  /* ------------------------------ KEY SHORTCUTS ----------------------------- */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key.toLowerCase() === "n" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShowCreateModal(true);
      }
      if (e.key.toLowerCase() === "r" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        fetchClients();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fetchClients]);

  /* --------------------------------- FILTER -------------------------------- */
  const filteredClients = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    const base = q
      ? clients.filter((c) => {
          const sFirst = c.first_name?.toLowerCase() || "";
          const sLast = c.last_name?.toLowerCase() || "";
          const sEmail = c.email?.toLowerCase() || "";
          const sPhone = c.phone_number?.toLowerCase() || "";
          const sCity = c.city?.toLowerCase() || "";
          return (
            sFirst.includes(q) ||
            sLast.includes(q) ||
            sEmail.includes(q) ||
            sPhone.includes(q) ||
            sCity.includes(q)
          );
        })
      : clients.slice();

    const dir = sortDir === "asc" ? 1 : -1;
    return base.sort((a, b) => {
      const av =
        sortKey === "created"
          ? a.created_at || a.created || ""
          : (a?.[sortKey] ?? "");
      const bv =
        sortKey === "created"
          ? b.created_at || b.created || ""
          : (b?.[sortKey] ?? "");
      return String(av).localeCompare(String(bv), undefined, {
        sensitivity: "base",
        numeric: true,
      }) * dir;
    });
  }, [clients, debouncedQuery, sortKey, sortDir]);

  /* --------------------------------- DELETE -------------------------------- */
  const handleDelete = async () => {
    if (!selectedClient) return;
    try {
      setActionLoading(true);
      await axiosInstance.delete(`/clients/${selectedClient.client_id}`);
      setTimedMessage(setMessage, "Client deleted successfully.", "success");
      setShowDeleteModal(false);
      setSelectedClient(null);
      await fetchClients();
    } catch (err) {
      console.error("deleteClient error:", err);
      setTimedMessage(setMessage, "Failed to delete client.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  /* --------------------------------- UI ------------------------------------ */
  const total = clients.length;
  const shown = filteredClients.length;

  if (loading) {
    return (
      <section className="relative w-full py-12 px-4 sm:px-6 lg:px-8 text-[#3e2e3d] min-h-screen">
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
                Clients
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-sm text-[#6b5c55] font-medium"
              >
                Manage and track all your clients
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
                <div className="text-2xl font-bold text-[#3c2b21]">{total}</div>
                <div className="text-xs text-[#6b5c55] uppercase tracking-wider">Total</div>
              </div>
              <div className="h-12 w-px bg-[#e8dcd4]" />
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{shown}</div>
                <div className="text-xs text-[#6b5c55] uppercase tracking-wider">Showing</div>
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
                  ref={searchRef}
                  type="text"
                  placeholder="Search by name, email, phone, or city..."
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
              {/* Sort */}
              <div className="flex items-center gap-2">
                <PremiumSelect
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                  options={[
                    { value: "first_name", label: "First name" },
                    { value: "last_name", label: "Last name" },
                    { value: "email", label: "Email" },
                    { value: "city", label: "City" },
                    { value: "created", label: "Created" },
                  ]}
                  className="min-w-[140px]"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                  className="px-4 py-3.5 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/50 hover:bg-white/90 text-sm font-medium shadow-lg transition-all duration-300"
                  title={`Sort ${sortDir === "asc" ? "descending" : "ascending"}`}
                >
                  {sortDir === "asc" ? "Asc" : "Desc"}
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={fetchClients}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#3c2b21] to-[#5f4b5a] text-white hover:from-[#5f4b5a] hover:to-[#3c2b21] transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
                title="Refresh (R)"
              >
                <RefreshCcw className="w-5 h-5" />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => downloadBlobCSV(filteredClients)}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/50 hover:bg-white/90 text-[#3c2b21] transition-all duration-300 shadow-lg hover:shadow-xl"
                title="Export CSV"
              >
                <Download className="w-5 h-5" />
                <span className="hidden sm:inline">Export</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#c1a38f] to-[#a78974] hover:from-[#a78974] hover:to-[#8d6f5a] text-white transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
                title="New client (N)"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">New Client</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* Messages */}
        <AnimatePresence>{message && <MessageBanner message={message} />}</AnimatePresence>

        {/* Premium Content Area */}
        {shown === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-12 rounded-3xl bg-gradient-to-br from-white/60 via-white/40 to-white/20 backdrop-blur-xl border border-white/50 shadow-[0_20px_60px_rgba(60,43,33,0.15)] p-16 text-center"
          >
            <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 mb-6">
              <Users className="h-16 w-16 text-blue-600" />
            </div>
            <h3 className="text-3xl font-semibold text-[#3c2b21] mb-3">No Clients Found</h3>
            <p className="text-[#6b5c55] max-w-md mx-auto mb-6">
              {searchQuery
                ? "No clients match your search criteria. Try adjusting your search terms."
                : "You don't have any clients yet. Create one to get started!"}
            </p>
            <div className="flex justify-center gap-3">
              {searchQuery && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchQuery("")}
                  className="px-6 py-3 rounded-xl bg-white/70 backdrop-blur-xl border border-white/50 text-[#3c2b21] font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Clear Search
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#c1a38f] to-[#a78974] text-white font-medium shadow-lg hover:shadow-xl transition-all"
              >
                New Client
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <ClientList
            clients={filteredClients}
            onEdit={(c) => {
              setSelectedClient(c);
              setShowEditModal(true);
            }}
            onDelete={(c) => {
              setSelectedClient(c);
              setShowDeleteModal(true);
            }}
            onMoreInfo={(c) => {
              setSelectedClient(c);
              setShowInfoModal(true);
            }}
          />
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateClientModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={async () => {
              setShowCreateModal(false);
              await fetchClients();
            }}
            setMessage={setMessage}
          />
        )}

        {showEditModal && selectedClient && (
          <EditClientModal
            client={selectedClient}
            onClose={() => setShowEditModal(false)}
            onSuccess={async () => {
              setShowEditModal(false);
              await fetchClients();
            }}
            setMessage={setMessage}
          />
        )}

        {showInfoModal && selectedClient && (
          <ClientMoreInfoModal
            client={selectedClient}
            onClose={() => setShowInfoModal(false)}
          />
        )}

        {showDeleteModal && selectedClient && (
          <DeleteClientModal
            client={selectedClient}
            onCancel={() => {
              setShowDeleteModal(false);
              setSelectedClient(null);
            }}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default ClientsPage;
