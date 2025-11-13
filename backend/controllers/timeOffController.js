/* eslint-disable no-undef */
import { pool } from '../utils/db.js';
import { logChange } from '../utils/logChange.js';

// -------------------- Helper: Get current user --------------------
const getChangedBy = (req) => {
  const user = req.session?.user;
  if (!user) return "Unknown";
  return `${user.first_name || "Unknown"} ${user.last_name || ""}`.trim();
};

// -------------------- GET LEAVE TYPES --------------------
export const getLeaveTypes = async (req, res) => {
  try {
    const [types] = await pool.query(
      `SELECT * FROM leave_types ORDER BY type_name`
    );
    res.json({ leave_types: types });
  } catch (err) {
    console.error("getLeaveTypes error:", err);
    res.status(500).json({ message: "Server error fetching leave types" });
  }
};

// -------------------- CREATE LEAVE TYPE --------------------
export const createLeaveType = async (req, res) => {
  try {
    const { type_name, description, is_paid, max_days_per_year, requires_approval } = req.body;

    if (!type_name) {
      return res.status(400).json({ message: "Leave type name is required" });
    }

    const [result] = await pool.query(
      `INSERT INTO leave_types (type_name, description, is_paid, max_days_per_year, requires_approval)
       VALUES (?, ?, ?, ?, ?)`,
      [type_name, description || null, is_paid || 0, max_days_per_year || null, requires_approval !== undefined ? requires_approval : 1]
    );

    res.status(201).json({ message: "Leave type created", leave_type_id: result.insertId });
  } catch (err) {
    console.error("createLeaveType error:", err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: "Leave type already exists" });
    }
    res.status(500).json({ message: "Server error creating leave type" });
  }
};

// -------------------- GET TIME-OFF REQUESTS --------------------
export const getTimeOffRequests = async (req, res) => {
  try {
    const staff_id = req.query.staff_id || null;
    const status = req.query.status || null;
    const start_date = req.query.start_date || null;
    const end_date = req.query.end_date || null;

    let query = `
      SELECT tor.*, 
             s.first_name, s.last_name, s.username,
             lt.type_name, lt.is_paid,
             approver.first_name AS approver_first_name,
             approver.last_name AS approver_last_name
      FROM time_off_requests tor
      JOIN staff s ON tor.staff_id = s.staff_id
      JOIN leave_types lt ON tor.leave_type_id = lt.leave_type_id
      LEFT JOIN staff approver ON tor.approved_by = approver.staff_id
      WHERE 1=1
    `;
    const params = [];

    if (staff_id) {
      query += ` AND tor.staff_id = ?`;
      params.push(staff_id);
    }
    if (status) {
      query += ` AND tor.status = ?`;
      params.push(status);
    }
    if (start_date) {
      query += ` AND tor.end_date >= ?`;
      params.push(start_date);
    }
    if (end_date) {
      query += ` AND tor.start_date <= ?`;
      params.push(end_date);
    }

    query += ` ORDER BY tor.created_at DESC`;

    const [requests] = await pool.query(query, params);

    res.json({ requests });
  } catch (err) {
    console.error("getTimeOffRequests error:", err);
    res.status(500).json({ message: "Server error fetching time-off requests" });
  }
};

// -------------------- CREATE TIME-OFF REQUEST --------------------
export const createTimeOffRequest = async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "No active session" });
    }

    const { leave_type_id, start_date, end_date, reason, requested_for_staff_id } = req.body;

    if (!leave_type_id || !start_date || !end_date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const staffId = requested_for_staff_id || userId;

    // Calculate total days
    const start = new Date(start_date);
    const end = new Date(end_date);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check leave balance
    const currentYear = new Date().getFullYear();
    const [balance] = await pool.query(
      `SELECT * FROM leave_balances 
       WHERE staff_id = ? AND leave_type_id = ? AND year = ?`,
      [staffId, leave_type_id, currentYear]
    );

    if (balance.length > 0 && balance[0].remaining < diffDays) {
      return res.status(400).json({
        message: `Insufficient leave balance. Available: ${balance[0].remaining} days, Requested: ${diffDays} days`
      });
    }

    const [result] = await pool.query(
      `INSERT INTO time_off_requests 
       (staff_id, leave_type_id, start_date, end_date, total_days, reason, requested_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [staffId, leave_type_id, start_date, end_date, diffDays, reason || null, userId]
    );

    await logChange({
      entity_type: "time_off_request",
      entity_id: result.insertId,
      action: "create",
      changed_by: getChangedBy(req),
      changes: {
        before: null,
        after: { ...req.body, staff_id: staffId, total_days: diffDays }
      },
    });

    res.status(201).json({ message: "Time-off request created", request_id: result.insertId });
  } catch (err) {
    console.error("createTimeOffRequest error:", err);
    res.status(500).json({ message: "Server error creating time-off request" });
  }
};

// -------------------- APPROVE/REJECT TIME-OFF REQUEST --------------------
export const updateTimeOffRequestStatus = async (req, res) => {
  try {
    const { request_id } = req.params;
    const { status, rejection_reason } = req.body;

    if (!['approved', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "No active session" });
    }

    const [existing] = await pool.query(
      `SELECT * FROM time_off_requests WHERE request_id = ?`,
      [request_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Request not found" });
    }

    const request = existing[0];

    if (status === 'approved') {
      // Update leave balance
      const currentYear = new Date(request.start_date).getFullYear();
      await pool.query(
        `INSERT INTO leave_balances (staff_id, leave_type_id, year, total_allocated, used)
         VALUES (?, ?, ?, 0, ?)
         ON DUPLICATE KEY UPDATE used = used + ?`,
        [request.staff_id, request.leave_type_id, currentYear, request.total_days, request.total_days]
      );
    }

    await pool.query(
      `UPDATE time_off_requests 
       SET status = ?, approved_by = ?, approved_at = NOW(), rejection_reason = ?
       WHERE request_id = ?`,
      [status, userId, rejection_reason || null, request_id]
    );

    await logChange({
      entity_type: "time_off_request",
      entity_id: request_id,
      action: status === 'approved' ? 'approve' : status === 'rejected' ? 'reject' : 'cancel',
      changed_by: getChangedBy(req),
      changes: {
        before: request,
        after: { ...request, status, approved_by: userId, rejection_reason }
      },
    });

    res.json({ message: `Request ${status} successfully` });
  } catch (err) {
    console.error("updateTimeOffRequestStatus error:", err);
    res.status(500).json({ message: "Server error updating request status" });
  }
};

// -------------------- GET LEAVE BALANCES --------------------
export const getLeaveBalances = async (req, res) => {
  try {
    const { staff_id } = req.params;
    const year = req.query.year || new Date().getFullYear();

    const [balances] = await pool.query(
      `SELECT lb.*, lt.type_name, lt.is_paid, lt.max_days_per_year
       FROM leave_balances lb
       JOIN leave_types lt ON lb.leave_type_id = lt.leave_type_id
       WHERE lb.staff_id = ? AND lb.year = ?`,
      [staff_id, year]
    );

    res.json({ balances, year });
  } catch (err) {
    console.error("getLeaveBalances error:", err);
    res.status(500).json({ message: "Server error fetching leave balances" });
  }
};

// -------------------- UPDATE LEAVE BALANCE --------------------
export const updateLeaveBalance = async (req, res) => {
  try {
    const { staff_id } = req.params;
    const { leave_type_id, year, total_allocated } = req.body;

    if (!leave_type_id || !year || total_allocated === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    await pool.query(
      `INSERT INTO leave_balances (staff_id, leave_type_id, year, total_allocated, used)
       VALUES (?, ?, ?, ?, 0)
       ON DUPLICATE KEY UPDATE total_allocated = ?`,
      [staff_id, leave_type_id, year, total_allocated, total_allocated]
    );

    res.json({ message: "Leave balance updated successfully" });
  } catch (err) {
    console.error("updateLeaveBalance error:", err);
    res.status(500).json({ message: "Server error updating leave balance" });
  }
};

