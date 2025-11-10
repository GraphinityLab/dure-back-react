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
import {
  FaCameraRetro,
  FaCut,
  FaFeather,
  FaLeaf,
  FaPlus,
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

  if (loading)
    return (
      <div className="text-center mt-10 font-[CaviarDreams]">
        Loading services...
      </div>
    );

  return (
    <section className="relative overflow-x-hidden w-full py-20 px-4 sm:px-6 lg:px-8 text-[#3e2e3d] min-h-screen box-border">
      {/* -------------------- LOADING SPINNER -------------------- */}
      {actionLoading && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50">
          <div className="w-14 h-14 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="relative max-w-6xl mx-auto z-10">
        {/* -------------------- HEADER + SEARCH + ADD -------------------- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 w-full">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-[Soligant] tracking-tight truncate"
          >
            Services
          </motion.h1>

          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-[#e8dcd4] focus:outline-none focus:ring-2 focus:ring-[#c1a38f] text-sm md:text-base"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3e2e3d] text-white hover:bg-[#5f4b5a] transition shadow"
            >
              <RefreshCcw className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#c1a38f] text-white hover:bg-[#a78974] transition shadow"
            >
              <FaPlus className="w-4 h-4" />
              Add
            </motion.button>
          </div>
        </div>

        {/* -------------------- CATEGORY TABS -------------------- */}
        <div className="mb-4 w-full">
          <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_120px] gap-4 px-4 py-1 font-[CaviarDreams] text-[#3e2e3d] text-sm">
            {categories.map((cat) => (
              <div key={cat} className="relative group">
                <button
                  onClick={() => setSelectedCategory(cat)}
                  className={`truncate px-2 py-1 rounded-full text-xs font-[CaviarDreams] transition text-center w-full ${
                    selectedCategory === cat
                      ? "bg-[#3e2e3d] text-white"
                      : "bg-white text-[#3e2e3d] border border-[#d8c9c9] hover:bg-[#f5eeee]"
                  }`}
                >
                  {getCategoryIcon(cat)} {cat}
                </button>

                {/* Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-[#3e2e3d] text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                  {cat}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* -------------------- MESSAGE BANNER -------------------- */}
        <AnimatePresence>
          {message && <MessageBanner message={message} />}
        </AnimatePresence>

        {/* -------------------- SERVICES LIST -------------------- */}
        <ServiceList
          services={categoryFilteredServices}
          onEdit={(s) => {
            setSelectedService(s);
            setIsEditModalOpen(true);
          }}
          onDelete={(id) => setDeleteServiceId(id)}
          onMoreInfo={(s) => setSelectedServiceForModal(s)}
        />
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
