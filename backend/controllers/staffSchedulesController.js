/* eslint-disable no-undef */
import { pool } from '../utils/db.js';
import { logChange } from '../utils/logChange.js';

// -------------------- Helper: Get current user --------------------
const getChangedBy = (req) => {
  const user = req.session?.user;
  if (!user) return "Unknown";
  return `${user.first_name || "Unknown"} ${user.last_name || ""}`.trim();
};

// -------------------- GET STAFF SCHEDULE --------------------
export const getStaffSchedule = async (req, res) => {
  try {
    const { staff_id } = req.params;

    const [schedules] = await pool.query(
      `SELECT * FROM staff_schedules 
       WHERE staff_id = ? 
       ORDER BY day_of_week ASC`,
      [staff_id]
    );

    res.json({ schedules });
  } catch (err) {
    console.error("getStaffSchedule error:", err);
    res.status(500).json({ message: "Server error fetching staff schedule" });
  }
};

// -------------------- GET ALL STAFF SCHEDULES --------------------
export const getAllStaffSchedules = async (req, res) => {
  try {
    const [schedules] = await pool.query(
      `SELECT ss.*, s.first_name, s.last_name, s.username
       FROM staff_schedules ss
       JOIN staff s ON ss.staff_id = s.staff_id
       ORDER BY s.first_name, ss.day_of_week ASC`
    );

    res.json({ schedules });
  } catch (err) {
    console.error("getAllStaffSchedules error:", err);
    res.status(500).json({ message: "Server error fetching schedules" });
  }
};

// -------------------- CREATE/UPDATE STAFF SCHEDULE --------------------
export const upsertStaffSchedule = async (req, res) => {
  try {
    const { staff_id } = req.params;
    const { day_of_week, start_time, end_time, is_available, break_start_time, break_end_time } = req.body;

    if (day_of_week === undefined || !start_time || !end_time) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if schedule exists
    const [existing] = await pool.query(
      `SELECT * FROM staff_schedules 
       WHERE staff_id = ? AND day_of_week = ?`,
      [staff_id, day_of_week]
    );

    if (existing.length > 0) {
      // Update existing
      await pool.query(
        `UPDATE staff_schedules 
         SET start_time = ?, end_time = ?, is_available = ?, 
             break_start_time = ?, break_end_time = ?
         WHERE staff_id = ? AND day_of_week = ?`,
        [start_time, end_time, is_available !== undefined ? is_available : 1, 
         break_start_time || null, break_end_time || null, staff_id, day_of_week]
      );

      await logChange({
        entity_type: "staff_schedule",
        entity_id: existing[0].schedule_id,
        action: "update",
        changed_by: getChangedBy(req),
        changes: {
          before: existing[0],
          after: { ...req.body, staff_id, day_of_week }
        },
      });

      res.json({ message: "Schedule updated successfully" });
    } else {
      // Create new
      const [result] = await pool.query(
        `INSERT INTO staff_schedules 
         (staff_id, day_of_week, start_time, end_time, is_available, break_start_time, break_end_time)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [staff_id, day_of_week, start_time, end_time, is_available !== undefined ? is_available : 1,
         break_start_time || null, break_end_time || null]
      );

      await logChange({
        entity_type: "staff_schedule",
        entity_id: result.insertId,
        action: "create",
        changed_by: getChangedBy(req),
        changes: {
          before: null,
          after: { ...req.body, staff_id, day_of_week }
        },
      });

      res.status(201).json({ message: "Schedule created successfully", schedule_id: result.insertId });
    }
  } catch (err) {
    console.error("upsertStaffSchedule error:", err);
    res.status(500).json({ message: "Server error saving schedule" });
  }
};

// -------------------- DELETE STAFF SCHEDULE --------------------
export const deleteStaffSchedule = async (req, res) => {
  try {
    const { staff_id, day_of_week } = req.params;

    const [existing] = await pool.query(
      `SELECT * FROM staff_schedules 
       WHERE staff_id = ? AND day_of_week = ?`,
      [staff_id, day_of_week]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    await pool.query(
      `DELETE FROM staff_schedules 
       WHERE staff_id = ? AND day_of_week = ?`,
      [staff_id, day_of_week]
    );

    await logChange({
      entity_type: "staff_schedule",
      entity_id: existing[0].schedule_id,
      action: "delete",
      changed_by: getChangedBy(req),
      changes: {
        before: existing[0],
        after: null
      },
    });

    res.json({ message: "Schedule deleted successfully" });
  } catch (err) {
    console.error("deleteStaffSchedule error:", err);
    res.status(500).json({ message: "Server error deleting schedule" });
  }
};

// -------------------- GET AVAILABILITY OVERRIDES --------------------
export const getAvailabilityOverrides = async (req, res) => {
  try {
    const { staff_id } = req.params;
    const start_date = req.query.start_date || null;
    const end_date = req.query.end_date || null;

    let query = `SELECT * FROM staff_availability_overrides WHERE staff_id = ?`;
    const params = [staff_id];

    if (start_date && end_date) {
      query += ` AND override_date BETWEEN ? AND ?`;
      params.push(start_date, end_date);
    } else if (start_date) {
      query += ` AND override_date >= ?`;
      params.push(start_date);
    }

    query += ` ORDER BY override_date DESC`;

    const [overrides] = await pool.query(query, params);

    res.json({ overrides });
  } catch (err) {
    console.error("getAvailabilityOverrides error:", err);
    res.status(500).json({ message: "Server error fetching overrides" });
  }
};

// -------------------- CREATE AVAILABILITY OVERRIDE --------------------
export const createAvailabilityOverride = async (req, res) => {
  try {
    const { staff_id } = req.params;
    const { override_date, start_time, end_time, is_available, reason } = req.body;

    if (!override_date) {
      return res.status(400).json({ message: "Override date is required" });
    }

    // Check if override exists
    const [existing] = await pool.query(
      `SELECT * FROM staff_availability_overrides 
       WHERE staff_id = ? AND override_date = ?`,
      [staff_id, override_date]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Override already exists for this date" });
    }

    const [result] = await pool.query(
      `INSERT INTO staff_availability_overrides 
       (staff_id, override_date, start_time, end_time, is_available, reason)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [staff_id, override_date, start_time || null, end_time || null, 
       is_available !== undefined ? is_available : 1, reason || null]
    );

    await logChange({
      entity_type: "availability_override",
      entity_id: result.insertId,
      action: "create",
      changed_by: getChangedBy(req),
      changes: {
        before: null,
        after: { ...req.body, staff_id }
      },
    });

    res.status(201).json({ message: "Override created successfully", override_id: result.insertId });
  } catch (err) {
    console.error("createAvailabilityOverride error:", err);
    res.status(500).json({ message: "Server error creating override" });
  }
};

// -------------------- DELETE AVAILABILITY OVERRIDE --------------------
export const deleteAvailabilityOverride = async (req, res) => {
  try {
    const { override_id } = req.params;

    const [existing] = await pool.query(
      `SELECT * FROM staff_availability_overrides WHERE override_id = ?`,
      [override_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Override not found" });
    }

    await pool.query(
      `DELETE FROM staff_availability_overrides WHERE override_id = ?`,
      [override_id]
    );

    await logChange({
      entity_type: "availability_override",
      entity_id: override_id,
      action: "delete",
      changed_by: getChangedBy(req),
      changes: {
        before: existing[0],
        after: null
      },
    });

    res.json({ message: "Override deleted successfully" });
  } catch (err) {
    console.error("deleteAvailabilityOverride error:", err);
    res.status(500).json({ message: "Server error deleting override" });
  }
};

// -------------------- GET AVAILABLE TIME SLOTS --------------------
export const getAvailableTimeSlots = async (req, res) => {
  try {
    const { staff_id } = req.params;
    const { date, duration_minutes = 60, buffer_minutes = 15 } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const { getAvailableTimeSlots: getSlots } = await import('../utils/appointmentValidation.js');
    const slots = await getSlots(staff_id, date, parseInt(duration_minutes), parseInt(buffer_minutes));

    res.json({ slots, date, staff_id });
  } catch (err) {
    console.error("getAvailableTimeSlots error:", err);
    res.status(500).json({ message: "Server error fetching time slots" });
  }
};

