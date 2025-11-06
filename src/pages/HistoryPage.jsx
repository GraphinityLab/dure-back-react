/* eslint-disable no-unused-vars */
import React, {
  useEffect,
  useState,
} from 'react';

import {
  FaInfoCircle,
  FaTrash,
} from 'react-icons/fa';

import axiosInstance from '../../utils/axiosInstance';
import MessageBanner from '../components/appointments/MessageBanner';
import { setTimedMessage } from '../components/appointments/utils';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [modalData, setModalData] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/history');
      setHistory(res.data.history);
    } catch (err) {
      console.error(err);
      setTimedMessage(setMessage, 'Failed to load appointment history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (history_id) => {
    if (!window.confirm('Are you sure you want to delete this history record?')) return;

    try {
      setActionLoading(true);
      await axiosInstance.delete(`/history/${history_id}`);
      setTimedMessage(setMessage, 'History record deleted successfully', 'success');
      fetchHistory();
    } catch (err) {
      console.error(err);
      setTimedMessage(setMessage, err?.response?.data?.message || 'Failed to delete history record', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <section className="relative w-full py-20 px-4 sm:px-6 lg:px-8 min-h-screen text-[#3e2e3d] font-[CaviarDreams]">
      {actionLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-14 h-14 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl md:text-5xl font-[Soligant] tracking-tight">Appointment History</h1>
          <button
            onClick={fetchHistory}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3e2e3d] text-white hover:bg-[#5f4b5a] transition shadow"
          >
            Refresh
          </button>
        </div>

        {message && <MessageBanner message={message} setMessage={setMessage} />}

        {loading ? (
          <div className="w-full flex justify-center mt-12">
            <div className="w-14 h-14 border-4 border-[#c1a38f] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : history.length === 0 ? (
          <p className="text-center text-gray-500 mt-12">No appointment history found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl border border-[#e8dcd4] shadow-sm">
              <thead className="bg-[#c1a38f]/20">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Client</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Service</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Start - End</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.history_id} className="border-t border-[#e8dcd4] hover:bg-[#f9f5f2] text-sm">
                    <td className="px-4 py-2 font-[Soligant] truncate">{item.client_name}</td>
                    <td className="px-4 py-2 truncate">{item.service_name}</td>
                    <td className="px-4 py-2 truncate">{item.start_time} - {item.end_time}</td>
                    <td className="px-4 py-2 flex justify-center gap-2">
                      <button
                        onClick={() => setModalData(item)}
                        className="p-2 rounded-full bg-[#3e2e3d] text-white hover:bg-[#5f4b5a] transition"
                      >
                        <FaInfoCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.history_id)}
                        className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg overflow-y-auto max-h-[80vh]">
            <h2 className="text-2xl font-semibold mb-4">Appointment Details</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Client:</strong> {modalData.client_name}</p>
              <p><strong>Service:</strong> {modalData.service_name}</p>
              <p><strong>Price:</strong> {modalData.service_price}</p>
              <p><strong>Category:</strong> {modalData.service_category || '-'}</p>
              <p><strong>Status:</strong> {modalData.status}</p>
              <p><strong>Notes:</strong> {modalData.notes || '-'}</p>
              <p><strong>Staff ID:</strong> {modalData.staff_id || 'N/A'}</p>
              <p><strong>Changed By:</strong> {modalData.changed_by || 'system'}</p>
              <p><strong>Appointment Date:</strong> {new Date(modalData.appointment_date).toLocaleDateString()}</p>
              <p><strong>Start - End:</strong> {modalData.start_time} - {modalData.end_time}</p>
              <p><strong>Created At:</strong> {new Date(modalData.created_at).toLocaleString()}</p>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setModalData(null)}
                className="px-4 py-2 bg-[#3e2e3d] text-white rounded-lg hover:bg-[#5f4b5a] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HistoryPage;
