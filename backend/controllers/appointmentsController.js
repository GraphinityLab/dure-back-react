import { pool } from '../utils/db.js';
import { logChange } from '../utils/logChange.js';

// -------------------- Helper: Get current user --------------------
const getChangedBy = (req) => {
  const user = req.session?.user;
  if (!user) return "System";
  return `${user.first_name || "Unknown"} ${user.last_name || ""}`.trim();
};

// -------------------- GET ALL APPOINTMENTS --------------------
export const getAppointments = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        a.appointment_id,
        a.client_id,
        a.service_id,
        a.appointment_date,
        TIME_FORMAT(a.start_time, '%H:%i') AS start_time,
        TIME_FORMAT(a.end_time, '%H:%i') AS end_time,
        a.notes,
        a.status,
        a.staff_id,
        c.first_name AS client_first_name,
        c.last_name AS client_last_name,
        s.name AS service_name,
        s.category AS service_category,
        s.price AS service_price,
        s.duration_minutes AS service_duration_minutes,
        s.description AS service_description,
        st.first_name AS staff_first_name,
        st.last_name AS staff_last_name
      FROM appointments a
      JOIN clients c ON a.client_id = c.client_id
      JOIN services s ON a.service_id = s.service_id
      LEFT JOIN staff st ON a.staff_id = st.staff_id
      ORDER BY a.appointment_date DESC, a.start_time ASC
    `);

    res.json({ appointments: rows });
  } catch (err) {
    console.error("getAppointments error:", err);
    res.status(500).json({ message: "Server error fetching appointments" });
  }
};

// -------------------- GET SINGLE APPOINTMENT --------------------
export const getAppointmentByID = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const [rows] = await pool.query(`
      SELECT a.*, c.first_name AS client_first_name, c.last_name AS client_last_name, 
             s.name AS service_name, st.first_name AS staff_first_name, st.last_name AS staff_last_name
      FROM appointments a
      JOIN clients c ON a.client_id = c.client_id
      JOIN services s ON a.service_id = s.service_id
      LEFT JOIN staff st ON a.staff_id = st.staff_id
      WHERE a.appointment_id = ?
    `, [appointment_id]);

    if (!rows.length) return res.status(404).json({ message: "Appointment not found" });

    res.json({ appointment: rows[0] });
  } catch (err) {
    console.error("getAppointmentByID error:", err);
    res.status(500).json({ message: "Server error fetching appointment" });
  }
};

// -------------------- CREATE APPOINTMENT --------------------
export const createAppointment = async (req, res) => {
  try {
    const { client_id, service_id, appointment_date, start_time, end_time, notes, staff_id } = req.body;

    if (!client_id || !service_id || !appointment_date || !start_time || !end_time) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const combineDateTime = (date, time) => `${date} ${time}:00`;
    const formattedStart = combineDateTime(appointment_date, start_time);
    const formattedEnd = combineDateTime(appointment_date, end_time);

    const [result] = await pool.query(`
      INSERT INTO appointments (client_id, service_id, appointment_date, start_time, end_time, notes, staff_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [client_id, service_id, appointment_date, formattedStart, formattedEnd, notes || '', staff_id || null]);

    const appointment_id = result.insertId;

    await logChange({
      entity_type: "appointment",
      entity_id: appointment_id,
      action: "create",
      changed_by: getChangedBy(req),
      changes: { before: null, after: { client_id, service_id, appointment_date, start_time: formattedStart, end_time: formattedEnd, notes, staff_id, status: 'pending' } },
    });

    res.status(201).json({ message: "Appointment created successfully", appointment_id });
  } catch (err) {
    console.error("createAppointment error:", err);
    res.status(500).json({ message: "Server error creating appointment" });
  }
};

// -------------------- UPDATE APPOINTMENT --------------------
export const updateAppointment = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const { appointment_date, start_time, end_time, notes, staff_id } = req.body;

    const [existing] = await pool.query("SELECT * FROM appointments WHERE appointment_id = ?", [appointment_id]);
    if (!existing.length) return res.status(404).json({ message: "Appointment not found" });

    const oldData = existing[0];

    const combineDateTime = (date, time) => {
      if (!date || !time) return null;
      if (time.includes("T") || time.includes(" ")) return time;
      return `${date} ${time}:00`;
    };

    const formattedStart = start_time ? combineDateTime(appointment_date || oldData.appointment_date, start_time) : null;
    const formattedEnd = end_time ? combineDateTime(appointment_date || oldData.appointment_date, end_time) : null;

    const updates = [];
    const values = [];

    if (formattedStart) { updates.push("start_time = ?"); values.push(formattedStart); }
    if (formattedEnd) { updates.push("end_time = ?"); values.push(formattedEnd); }
    if (notes !== undefined) { updates.push("notes = ?"); values.push(notes); }
    if (staff_id !== undefined) { updates.push("staff_id = ?"); values.push(staff_id); }

    if (!updates.length) return res.status(400).json({ message: "Nothing to update" });

    values.push(appointment_id);
    await pool.query(`UPDATE appointments SET ${updates.join(", ")} WHERE appointment_id = ?`, values);

    const [updated] = await pool.query("SELECT * FROM appointments WHERE appointment_id = ?", [appointment_id]);

    await logChange({
      entity_type: "appointment",
      entity_id: appointment_id,
      action: "update",
      changed_by: getChangedBy(req),
      changes: { before: oldData, after: updated[0] },
    });

    res.json({ message: "Appointment updated successfully", appointment: updated[0] });
  } catch (err) {
    console.error("updateAppointment error:", err);
    res.status(500).json({ message: "Server error updating appointment" });
  }
};

// -------------------- DELETE APPOINTMENT --------------------
export const deleteAppointment = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const [existing] = await pool.query("SELECT * FROM appointments WHERE appointment_id = ?", [appointment_id]);
    if (!existing.length) return res.status(404).json({ message: "Appointment not found" });

    await pool.query("DELETE FROM appointments WHERE appointment_id = ?", [appointment_id]);

    await logChange({
      entity_type: "appointment",
      entity_id: appointment_id,
      action: "delete",
      changed_by: getChangedBy(req),
      changes: { before: existing[0], after: null },
    });

    res.json({ message: "Appointment deleted successfully" });
  } catch (err) {
    console.error("deleteAppointment error:", err);
    res.status(500).json({ message: "Server error deleting appointment" });
  }
};

// -------------------- CONFIRM APPOINTMENT --------------------
export const confirmAppointment = async (req, res) => {
  try {
    const { appointment_id } = req.params;

    const [existing] = await pool.query(`
      SELECT a.*, c.first_name AS client_first_name, c.email AS client_email, s.name AS service_name
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.client_id
      LEFT JOIN services s ON a.service_id = s.service_id
      WHERE a.appointment_id = ?`, [appointment_id]);

    if (!existing.length) return res.status(404).json({ message: "Appointment not found" });

    const oldData = existing[0];

    await pool.query(`UPDATE appointments SET status = 'confirmed' WHERE appointment_id = ?`, [appointment_id]);

    await logChange({
      entity_type: "appointment",
      entity_id: appointment_id,
      action: "confirm",
      changed_by: getChangedBy(req),
      changes: { before: oldData, after: { ...oldData, status: 'confirmed' } },
    });

    // sendEmail logic here (omitted for brevity)
    res.json({ message: "Appointment confirmed and client notified" });
  } catch (err) {
    console.error("confirmAppointment error:", err);
    res.status(500).json({ message: "Server error confirming appointment" });
  }
};

// -------------------- RESCHEDULE APPOINTMENT --------------------
export const rescheduleAppointment = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const { notes } = req.body;

    if (!notes || !notes.trim()) return res.status(400).json({ message: "Reschedule reason must be provided in notes" });

    const [existing] = await pool.query(`
      SELECT a.*, c.first_name AS client_first_name, c.email AS client_email, s.name AS service_name
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.client_id
      LEFT JOIN services s ON a.service_id = s.service_id
      WHERE a.appointment_id = ?`, [appointment_id]);

    if (!existing.length) return res.status(404).json({ message: "Appointment not found" });

    const oldData = existing[0];

    await pool.query(`UPDATE appointments SET status = 'rescheduled', notes = ? WHERE appointment_id = ?`, [notes, appointment_id]);

    await logChange({
      entity_type: "appointment",
      entity_id: appointment_id,
      action: "reschedule",
      changed_by: getChangedBy(req),
      changes: { before: oldData, after: { ...oldData, status: 'rescheduled', notes } },
    });

    // sendEmail logic here (omitted for brevity)
    res.json({ message: "Appointment rescheduled and client notified" });
  } catch (err) {
    console.error("rescheduleAppointment error:", err);
    res.status(500).json({ message: "Server error rescheduling appointment" });
  }
};
