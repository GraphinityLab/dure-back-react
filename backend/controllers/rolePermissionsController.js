import { pool } from '../utils/db.js';
import { logChange } from '../utils/logChange.js';

// -------------------- Helper --------------------
const getChangedBy = (req) => {
  const user = req.session?.user;
  if (!user) return "Unknown";
  return `${user.first_name || "Unknown"} ${user.last_name || ""}`.trim();
};

// -------------------- ROLES --------------------

// GET all roles with their permissions
export const getRoles = async (req, res) => {
  try {
    const [roles] = await pool.query("SELECT role_id, role_name, role_description FROM Roles ORDER BY role_id DESC");

    // Fetch permissions for all roles
    const [rolePerms] = await pool.query(`
      SELECT rp.role_id, p.permission_id, p.permission_name, p.permission_description
      FROM RolePermissions rp
      JOIN Permissions p ON rp.permission_id = p.permission_id
    `);

    const rolesWithPermissions = roles.map((role) => ({
      ...role,
      permissions: rolePerms.filter((rp) => rp.role_id === role.role_id),
    }));

    res.status(200).json({ roles: rolesWithPermissions });
  } catch (err) {
    console.error("getRoles error:", err);
    res.status(500).json({ message: "Server error fetching roles" });
  }
};

// CREATE a new role
export const createRole = async (req, res) => {
  try {
    const { role_name, role_description } = req.body;
    if (!role_name) return res.status(400).json({ message: "Role name is required" });

    const [result] = await pool.query(
      "INSERT INTO Roles (role_name, role_description) VALUES (?, ?)",
      [role_name, role_description || null]
    );

    const newRole = { role_id: result.insertId, role_name, role_description };

    await logChange({
      entity_type: "role",
      entity_id: result.insertId,
      action: "create",
      changed_by: getChangedBy(req),
      changes: { before: null, after: newRole },
    });

    res.status(201).json({ message: "Role created successfully", role: newRole });
  } catch (err) {
    console.error("createRole error:", err);
    res.status(500).json({ message: "Server error creating role" });
  }
};

// DELETE a role
export const deleteRole = async (req, res) => {
  try {
    const { role_id } = req.params;
    if (!role_id) return res.status(400).json({ message: "Role ID is required" });

    const [roleRows] = await pool.query("SELECT * FROM Roles WHERE role_id = ?", [role_id]);
    if (!roleRows.length) return res.status(404).json({ message: "Role not found" });

    const oldRole = roleRows[0];

    // Remove role from users
    await pool.query("UPDATE Staff SET role_id = NULL WHERE role_id = ?", [role_id]);
    await pool.query("DELETE FROM Roles WHERE role_id = ?", [role_id]);

    await logChange({
      entity_type: "role",
      entity_id: role_id,
      action: "delete",
      changed_by: getChangedBy(req),
      changes: { before: oldRole, after: null },
    });

    res.status(200).json({ message: "Role deleted successfully" });
  } catch (err) {
    console.error("deleteRole error:", err);
    res.status(500).json({ message: "Server error deleting role" });
  }
};

// -------------------- PERMISSIONS --------------------

// GET all permissions
export const getPermissions = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT permission_id, permission_name, permission_description FROM Permissions ORDER BY permission_id DESC");
    res.status(200).json({ permissions: rows });
  } catch (err) {
    console.error("getPermissions error:", err);
    res.status(500).json({ message: "Server error fetching permissions" });
  }
};

// CREATE a permission
export const createPermission = async (req, res) => {
  try {
    const { permission_name, permission_description } = req.body;
    if (!permission_name) return res.status(400).json({ message: "Permission name is required" });

    const [result] = await pool.query(
      "INSERT INTO Permissions (permission_name, permission_description) VALUES (?, ?)",
      [permission_name, permission_description || null]
    );

    const newPermission = { permission_id: result.insertId, permission_name, permission_description };

    await logChange({
      entity_type: "permission",
      entity_id: result.insertId,
      action: "create",
      changed_by: getChangedBy(req),
      changes: { before: null, after: newPermission },
    });

    res.status(201).json({ message: "Permission created successfully", permission: newPermission });
  } catch (err) {
    console.error("createPermission error:", err);
    res.status(500).json({ message: "Server error creating permission" });
  }
};

// DELETE a permission
export const deletePermission = async (req, res) => {
  try {
    const { permission_id } = req.params;
    if (!permission_id) return res.status(400).json({ message: "Permission ID is required" });

    const [permRows] = await pool.query("SELECT * FROM Permissions WHERE permission_id = ?", [permission_id]);
    if (!permRows.length) return res.status(404).json({ message: "Permission not found" });

    const oldPermission = permRows[0];

    await pool.query("DELETE FROM RolePermissions WHERE permission_id = ?", [permission_id]);
    await pool.query("DELETE FROM Permissions WHERE permission_id = ?", [permission_id]);

    await logChange({
      entity_type: "permission",
      entity_id: permission_id,
      action: "delete",
      changed_by: getChangedBy(req),
      changes: { before: oldPermission, after: null },
    });

    res.status(200).json({ message: "Permission deleted successfully" });
  } catch (err) {
    console.error("deletePermission error:", err);
    res.status(500).json({ message: "Server error deleting permission" });
  }
};

// -------------------- ROLE ↔ PERMISSION --------------------

// GET permissions for a role
export const getPermissionsByRole = async (req, res) => {
  try {
    const { role_id } = req.params;
    if (!role_id) return res.status(400).json({ message: "Role ID is required" });

    const [rows] = await pool.query(`
      SELECT p.permission_id, p.permission_name, p.permission_description
      FROM Permissions p
      JOIN RolePermissions rp ON p.permission_id = rp.permission_id
      WHERE rp.role_id = ?
    `, [role_id]);

    res.status(200).json({ permissions: rows });
  } catch (err) {
    console.error("getPermissionsByRole error:", err);
    res.status(500).json({ message: "Server error fetching permissions for role" });
  }
};

// ADD a permission to a role
export const addPermissionToRole = async (req, res) => {
  try {
    const { role_id } = req.params;
    const { permission_id } = req.body;
    if (!role_id || !permission_id) return res.status(400).json({ message: "Role ID and Permission ID required" });

    await pool.query("INSERT INTO RolePermissions (role_id, permission_id) VALUES (?, ?)", [role_id, permission_id]);

    const newAssignment = { role_id, permission_id };
    await logChange({
      entity_type: "role_permission",
      entity_id: `${role_id}-${permission_id}`,
      action: "create",
      changed_by: getChangedBy(req),
      changes: { before: null, after: newAssignment },
    });

    res.status(201).json({ message: "Permission added to role successfully" });
  } catch (err) {
    console.error("addPermissionToRole error:", err);
    if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Permission already assigned" });
    res.status(500).json({ message: "Server error adding permission to role" });
  }
};

// REMOVE a permission from a role
export const removePermissionFromRole = async (req, res) => {
  try {
    const { role_id, permission_id } = req.params;
    if (!role_id || !permission_id) return res.status(400).json({ message: "Role ID and Permission ID required" });

    const [result] = await pool.query(
      "DELETE FROM RolePermissions WHERE role_id = ? AND permission_id = ?",
      [role_id, permission_id]
    );

    if (!result.affectedRows) return res.status(404).json({ message: "Permission not found for this role" });

    const deletedAssignment = { role_id, permission_id };
    await logChange({
      entity_type: "role_permission",
      entity_id: `${role_id}-${permission_id}`,
      action: "delete",
      changed_by: getChangedBy(req),
      changes: { before: deletedAssignment, after: null },
    });

    res.status(200).json({ message: "Permission removed from role successfully" });
  } catch (err) {
    console.error("removePermissionFromRole error:", err);
    res.status(500).json({ message: "Server error removing permission from role" });
  }
};

// -------------------- DASHBOARD OVERVIEW FOR ROLES --------------------
export const getRolesDashboard = async (req, res) => {
  try {
    // Total roles
    const [[totalRoles]] = await pool.query(
      `SELECT COUNT(*) AS count FROM Roles`
    );

    // Total permissions
    const [[totalPermissions]] = await pool.query(
      `SELECT COUNT(*) AS count FROM Permissions`
    );

    // Roles with permission counts
    const [rolesWithPermissionCounts] = await pool.query(`
      SELECT r.role_id, r.role_name, COUNT(rp.permission_id) AS permission_count
      FROM Roles r
      LEFT JOIN RolePermissions rp ON r.role_id = rp.role_id
      GROUP BY r.role_id, r.role_name
    `);

    res.json({
      counts: {
        totalRoles: totalRoles.count || 0,
        totalPermissions: totalPermissions.count || 0,
      },
      rolesWithPermissionCounts,
    });
  } catch (err) {
    console.error("getRolesDashboard error:", err);
    res.status(500).json({ message: "Server error fetching roles dashboard" });
  }
};