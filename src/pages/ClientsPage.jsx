/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  RefreshCcw,
  Plus,
  Download,
  ChevronDown,
  Search as SearchIcon,
} from "lucide-react";

import axiosInstance from "../../utils/axiosInstance";
import MessageBanner from "../components/appointments/MessageBanner";
import { setTimedMessage } from "../components/appointments/utils";
import ClientList from "../components/clients/ClientList";
import ClientMoreInfoModal from "../components/clients/ClientMoreInfoModal";
import CreateClientModal from "../components/clients/CreateClientModal";
import DeleteClientModal from "../components/clients/DeleteClientModal";
import EditClientModal from "../components/clients/EditClientModal";

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

  return (
    <section className="relative overflow-x-hidden w-full py-20 px-4 sm:px-6 lg:px-8 text-[#3e2e3d] min-h-screen box-border">
      {/* Action overlay */}
      {actionLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-14 h-14 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div className="relative max-w-6xl mx-auto z-10">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 w-full">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="min-w-0"
            >
              <h1 className="text-4xl md:text-5xl font-[Soligant] tracking-tight truncate">
                Clients
              </h1>
              <div className="mt-1 text-sm text-[#6e5a4f]">
                Showing <span className="font-medium">{shown}</span> of{" "}
                <span className="font-medium">{total}</span>
              </div>
            </motion.div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
              {/* Search */}
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b7a71]" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder='Search "akshat", "bolton", or email'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 rounded-lg border border-[#e8dcd4] bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-[#c1a38f] min-w-[260px]"
                />
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-[#e8dcd4] bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-[#c1a38f]"
                  >
                    <option value="first_name">First name</option>
                    <option value="last_name">Last name</option>
                    <option value="email">Email</option>
                    <option value="city">City</option>
                    <option value="created">Created</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b7a71]" />
                </div>

                <button
                  onClick={() =>
                    setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                  }
                  className="px-3 py-2 rounded-lg border border-[#e8dcd4] bg-white/80 text-sm hover:bg-white transition"
                  title={`Sort ${sortDir === "asc" ? "descending" : "ascending"}`}
                >
                  {sortDir === "asc" ? "Asc" : "Desc"}
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={fetchClients}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3e2e3d] text-white hover:bg-[#5f4b5a] transition shadow"
                  title="Refresh (R)"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Refresh
                </motion.button>

                <button
                  onClick={() => downloadBlobCSV(filteredClients)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#e8dcd4] bg-white/80 hover:bg-white transition"
                  title="Export CSV"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#c1a38f] text-white hover:bg-[#a78974] transition shadow"
                  title="New client (N)"
                >
                  <Plus className="w-4 h-4" />
                  New Client
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <AnimatePresence>{message && <MessageBanner message={message} />}</AnimatePresence>

        {/* Content */}
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-xl border border-white/60 bg-white/60 animate-pulse"
              />
            ))}
          </div>
        ) : shown === 0 ? (
          <div className="rounded-xl border border-white/60 bg-white/70 p-10 text-center">
            <div className="text-lg font-medium text-[#3e2e3d]">
              No clients match your search
            </div>
            <div className="text-sm text-[#6e5a4f] mt-1">
              Try a different keyword or clear the search box
            </div>
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => setSearchQuery("")}
                className="px-4 py-2 rounded-lg border border-[#e8dcd4] bg-white hover:bg-white/90 transition"
              >
                Clear search
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-lg bg-[#c1a38f] text-white hover:bg-[#a78974] transition"
              >
                New client
              </button>
            </div>
          </div>
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
