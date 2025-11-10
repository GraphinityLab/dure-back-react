/* eslint-disable no-unused-vars */
import React, {
  useEffect,
  useState,
} from 'react';

import { motion } from 'framer-motion';

import axiosInstance from '../../utils/axiosInstance';
import MessageBanner from '../components/appointments/MessageBanner';
import { setTimedMessage } from '../components/appointments/utils';

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [showRolePermsModal, setShowRolePermsModal] = useState(false);
  const [showAllPermsModal, setShowAllPermsModal] = useState(false);

  // Fetch all roles
  const fetchRoles = async () => {
    try {
      const res = await axiosInstance.get("/rolePermissions");
      setRoles(res.data.roles);
    } catch (err) {
      console.error(err);
      setTimedMessage(setMessage, "Failed to load roles.", "error");
    }
  };

  // Fetch all permissions
  const fetchPermissions = async () => {
    try {
      const res = await axiosInstance.get("/rolePermissions/permissions");
      setPermissions(res.data.permissions);
    } catch (err) {
      console.error(err);
      setTimedMessage(setMessage, "Failed to load permissions.", "error");
    }
  };

  // Fetch both initially
  useEffect(() => {
    setLoading(true);
    Promise.all([fetchRoles(), fetchPermissions()]).finally(() => setLoading(false));
  }, []);

  // Fetch latest permissions for a role
  const fetchRolePermissions = async (role) => {
    try {
      const res = await axiosInstance.get(`/rolePermissions/${role.role_id}/permissions`);
      setSelectedRole({ ...role, permissions: res.data.permissions });
    } catch (err) {
      console.error(err);
      setTimedMessage(setMessage, "Failed to load role permissions.", "error");
    }
  };

  // Toggle permission for a role
  const togglePermission = async (roleId, permId, assigned) => {
    try {
      if (assigned) {
        await axiosInstance.delete(`/rolePermissions/${roleId}/permissions/${permId}`);
      } else {
        await axiosInstance.post(`/rolePermissions/${roleId}/permissions`, { permission_id: permId });
      }
      // Refresh only the selected role permissions
      await fetchRolePermissions(selectedRole);
      setTimedMessage(setMessage, "Permissions updated successfully.", "success");
    } catch (err) {
      console.error(err);
      setTimedMessage(setMessage, "Failed to update permissions.", "error");
    }
  };

  return (
    <section className="relative overflow-x-hidden w-full py-20 px-4 sm:px-6 lg:px-8 text-[#3e2e3d] min-h-screen box-border">
      <div className="relative max-w-7xl mx-auto z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-[Soligant] tracking-tight truncate mb-6"
        >
          Roles & Permissions
        </motion.h1>

        {message && <MessageBanner message={message} setMessage={setMessage} />}

        {loading ? (
          <div className="w-full flex justify-center mt-12">
            <div className="w-14 h-14 border-4 border-[#c1a38f] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : roles.length === 0 ? (
          <p className="text-center text-gray-500 mt-12">No roles available.</p>
        ) : (
          <div className="mt-6">
            <table className="min-w-full bg-white rounded-xl border border-[#e8dcd4] shadow-sm">
              <thead className="bg-[#c1a38f]/20 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Role Name</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.role_id} className="border-t border-[#e8dcd4] hover:bg-[#f9f5f2] transition">
                    <td className="px-4 py-2 font-medium">{role.role_name}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        onClick={async () => { await fetchRolePermissions(role); setShowRolePermsModal(true); }}
                        className="px-3 py-1 bg-[#c1a38f]/70 rounded hover:bg-[#c1a38f]"
                      >
                        View Role Permissions
                      </button>
                      <button
                        onClick={async () => { await fetchRolePermissions(role); setShowAllPermsModal(true); }}
                        className="px-3 py-1 bg-[#3e2e3d] text-white rounded hover:bg-[#2b1f2a]"
                      >
                        Manage Permissions
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Role Permissions Modal */}
        {showRolePermsModal && selectedRole && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-96 p-6 relative">
              <h2 className="text-xl font-semibold mb-4">{selectedRole.role_name} Permissions</h2>
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {selectedRole.permissions.length > 0 ? (
                  selectedRole.permissions.map((perm) => (
                    <li key={perm.permission_id} className="px-2 py-1 border rounded">{perm.permission_name}</li>
                  ))
                ) : (
                  <p className="text-gray-500">No permissions assigned.</p>
                )}
              </ul>
              <button
                className="mt-4 px-4 py-2 bg-[#c1a38f] rounded hover:bg-[#b08c75]"
                onClick={() => setShowRolePermsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* All Permissions Modal with checkboxes */}
        {showAllPermsModal && selectedRole && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-96 p-6 relative">
              <h2 className="text-xl font-semibold mb-4">Manage Permissions for {selectedRole.role_name}</h2>
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {permissions.map((perm) => {
                  const assigned = selectedRole.permissions.some(p => p.permission_id === perm.permission_id);
                  return (
                    <li key={perm.permission_id} className="flex justify-between items-center px-2 py-1 border rounded">
                      <div>
                        <p className="font-medium">{perm.permission_name}</p>
                        {perm.permission_description && <p className="text-gray-500 text-sm">{perm.permission_description}</p>}
                      </div>
                      <input
                        type="checkbox"
                        checked={assigned}
                        onChange={() => togglePermission(selectedRole.role_id, perm.permission_id, assigned)}
                        className="w-5 h-5 cursor-pointer accent-[#3e2e3d]"
                      />
                    </li>
                  );
                })}
              </ul>
              <button
                className="mt-4 px-4 py-2 bg-[#c1a38f] rounded hover:bg-[#b08c75]"
                onClick={() => setShowAllPermsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default RolesPage;
