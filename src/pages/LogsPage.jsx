/* eslint-disable no-unused-vars */
import React, {
  useEffect,
  useState,
} from 'react';

import { motion } from 'framer-motion';
import {
  Info,
  RefreshCcw,
} from 'lucide-react';

import axiosInstance from '../../utils/axiosInstance';
import MessageBanner from '../components/appointments/MessageBanner';
import { setTimedMessage } from '../components/appointments/utils';

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);

  // Fetch all logs
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/logs");
      setLogs(res.data.logs);
    } catch (err) {
      console.error(err);
      setTimedMessage(setMessage, "Failed to load logs.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <section className="relative overflow-x-auto w-full py-20 px-4 sm:px-6 lg:px-8 text-[#3e2e3d] min-h-screen box-border font-[CaviarDreams]">
      {/* Page Header */}
      <div className="relative max-w-7xl mx-auto z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 w-full">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-[Soligant] tracking-tight truncate"
          >
            System Logs
          </motion.h1>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchLogs}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3e2e3d] text-white hover:bg-[#5f4b5a] transition shadow"
          >
            <RefreshCcw className="w-5 h-5" /> Refresh
          </motion.button>
        </div>

        {message && <MessageBanner message={message} setMessage={setMessage} />}

        {/* Table */}
        {loading ? (
          <div className="w-full flex justify-center mt-12">
            <div className="w-14 h-14 border-4 border-[#c1a38f] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : logs.length === 0 ? (
          <p className="text-center text-gray-500 mt-12">No logs available.</p>
        ) : (
          <div className="overflow-x-auto mt-6 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#c1a38f] scrollbar-track-[#f9f5f2] rounded-lg">
            <table className="min-w-full bg-white rounded-xl border border-[#e8dcd4] shadow-sm">
              <thead className="bg-[#c1a38f]/20">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold">
                    Entity
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">
                    Entity ID
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">
                    Action
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">
                    Changed By
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">
                    Created At
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-semibold">
                    More Info
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.log_id}
                    className="border-t border-[#e8dcd4] hover:bg-[#f9f5f2] transition"
                  >
                    <td className="px-4 py-2">{log.entity_type}</td>
                    <td className="px-4 py-2">{log.entity_id}</td>
                    <td className="px-4 py-2 capitalize">{log.action}</td>
                    <td className="px-4 py-2">{log.changed_by || "system"}</td>
                    <td className="px-4 py-2">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-3 py-1 rounded-lg bg-[#3e2e3d] text-white hover:bg-[#5f4b5a] transition text-sm flex items-center gap-1 mx-auto"
                      >
                        <Info className="w-4 h-4" /> View
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
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 relative text-[#3e2e3d]"
          >
            <h2 className="text-2xl font-[Soligant] mb-4">
              Log Details (#{selectedLog.log_id})
            </h2>

            <div className="space-y-2 text-sm">
              <p>
                <strong>Entity:</strong> {selectedLog.entity_type} (ID:{" "}
                {selectedLog.entity_id})
              </p>
              <p>
                <strong>Action:</strong> {selectedLog.action}
              </p>
              <p>
                <strong>Changed By:</strong>{" "}
                {selectedLog.changed_by || "system"}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {new Date(selectedLog.created_at).toLocaleString()}
              </p>

              <hr className="my-3" />
              <p className="font-semibold text-[#3e2e3d] mb-2">Changes:</p>

              {selectedLog.changes ? (
                (() => {
                  // Convert old/new objects into per-field before/after
                  const oldObj = selectedLog.changes.old || {};
                  const newObj = selectedLog.changes.new || {};
                  const allKeys = Array.from(
                    new Set([...Object.keys(oldObj), ...Object.keys(newObj)])
                  );
                  const fieldChanges = allKeys.map((key) => ({
                    field: key,
                    before: oldObj[key],
                    after: newObj[key],
                  }));

                  return fieldChanges.length > 0 ? (
                    <table className="min-w-full bg-[#f9f5f2] border border-[#e8dcd4] rounded-lg text-sm text-left">
                      <thead>
                        <tr>
                          <th className="px-3 py-1 border-b border-[#e8dcd4]">
                            Field
                          </th>
                          <th className="px-3 py-1 border-b border-[#e8dcd4]">
                            Before
                          </th>
                          <th className="px-3 py-1 border-b border-[#e8dcd4]">
                            After
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {fieldChanges.map(({ field, before, after }) => (
                          <tr
                            key={field}
                            className="hover:bg-[#f1ece9] transition"
                          >
                            <td className="px-3 py-1 border-b border-[#e8dcd4] font-medium">
                              {field}
                            </td>
                            <td className="px-3 py-1 border-b border-[#e8dcd4]">
                              {before?.toString()}
                            </td>
                            <td className="px-3 py-1 border-b border-[#e8dcd4]">
                              {after?.toString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-gray-500">No changes recorded.</p>
                  );
                })()
              ) : (
                <p className="text-gray-500">No changes recorded.</p>
              )}
            </div>

            <button
              onClick={() => setSelectedLog(null)}
              className="absolute top-3 right-3 px-3 py-1 text-sm rounded-lg bg-[#c1a38f] text-white hover:bg-[#a78974] transition"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </section>
  );
};

export default LogsPage;
