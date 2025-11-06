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
import MessageBanner from '../components/appointments/MessageBanner';
import { setTimedMessage } from '../components/appointments/utils';
import ClientList from '../components/clients/ClientList';
import ClientMoreInfoModal from '../components/clients/ClientMoreInfoModal';
import CreateClientModal from '../components/clients/CreateClientModal';
import DeleteClientModal from '../components/clients/DeleteClientModal';
import EditClientModal from '../components/clients/EditClientModal';

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

  // -------------------- FETCH CLIENTS --------------------
  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/clients");
      setClients(res.data);
    } catch (err) {
      console.error("fetchClients error:", err);
      setTimedMessage(setMessage, "Failed to load clients.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // -------------------- FILTER CLIENTS --------------------
  const filteredClients = clients.filter(
    (c) =>
      c.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (c.phone_number?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  // -------------------- DELETE CLIENT --------------------
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

  return (
    <section className="relative overflow-x-hidden w-full py-20 px-4 sm:px-6 lg:px-8 text-[#3e2e3d] min-h-screen box-border font-[CaviarDreams]">
      {/* LOADING SPINNER */}
      {actionLoading && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50">
          <div className="w-14 h-14 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="relative max-w-6xl mx-auto z-10">
        {/* HEADER + SEARCH + ADD */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 w-full">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-[Soligant] tracking-tight truncate"
          >
            Clients
          </motion.h1>

          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-[#e8dcd4] focus:outline-none focus:ring-2 focus:ring-[#c1a38f] text-sm md:text-base"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchClients}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3e2e3d] text-white hover:bg-[#5f4b5a] transition shadow"
            >
              <RefreshCcw className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#c1a38f] text-white hover:bg-[#a78974] transition shadow"
            >
              + New Client
            </motion.button>
          </div>
        </div>

        {/* MESSAGE BANNER */}
        <AnimatePresence>
          {message && <MessageBanner message={message} />}
        </AnimatePresence>

        {/* CLIENTS LIST */}
        {loading ? (
          <p className="text-center mt-10">Loading clients...</p>
        ) : (
          <ClientList
            clients={filteredClients}
            onEdit={(c) => { setSelectedClient(c); setShowEditModal(true); }}
            onDelete={(c) => { setSelectedClient(c); setShowDeleteModal(true); }}
            onMoreInfo={(c) => { setSelectedClient(c); setShowInfoModal(true); }}
          />
        )}
      </div>

      {/* MODALS */}
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
            onCancel={() => { setShowDeleteModal(false); setSelectedClient(null); }}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default ClientsPage;
