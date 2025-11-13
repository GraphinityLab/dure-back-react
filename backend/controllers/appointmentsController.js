import { pool } from '../utils/db.js';
import { sendEmail } from '../utils/emailUtils.js';
import { logChange } from '../utils/logChange.js';
import {
  checkStaffAvailability,
  checkAppointmentConflicts,
  validateBusinessHours,
} from '../utils/appointmentValidation.js';

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
    const [rows] = await pool.query(
      `
      SELECT a.*, c.first_name AS client_first_name, c.last_name AS client_last_name, 
             s.name AS service_name, st.first_name AS staff_first_name, st.last_name AS staff_last_name
      FROM appointments a
      JOIN clients c ON a.client_id = c.client_id
      JOIN services s ON a.service_id = s.service_id
      LEFT JOIN staff st ON a.staff_id = st.staff_id
      WHERE a.appointment_id = ?
    `,
      [appointment_id]
    );

    if (!rows.length)
      return res.status(404).json({ message: "Appointment not found" });

    res.json({ appointment: rows[0] });
  } catch (err) {
    console.error("getAppointmentByID error:", err);
    res.status(500).json({ message: "Server error fetching appointment" });
  }
};

// -------------------- CREATE APPOINTMENT --------------------
export const createAppointment = async (req, res) => {
  try {
    const {
      client_id,
      service_id,
      appointment_date,
      start_time,
      end_time,
      notes,
      staff_id,
    } = req.body;

    if (
      !client_id ||
      !service_id ||
      !appointment_date ||
      !start_time ||
      !end_time
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const combineDateTime = (date, time) => `${date} ${time}:00`;
    const formattedStart = combineDateTime(appointment_date, start_time);
    const formattedEnd = combineDateTime(appointment_date, end_time);

    // Validate business hours
    if (!validateBusinessHours(appointment_date, start_time, end_time)) {
      return res.status(400).json({
        message: "Appointment time is outside business hours (09:00 - 17:00)"
      });
    }

    // Check for conflicts if staff is assigned
    if (staff_id) {
      const availability = await checkStaffAvailability(
        staff_id,
        appointment_date,
        start_time,
        end_time
      );

      if (!availability.available) {
        return res.status(409).json({
          message: availability.reason,
          conflicts: availability.conflicts,
          code: 'STAFF_UNAVAILABLE'
        });
      }
    }

    // Check for general conflicts (same client, same time)
    const conflicts = await checkAppointmentConflicts(
      appointment_date,
      start_time,
      end_time
    );

    if (conflicts.hasConflict) {
      // Allow if it's the same client (they might want multiple services)
      const sameClientConflict = conflicts.conflicts.find(
        c => c.client_id === client_id
      );
      if (!sameClientConflict) {
        return res.status(409).json({
          message: "Time slot conflicts with existing appointment(s)",
          conflicts: conflicts.conflicts,
          code: 'TIME_CONFLICT'
        });
      }
    }

    const [result] = await pool.query(
      `
      INSERT INTO appointments (client_id, service_id, appointment_date, start_time, end_time, notes, staff_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `,
      [
        client_id,
        service_id,
        appointment_date,
        formattedStart,
        formattedEnd,
        notes || "",
        staff_id || null,
      ]
    );

    const appointment_id = result.insertId;

    await logChange({
      entity_type: "appointment",
      entity_id: appointment_id,
      action: "create",
      changed_by: getChangedBy(req),
      changes: {
        before: null,
        after: {
          client_id,
          service_id,
          appointment_date,
          start_time: formattedStart,
          end_time: formattedEnd,
          notes,
          staff_id,
          status: "pending",
        },
      },
    });

    // Schedule appointment reminders (async, don't block response)
    try {
      const { scheduleAppointmentReminders } = await import('../controllers/notificationsController.js');
      scheduleAppointmentReminders(appointment_id, appointment_date, start_time).catch(err => {
        console.error("Error scheduling reminders:", err);
      });
    } catch (err) {
      console.error("Error importing reminder scheduler:", err);
    }

    res
      .status(201)
      .json({ message: "Appointment created successfully", appointment_id });
  } catch (err) {
    console.error("createAppointment error:", err);
    res.status(500).json({ message: "Server error creating appointment" });
  }
};

// -------------------- UPDATE APPOINTMENT --------------------
export const updateAppointment = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const { appointment_date, start_time, end_time, notes, staff_id, status } =
      req.body;

    // Get existing appointment
    const [existing] = await pool.query(
      "SELECT * FROM appointments WHERE appointment_id = ?",
      [appointment_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const existingAppt = existing[0];
    const updateDate = appointment_date || existingAppt.appointment_date;
    const updateStartTime = start_time || existingAppt.start_time?.slice(0, 5);
    const updateEndTime = end_time || existingAppt.end_time?.slice(0, 5);
    const updateStaffId = staff_id !== undefined ? staff_id : existingAppt.staff_id;

    // Validate business hours if time is being changed
    if (start_time || end_time) {
      if (!validateBusinessHours(updateDate, updateStartTime, updateEndTime)) {
        return res.status(400).json({
          message: "Appointment time is outside business hours (09:00 - 17:00)"
        });
      }
    }

    // Check for conflicts if staff or time is being changed
    if ((staff_id !== undefined || start_time || end_time || appointment_date) && updateStaffId) {
      const availability = await checkStaffAvailability(
        updateStaffId,
        updateDate,
        updateStartTime,
        updateEndTime,
        appointment_id // Exclude current appointment
      );

      if (!availability.available) {
        return res.status(409).json({
          message: availability.reason,
          conflicts: availability.conflicts,
          code: 'STAFF_UNAVAILABLE'
        });
      }
    }

    // Check for general conflicts
    if (start_time || end_time || appointment_date) {
      const conflicts = await checkAppointmentConflicts(
        updateDate,
        updateStartTime,
        updateEndTime,
        appointment_id
      );

      if (conflicts.hasConflict) {
        const sameClientConflict = conflicts.conflicts.find(
          c => c.client_id === existingAppt.client_id
        );
        if (!sameClientConflict) {
          return res.status(409).json({
            message: "Time slot conflicts with existing appointment(s)",
            conflicts: conflicts.conflicts,
            code: 'TIME_CONFLICT'
          });
        }
      }
    }

    const oldData = existingAppt;

    const combineDateTime = (date, time) => {
      if (!date || !time) return null;
      if (time.includes("T") || time.includes(" ")) return time;
      return `${date} ${time}:00`;
    };

    const formattedStart = start_time
      ? combineDateTime(
          appointment_date || oldData.appointment_date,
          start_time
        )
      : null;
    const formattedEnd = end_time
      ? combineDateTime(appointment_date || oldData.appointment_date, end_time)
      : null;

    const updates = [];
    const values = [];

    if (formattedStart) {
      updates.push("start_time = ?");
      values.push(formattedStart);
    }
    if (formattedEnd) {
      updates.push("end_time = ?");
      values.push(formattedEnd);
    }
    if (notes !== undefined) {
      updates.push("notes = ?");
      values.push(notes);
    }
    if (staff_id !== undefined) {
      updates.push("staff_id = ?");
      values.push(staff_id);
    }

    if (!updates.length)
      return res.status(400).json({ message: "Nothing to update" });

    values.push(appointment_id);
    await pool.query(
      `UPDATE appointments SET ${updates.join(", ")} WHERE appointment_id = ?`,
      values
    );

    const [updated] = await pool.query(
      "SELECT * FROM appointments WHERE appointment_id = ?",
      [appointment_id]
    );

    await logChange({
      entity_type: "appointment",
      entity_id: appointment_id,
      action: "update",
      changed_by: getChangedBy(req),
      changes: { before: oldData, after: updated[0] },
    });

    res.json({
      message: "Appointment updated successfully",
      appointment: updated[0],
    });
  } catch (err) {
    console.error("updateAppointment error:", err);
    res.status(500).json({ message: "Server error updating appointment" });
  }
};

// -------------------- DELETE APPOINTMENT --------------------
export const deleteAppointment = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const [existing] = await pool.query(
      "SELECT * FROM appointments WHERE appointment_id = ?",
      [appointment_id]
    );
    if (!existing.length)
      return res.status(404).json({ message: "Appointment not found" });

    await pool.query("DELETE FROM appointments WHERE appointment_id = ?", [
      appointment_id,
    ]);

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

    const [existing] = await pool.query(
      `
      SELECT a.*, c.first_name AS client_first_name, c.email AS client_email, s.name AS service_name
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.client_id
      LEFT JOIN services s ON a.service_id = s.service_id
      WHERE a.appointment_id = ?`,
      [appointment_id]
    );

    if (!existing.length)
      return res.status(404).json({ message: "Appointment not found" });

    const oldData = existing[0];

    await pool.query(
      `UPDATE appointments SET status = 'confirmed' WHERE appointment_id = ?`,
      [appointment_id]
    );

    await logChange({
      entity_type: "appointment",
      entity_id: appointment_id,
      action: "confirm",
      changed_by: getChangedBy(req),
      changes: { before: oldData, after: { ...oldData, status: "confirmed" } },
    });

    // --- SEND EMAIL TO CLIENT ---
    await sendEmail({
      to: oldData.client_email,
      subject: "📅 Your Appointment is Confirmed",
      html: `
<html>
<head>
<style>
body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
.container { padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #fafafa; }
h2 { color: #444; margin-bottom: 10px; }
ul { list-style: none; padding: 0; margin: 0; }
li { margin: 6px 0; }
strong { color: #000; }
.footer { margin-top: 20px; font-size: 0.9em; color: #666; }
</style>
</head>
<body>
<div class="container">
<h2>Appointment Confirmed!</h2>
<p>Hello ${oldData.client_first_name},</p>
<p>Your appointment for <strong>${oldData.service_name}</strong> has been confirmed.</p>
<ul>
<li><strong>Date:</strong> ${oldData.appointment_date}</li>
<li><strong>Time:</strong> ${oldData.start_time} - ${oldData.end_time}</li>
</ul>
<p>We look forward to seeing you!</p>
<p class="footer">
Thank you,<br/>
<em>Your Salon Booking System</em>
</p>
</div>
</body>
</html>`,
    });

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

    if (!notes || !notes.trim())
      return res
        .status(400)
        .json({ message: "Reschedule reason must be provided in notes" });

    const [existing] = await pool.query(
      `
      SELECT a.*, c.first_name AS client_first_name, c.email AS client_email, s.name AS service_name
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.client_id
      LEFT JOIN services s ON a.service_id = s.service_id
      WHERE a.appointment_id = ?`,
      [appointment_id]
    );

    if (!existing.length)
      return res.status(404).json({ message: "Appointment not found" });

    const oldData = existing[0];

    await pool.query(
      `UPDATE appointments SET status = 'rescheduled', notes = ? WHERE appointment_id = ?`,
      [notes, appointment_id]
    );

    await logChange({
      entity_type: "appointment",
      entity_id: appointment_id,
      action: "reschedule",
      changed_by: getChangedBy(req),
      changes: {
        before: oldData,
        after: { ...oldData, status: "rescheduled", notes },
      },
    });

    // --- SEND EMAIL TO CLIENT ---
    await sendEmail({
      to: oldData.client_email,
      subject: "📅 Please Reschedule Your Appointment",
      html: `
<html>
<head>
<style>
body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
.container { padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #fafafa; }
h2 { color: #444; margin-bottom: 10px; }
ul { list-style: none; padding: 0; margin: 0; }
li { margin: 6px 0; }
strong { color: #000; }
.button {
  display: inline-block;
  padding: 10px 20px;
  margin-top: 15px;
  background-color: #1a73e8;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-weight: bold;
}
.footer { margin-top: 20px; font-size: 0.9em; color: #666; }
</style>
</head>
<body>
<div class="container">
<h2>Please Reschedule Your Appointment</h2>
<p>Hello ${oldData.client_first_name},</p>
<p>We apologize for the inconvenience. Your originally scheduled appointment for <strong>${oldData.service_name}</strong> cannot be honored at the requested time.</p>
<p>Please reschedule your appointment at your convenience by clicking the button below:</p>
<a href="https://your-salon-website.com/book" class="button">Reschedule Appointment</a>
<p class="footer">
Thank you for your understanding.<br/>
<em>Your Salon Booking System</em>
</p>
</div>
</body>
</html>`,
    });

    res.json({
      message: "Appointment marked for reschedule and client notified",
    });
  } catch (err) {
    console.error("rescheduleAppointment error:", err);
    res.status(500).json({ message: "Server error rescheduling appointment" });
  }
};

// -------------------- DASHBOARD OVERVIEW (Appointments only + Online Staff) --------------------
export const getDashboardOverviewAppointments = async (req, res) => {
  try {
    // Total appointments
    const [[totalAppointments]] = await pool.query(
      `SELECT COUNT(*) AS count FROM appointments`
    );

    // Pending appointments
    const [[pendingAppointments]] = await pool.query(
      `SELECT COUNT(*) AS count FROM appointments WHERE status = 'pending'`
    );

    // Today's appointments
    const [[todaysAppointments]] = await pool.query(
      `SELECT COUNT(*) AS count FROM appointments WHERE appointment_date = CURDATE()`
    );

    // Online staff count
    const [[onlineStaff]] = await pool.query(
      `SELECT COUNT(*) AS count FROM staff WHERE online = 1`
    );

    // Upcoming appointments (next 8) with service name
    const [upcomingAppointments] = await pool.query(
      `SELECT a.appointment_id,
              a.appointment_date,
              TIME_FORMAT(a.start_time, '%H:%i') AS start_time,
              a.status,
              c.first_name AS client_first_name,
              c.last_name AS client_last_name,
              st.first_name AS staff_first_name,
              st.last_name AS staff_last_name,
              s.name AS service_name
       FROM appointments a
       LEFT JOIN clients c ON a.client_id = c.client_id
       LEFT JOIN staff st ON a.staff_id = st.staff_id
       LEFT JOIN services s ON a.service_id = s.service_id
       WHERE a.appointment_date >= CURDATE()
       ORDER BY a.appointment_date ASC, a.start_time ASC
       LIMIT 8`
    );

    return res.json({
      counts: {
        totalAppointments: totalAppointments.count || 0,
        pendingAppointments: pendingAppointments.count || 0,
        todaysAppointments: todaysAppointments.count || 0,
        onlineStaff: onlineStaff.count || 0,
      },
      upcomingAppointments,
    });
  } catch (err) {
    console.error("getDashboardOverviewAppointments error:", err);
    res
      .status(500)
      .json({ message: "Failed to load appointments dashboard overview" });
  }
};
