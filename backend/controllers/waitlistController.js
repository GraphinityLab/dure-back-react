/* eslint-disable no-undef */
import { pool } from '../utils/db.js';
import { logChange } from '../utils/logChange.js';
import { checkStaffAvailability } from '../utils/appointmentValidation.js';

// -------------------- Helper: Get current user --------------------
const getChangedBy = (req) => {
  const user = req.session?.user;
  if (!user) return "Unknown";
  return `${user.first_name || "Unknown"} ${user.last_name || ""}`.trim();
};

// -------------------- GET WAITLIST --------------------
export const getWaitlist = async (req, res) => {
  try {
    const { service_id, staff_id, status, priority } = req.query;

    let query = `
      SELECT w.*, 
             c.first_name AS client_first_name, 
             c.last_name AS client_last_name,
             c.email AS client_email,
             c.phone_number AS client_phone,
             s.name AS service_name,
             st.first_name AS staff_first_name,
             st.last_name AS staff_last_name
      FROM waitlist w
      JOIN clients c ON w.client_id = c.client_id
      JOIN services s ON w.service_id = s.service_id
      LEFT JOIN staff st ON w.preferred_staff_id = st.staff_id
      WHERE 1=1
    `;
    const params = [];

    if (service_id) {
      query += ` AND w.service_id = ?`;
      params.push(service_id);
    }
    if (staff_id) {
      query += ` AND w.preferred_staff_id = ?`;
      params.push(staff_id);
    }
    if (status) {
      query += ` AND w.status = ?`;
      params.push(status);
    }
    if (priority !== undefined) {
      query += ` AND w.priority = ?`;
      params.push(priority);
    }

    query += ` ORDER BY w.priority DESC, w.created_at ASC`;

    const [waitlist] = await pool.query(query, params);

    res.json({ waitlist });
  } catch (err) {
    console.error("getWaitlist error:", err);
    res.status(500).json({ message: "Server error fetching waitlist" });
  }
};

// -------------------- ADD TO WAITLIST --------------------
export const addToWaitlist = async (req, res) => {
  try {
    const {
      client_id,
      service_id,
      preferred_staff_id,
      preferred_date,
      preferred_time,
      priority,
      notes,
    } = req.body;

    if (!client_id || !service_id) {
      return res.status(400).json({ message: "Client ID and Service ID are required" });
    }

    const [result] = await pool.query(
      `INSERT INTO waitlist 
       (client_id, service_id, preferred_staff_id, preferred_date, preferred_time, priority, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        client_id, service_id, preferred_staff_id || null,
        preferred_date || null, preferred_time || null,
        priority || 0, notes || null
      ]
    );

    await logChange({
      entity_type: "waitlist",
      entity_id: result.insertId,
      action: "create",
      changed_by: getChangedBy(req),
      changes: {
        before: null,
        after: req.body
      },
    });

    res.status(201).json({ message: "Added to waitlist", waitlist_id: result.insertId });
  } catch (err) {
    console.error("addToWaitlist error:", err);
    res.status(500).json({ message: "Server error adding to waitlist" });
  }
};

// -------------------- CONVERT WAITLIST TO APPOINTMENT --------------------
export const convertWaitlistToAppointment = async (req, res) => {
  try {
    const { waitlist_id } = req.params;
    const { appointment_date, start_time, end_time, staff_id } = req.body;

    if (!appointment_date || !start_time || !end_time) {
      return res.status(400).json({ message: "Appointment date and times are required" });
    }

    const [waitlistItem] = await pool.query(
      `SELECT * FROM waitlist WHERE waitlist_id = ? AND status = 'active'`,
      [waitlist_id]
    );

    if (waitlistItem.length === 0) {
      return res.status(404).json({ message: "Waitlist item not found or not active" });
    }

    const item = waitlistItem[0];
    const finalStaffId = staff_id || item.preferred_staff_id;

    // Check availability
    if (finalStaffId) {
      const availability = await checkStaffAvailability(
        finalStaffId,
        appointment_date,
        start_time,
        end_time
      );

      if (!availability.available) {
        return res.status(409).json({
          message: availability.reason,
          code: 'STAFF_UNAVAILABLE'
        });
      }
    }

    // Create appointment
    const [apptResult] = await pool.query(
      `INSERT INTO appointments 
       (client_id, service_id, appointment_date, start_time, end_time, staff_id, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, 'confirmed', ?)`,
      [
        item.client_id, item.service_id, appointment_date,
        `${appointment_date} ${start_time}:00`,
        `${appointment_date} ${end_time}:00`,
        finalStaffId, item.notes
      ]
    );

    // Update waitlist status
    await pool.query(
      `UPDATE waitlist 
       SET status = 'converted', 
           converted_to_appointment_id = ?, 
           notified_at = NOW()
       WHERE waitlist_id = ?`,
      [apptResult.insertId, waitlist_id]
    );

    await logChange({
      entity_type: "waitlist",
      entity_id: waitlist_id,
      action: "convert",
      changed_by: getChangedBy(req),
      changes: {
        before: item,
        after: { ...item, status: 'converted', converted_to_appointment_id: apptResult.insertId }
      },
    });

    res.json({
      message: "Waitlist item converted to appointment",
      appointment_id: apptResult.insertId,
      waitlist_id
    });
  } catch (err) {
    console.error("convertWaitlistToAppointment error:", err);
    res.status(500).json({ message: "Server error converting waitlist item" });
  }
};

// -------------------- NOTIFY WAITLIST (when slot becomes available) --------------------
export const notifyWaitlist = async (req, res) => {
  try {
    const { service_id, staff_id, date, start_time, end_time } = req.body;

    if (!service_id || !date) {
      return res.status(400).json({ message: "Service ID and date are required" });
    }

    // Find matching waitlist items
    let query = `
      SELECT * FROM waitlist 
      WHERE service_id = ? 
      AND status = 'active'
      AND (preferred_date IS NULL OR preferred_date = ?)
    `;
    const params = [service_id, date];

    if (staff_id) {
      query += ` AND (preferred_staff_id IS NULL OR preferred_staff_id = ?)`;
      params.push(staff_id);
    }

    query += ` ORDER BY priority DESC, created_at ASC LIMIT 10`;

    const [waitlistItems] = await pool.query(query, params);

    const notified = [];
    for (const item of waitlistItems) {
      await pool.query(
        `UPDATE waitlist SET status = 'notified', notified_at = NOW() WHERE waitlist_id = ?`,
        [item.waitlist_id]
      );
      notified.push(item.waitlist_id);
    }

    res.json({
      message: `Notified ${notified.length} waitlist entries`,
      notified_ids: notified
    });
  } catch (err) {
    console.error("notifyWaitlist error:", err);
    res.status(500).json({ message: "Server error notifying waitlist" });
  }
};

// -------------------- REMOVE FROM WAITLIST --------------------
export const removeFromWaitlist = async (req, res) => {
  try {
    const { waitlist_id } = req.params;

    const [existing] = await pool.query(
      `SELECT * FROM waitlist WHERE waitlist_id = ?`,
      [waitlist_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Waitlist item not found" });
    }

    await pool.query(
      `UPDATE waitlist SET status = 'cancelled' WHERE waitlist_id = ?`,
      [waitlist_id]
    );

    await logChange({
      entity_type: "waitlist",
      entity_id: waitlist_id,
      action: "cancel",
      changed_by: getChangedBy(req),
      changes: {
        before: existing[0],
        after: { ...existing[0], status: 'cancelled' }
      },
    });

    res.json({ message: "Removed from waitlist" });
  } catch (err) {
    console.error("removeFromWaitlist error:", err);
    res.status(500).json({ message: "Server error removing from waitlist" });
  }
};

