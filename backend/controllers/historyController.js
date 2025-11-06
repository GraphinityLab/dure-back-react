import { pool } from '../utils/db.js';
import { logChange } from '../utils/logChange.js';

// -------------------- Helper: Get current user --------------------
const getChangedBy = (req) => {
  const user = req.session?.user;
  if (!user) return "System";
  return `${user.first_name || "Unknown"} ${user.last_name || ""}`.trim();
};

// -------------------- GET ALL HISTORY --------------------
export const getAppointmentHistory = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM appointmenthistory
      ORDER BY created_at DESC
    `);
    res.status(200).json({ history: rows });
  } catch (err) {
    console.error("getAppointmentHistory error:", err);
    res.status(500).json({ message: "Server error fetching appointment history" });
  }
};

// -------------------- GET SINGLE HISTORY RECORD --------------------
export const getHistoryByID = async (req, res) => {
  try {
    const { history_id } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM appointmenthistory WHERE history_id = ?",
      [history_id]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "History record not found" });

    res.status(200).json({ history: rows[0] });
  } catch (err) {
    console.error("getHistoryByID error:", err);
    res.status(500).json({ message: "Server error fetching history record" });
  }
};

// -------------------- CREATE HISTORY RECORD --------------------
export const createHistory = async (req, res) => {
  try {
    const {
      appointment_id,
      client_name,
      service_name,
      service_price,
      service_category,
      service_description,
      appointment_date,
      start_time,
      end_time,
      notes,
      status,
      staff_id,
    } = req.body;

    const changed_by = getChangedBy(req);

    if (!appointment_id || !client_name || !service_name || !appointment_date || !start_time || !end_time || !status) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const [result] = await pool.query(
      `
      INSERT INTO appointmenthistory 
        (appointment_id, client_name, service_name, service_price, service_category, service_description, appointment_date, start_time, end_time, notes, status, staff_id, changed_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        appointment_id,
        client_name,
        service_name,
        service_price || 0,
        service_category || null,
        service_description || null,
        appointment_date,
        start_time,
        end_time,
        notes || null,
        status,
        staff_id || null,
        changed_by,
      ]
    );

    const newRecord = {
      history_id: result.insertId,
      appointment_id,
      client_name,
      service_name,
      service_price: service_price || 0,
      service_category: service_category || null,
      service_description: service_description || null,
      appointment_date,
      start_time,
      end_time,
      notes: notes || null,
      status,
      staff_id: staff_id || null,
      changed_by,
    };

    // Log the creation
    await logChange({
      entity_type: "appointmenthistory",
      entity_id: result.insertId,
      action: "create",
      changed_by,
      changes: { before: null, after: newRecord },
    });

    res.status(201).json({ message: "History record created", history_id: result.insertId });
  } catch (err) {
    console.error("createHistory error:", err);
    res.status(500).json({ message: "Server error creating history record" });
  }
};

// -------------------- DELETE HISTORY RECORD --------------------
export const deleteHistory = async (req, res) => {
  try {
    const { history_id } = req.params;
    const changed_by = getChangedBy(req);

    const [existing] = await pool.query(
      "SELECT * FROM appointmenthistory WHERE history_id = ?",
      [history_id]
    );

    if (existing.length === 0)
      return res.status(404).json({ message: "History record not found" });

    await pool.query("DELETE FROM appointmenthistory WHERE history_id = ?", [history_id]);

    // Log the deletion
    await logChange({
      entity_type: "appointmenthistory",
      entity_id: history_id,
      action: "delete",
      changed_by,
      changes: { before: existing[0], after: null },
    });

    res.status(200).json({ message: "History record deleted successfully" });
  } catch (err) {
    console.error("deleteHistory error:", err);
    res.status(500).json({ message: "Server error deleting history record" });
  }
};
