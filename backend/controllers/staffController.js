import bcrypt from 'bcryptjs';

import { pool } from '../utils/db.js';
import { logChange } from '../utils/logChange.js';

// -------------------- Helper: Get current user --------------------
const getChangedBy = (req) => {
  const user = req.session?.user;
  if (!user) return "Unknown";
  return `${user.first_name || "Unknown"} ${user.last_name || ""}`.trim();
};

// -------------------- CREATE STAFF --------------------
export const createStaff = async (req, res) => {
  try {
    const {
      first_name, last_name, username, email, password, role_id,
      phone_number, address, city, province, postal_code,
    } = req.body;

    if (!first_name || !last_name || !username || !email || !password || !role_id) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const [existing] = await pool.query(
      "SELECT staff_id FROM staff WHERE username = ? OR email = ?",
      [username, email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "Username or email already exists" });
    }

    const hashed_password = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO staff 
        (first_name, last_name, username, email, hashed_password, role_id,
         phone_number, address, city, province, postal_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name, last_name, username, email, hashed_password, role_id,
        phone_number || null, address || null, city || null, province || null, postal_code || null,
      ]
    );

    // Log full new staff object
    await logChange({
      entity_type: "staff",
      entity_id: result.insertId,
      action: "create",
      changed_by: getChangedBy(req),
      changes: {
        before: null,
        after: { ...req.body, password: "•••••••" },
      },
    });

    res.status(201).json({ message: "Staff created", staff_id: result.insertId });
  } catch (err) {
    console.error("createStaff error:", err);
    res.status(500).json({ message: "Server error creating staff" });
  }
};

// -------------------- UPDATE STAFF --------------------
export const updateStaff = async (req, res) => {
  try {
    const { staff_id } = req.params;
    const payload = { ...req.body };

    const [existingRows] = await pool.query("SELECT * FROM staff WHERE staff_id = ?", [staff_id]);
    if (existingRows.length === 0) return res.status(404).json({ message: "Staff not found" });

    const before = existingRows[0];
    const updates = [];
    const values = [];

    // List of fields allowed to be updated (actual DB columns)
    const allowedFields = [
      "first_name",
      "last_name",
      "username",
      "email",
      "role_id",
      "phone_number",
      "address",
      "city",
      "province",
      "postal_code",
    ];

    // Handle password separately
    if (payload.password) {
      const hashed_password = await bcrypt.hash(payload.password, 10);
      updates.push("hashed_password = ?");
      values.push(hashed_password);
      payload.password = "•••••••"; // mask for logging
    }

    // Only add allowed fields
    for (const key of allowedFields) {
      if (payload[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(payload[key]);
      }
    }

    if (updates.length === 0) return res.status(400).json({ message: "Nothing to update" });

    values.push(staff_id);
    await pool.query(`UPDATE staff SET ${updates.join(", ")} WHERE staff_id = ?`, values);

    const [afterRows] = await pool.query("SELECT * FROM staff WHERE staff_id = ?", [staff_id]);
    const after = afterRows[0];

    // Log full before/after
    await logChange({
      entity_type: "staff",
      entity_id: staff_id,
      action: "update",
      changed_by: getChangedBy(req),
      changes: {
        before: { ...before, hashed_password: "•••••••" },
        after: { ...after, hashed_password: payload.password || "•••••••" },
      },
    });

    res.json({ message: "Staff updated successfully" });
  } catch (err) {
    console.error("updateStaff error:", err);
    res.status(500).json({ message: "Server error updating staff" });
  }
};

// -------------------- DELETE STAFF --------------------
export const deleteStaff = async (req, res) => {
  try {
    const { staff_id } = req.params;

    const [existing] = await pool.query("SELECT * FROM staff WHERE staff_id = ?", [staff_id]);
    if (existing.length === 0) return res.status(404).json({ message: "Staff not found" });

    const before = existing[0];

    await pool.query("DELETE FROM staff WHERE staff_id = ?", [staff_id]);

    // Log deleted staff
    await logChange({
      entity_type: "staff",
      entity_id: staff_id,
      action: "delete",
      changed_by: getChangedBy(req),
      changes: {
        before: { ...before, hashed_password: "•••••••" },
        after: null,
      },
    });

    res.json({ message: "Staff deleted successfully" });
  } catch (err) {
    console.error("deleteStaff error:", err);
    res.status(500).json({ message: "Server error deleting staff" });
  }
};

// -------------------- GET ALL STAFF --------------------
export const getStaff = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT staff_id, first_name, last_name, username, email, role_id,
             phone_number, address, city, province, postal_code
      FROM staff
    `);
    res.json({ staff: rows });
  } catch (err) {
    console.error("getStaff error:", err);
    res.status(500).json({ message: "Server error fetching staff" });
  }
};

// -------------------- GET STAFF BY ID --------------------
export const getStaffByID = async (req, res) => {
  try {
    const { staff_id } = req.params;
    const [rows] = await pool.query(`
      SELECT staff_id, first_name, last_name, username, email, role_id,
             phone_number, address, city, province, postal_code
      FROM staff
      WHERE staff_id = ?
    `, [staff_id]);

    if (rows.length === 0) return res.status(404).json({ message: "Staff not found" });

    res.json({ staff: rows[0] });
  } catch (err) {
    console.error("getStaffByID error:", err);
    res.status(500).json({ message: "Server error fetching staff" });
  }
};
