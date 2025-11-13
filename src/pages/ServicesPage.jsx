/* eslint-disable no-unused-vars */
import React, {
  useEffect,
  useState,
} from 'react';

import {
  AnimatePresence,
  motion,
} from 'framer-motion';
import { RefreshCcw, Search as SearchIcon, X, Package, Plus } from 'lucide-react';
import {
  FaCameraRetro,
  FaCut,
  FaFeather,
  FaLeaf,
  FaSnowflake,
  FaSpa,
} from 'react-icons/fa';
import { GiFingernail } from 'react-icons/gi';

import axiosInstance from '../../utils/axiosInstance';
import MessageBanner from '../components/appointments/MessageBanner';
import { setTimedMessage } from '../components/appointments/utils';
import CreateServiceModal from '../components/services/CreateServiceModal';
import EditServiceModal from '../components/services/EditServiceModal';
import ServiceList from '../components/services/ServiceList';
import ServiceMoreInfoModal from '../components/services/ServiceMoreInfoModal';

// -------------------- CATEGORY ICONS --------------------
const getCategoryIcon = (category) => {
  switch (category) {
    case "Facials & Skin Treatments":
      return <FaLeaf className="inline mr-1" />;
    case "Massage Therapy":
      return <FaSpa className="inline mr-1" />;
    case "Nail Services":
      return <GiFingernail className="inline mr-1" />;
    case "Makeup Services":
      return <FaSnowflake className="inline mr-1" />;
    case "Waxing & Hair Removal":
      return <FaFeather className="inline mr-1" />;
    case "Hairstyling":
      return <FaCut className="inline mr-1" />;
    case "Photography Studio Add-On":
      return <FaCameraRetro className="inline mr-1" />;
    default:
      return null;
  }
};

// -------------------- DELETE CONFIRMATION MODAL --------------------
const DeleteConfirmationModal = ({ title, message, onCancel, onConfirm }) => (
  <motion.div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="bg-white rounded-2xl shadow-xl bg-white/70 p-6 w-full max-w-md text-[#3e2e3d] font-[CaviarDreams]"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
    >
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <p className="mb-6 text-sm">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-[#c1a38f] text-[#3e2e3d] hover:bg-[#f5eeee] transition"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
        >
          Delete
        </button>
      </div>
    </motion.div>
  </motion.div>
);

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedServiceForModal, setSelectedServiceForModal] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [deleteServiceId, setDeleteServiceId] = useState(null);

  // -------------------- FETCH DATA --------------------
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/services");
      const rawServices = res.data.services || [];
      const mappedServices = rawServices.map((s) => ({
        id: s.service_id,
        name: s.name,
        duration_minutes: s.duration_minutes,
        price: s.price,
        category: s.category || "N/A",
        description: s.description || "",
      }));
      setServices(mappedServices);
    } catch (err) {
      console.error(err);
      setTimedMessage(setMessage, "Failed to fetch services", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // -------------------- FILTER SERVICES --------------------
  const filteredServices = services.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categoryFilteredServices =
    selectedCategory === "All"
      ? filteredServices
      : filteredServices.filter((s) => s.category === selectedCategory);

  const categories = ["All", ...Array.from(new Set(services.map((s) => s.category)))];

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
                Services
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-sm text-[#6b5c55] font-medium"
              >
                Manage your service catalog and offerings
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
                <div className="text-2xl font-bold text-[#3c2b21]">{services.length}</div>
                <div className="text-xs text-[#6b5c55] uppercase tracking-wider">Total</div>
              </div>
              <div className="h-12 w-px bg-[#e8dcd4]" />
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">{categoryFilteredServices.length}</div>
                <div className="text-xs text-[#6b5c55] uppercase tracking-wider">Showing</div>
              </div>
            </motion.div>
          </div>

          {/* Premium Search and Filters Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col md:flex-row gap-3 w-full mb-4"
          >
            <div className="relative flex-1 group">
              <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/60 rounded-2xl blur-sm group-hover:blur-md transition-all duration-300" />
              <div className="relative flex items-center">
                <div className="absolute left-4 p-2 rounded-lg bg-white/50 backdrop-blur-sm">
                  <SearchIcon className="h-5 w-5 text-[#6b5c55]" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name or category..."
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
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={fetchData}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#3c2b21] to-[#5f4b5a] text-white hover:from-[#5f4b5a] hover:to-[#3c2b21] transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
              >
                <RefreshCcw className="w-5 h-5" />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#c1a38f] to-[#a78974] hover:from-[#a78974] hover:to-[#8d6f5a] text-white transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add Service</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Premium Category Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-2"
          >
            {categories.map((cat) => (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${selectedCategory === cat
                    ? "bg-gradient-to-r from-[#3c2b21] to-[#5f4b5a] text-white shadow-lg"
                    : "bg-white/70 backdrop-blur-xl border border-white/50 text-[#3c2b21] hover:bg-white/90 shadow-sm hover:shadow-md"
                  }
                `}
              >
                <span className="text-base">{getCategoryIcon(cat)}</span>
                <span>{cat}</span>
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* Messages */}
        <AnimatePresence>{message && <MessageBanner message={message} />}</AnimatePresence>

        {/* Premium Content Area */}
        {categoryFilteredServices.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-12 rounded-3xl bg-gradient-to-br from-white/60 via-white/40 to-white/20 backdrop-blur-xl border border-white/50 shadow-[0_20px_60px_rgba(60,43,33,0.15)] p-16 text-center"
          >
            <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200/50 mb-6">
              <Package className="h-16 w-16 text-teal-600" />
            </div>
            <h3 className="text-3xl font-semibold text-[#3c2b21] mb-3">No Services Found</h3>
            <p className="text-[#6b5c55] max-w-md mx-auto mb-6">
              {searchQuery || selectedCategory !== "All"
                ? "No services match your search or filter criteria. Try adjusting your filters."
                : "You don't have any services yet. Create one to get started!"}
            </p>
            <div className="flex justify-center gap-3">
              {(searchQuery || selectedCategory !== "All") && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                  className="px-6 py-3 rounded-xl bg-white/70 backdrop-blur-xl border border-white/50 text-[#3c2b21] font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Clear Filters
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#c1a38f] to-[#a78974] text-white font-medium shadow-lg hover:shadow-xl transition-all"
              >
                Add Service
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <ServiceList
            services={categoryFilteredServices}
            onEdit={(s) => {
              setSelectedService(s);
              setIsEditModalOpen(true);
            }}
            onDelete={(id) => setDeleteServiceId(id)}
            onMoreInfo={(s) => setSelectedServiceForModal(s)}
          />
        )}
      </div>

      {/* -------------------- MODALS -------------------- */}
      <AnimatePresence>
        {isEditModalOpen && selectedService && (
          <EditServiceModal
            service={selectedService}
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

        {selectedServiceForModal && (
          <ServiceMoreInfoModal
            service={selectedServiceForModal}
            onClose={() => setSelectedServiceForModal(null)}
          />
        )}

        {isCreateModalOpen && (
          <CreateServiceModal
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={async () => {
              setActionLoading(true);
              await fetchData();
              setIsCreateModalOpen(false);
              setActionLoading(false);
            }}
            setMessage={setMessage}
          />
        )}

        {deleteServiceId && (
          <DeleteConfirmationModal
            title="Delete Service"
            message="Are you sure you want to delete this service? This action cannot be undone."
            onCancel={() => setDeleteServiceId(null)}
            onConfirm={async () => {
              try {
                setActionLoading(true);
                await axiosInstance.delete(`/services/${deleteServiceId}`);
                await fetchData();
                setTimedMessage(setMessage, "Service deleted!", "success");
              } catch {
                setTimedMessage(setMessage, "Failed to delete service.", "error");
              } finally {
                setActionLoading(false);
                setDeleteServiceId(null);
              }
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default ServicesPage;
