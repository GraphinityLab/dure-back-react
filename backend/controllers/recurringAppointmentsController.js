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

// -------------------- GET RECURRING APPOINTMENTS --------------------
export const getRecurringAppointments = async (req, res) => {
  try {
    const { staff_id, client_id, is_active } = req.query;

    let query = `
      SELECT ra.*, 
             c.first_name AS client_first_name, 
             c.last_name AS client_last_name,
             s.name AS service_name,
             st.first_name AS staff_first_name,
             st.last_name AS staff_last_name
      FROM recurring_appointments ra
      JOIN clients c ON ra.client_id = c.client_id
      JOIN services s ON ra.service_id = s.service_id
      LEFT JOIN staff st ON ra.staff_id = st.staff_id
      WHERE 1=1
    `;
    const params = [];

    if (staff_id) {
      query += ` AND ra.staff_id = ?`;
      params.push(staff_id);
    }
    if (client_id) {
      query += ` AND ra.client_id = ?`;
      params.push(client_id);
    }
    if (is_active !== undefined) {
      query += ` AND ra.is_active = ?`;
      params.push(is_active);
    }

    query += ` ORDER BY ra.created_at DESC`;

    const [recurring] = await pool.query(query, params);

    res.json({ recurring_appointments: recurring });
  } catch (err) {
    console.error("getRecurringAppointments error:", err);
    res.status(500).json({ message: "Server error fetching recurring appointments" });
  }
};

// -------------------- CREATE RECURRING APPOINTMENT --------------------
export const createRecurringAppointment = async (req, res) => {
  try {
    const {
      client_id,
      service_id,
      staff_id,
      recurrence_pattern,
      recurrence_day,
      start_date,
      end_date,
      max_occurrences,
      start_time,
      end_time,
      notes,
    } = req.body;

    if (!client_id || !service_id || !recurrence_pattern || !start_date || !start_time || !end_time) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate staff availability for first occurrence
    if (staff_id) {
      const availability = await checkStaffAvailability(
        staff_id,
        start_date,
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

    const [result] = await pool.query(
      `INSERT INTO recurring_appointments 
       (client_id, service_id, staff_id, recurrence_pattern, recurrence_day, 
        start_date, end_date, max_occurrences, start_time, end_time, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        client_id, service_id, staff_id || null, recurrence_pattern, recurrence_day || null,
        start_date, end_date || null, max_occurrences || null, start_time, end_time, notes || null
      ]
    );

    await logChange({
      entity_type: "recurring_appointment",
      entity_id: result.insertId,
      action: "create",
      changed_by: getChangedBy(req),
      changes: {
        before: null,
        after: req.body
      },
    });

    res.status(201).json({ message: "Recurring appointment created", recurring_id: result.insertId });
  } catch (err) {
    console.error("createRecurringAppointment error:", err);
    res.status(500).json({ message: "Server error creating recurring appointment" });
  }
};

// -------------------- GENERATE APPOINTMENTS FROM RECURRING --------------------
export const generateAppointmentsFromRecurring = async (req, res) => {
  try {
    const { recurring_id, start_date, end_date } = req.body;

    if (!recurring_id || !start_date || !end_date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const [recurring] = await pool.query(
      `SELECT * FROM recurring_appointments WHERE recurring_id = ? AND is_active = 1`,
      [recurring_id]
    );

    if (recurring.length === 0) {
      return res.status(404).json({ message: "Recurring appointment not found or inactive" });
    }

    const rec = recurring[0];
    const generated = [];
    const start = new Date(start_date);
    const end = new Date(end_date);
    let current = new Date(Math.max(start, new Date(rec.start_date)));

    while (current <= end) {
      if (rec.end_date && current > new Date(rec.end_date)) break;

      let shouldCreate = false;
      const dayOfWeek = current.getDay();

      switch (rec.recurrence_pattern) {
        case 'daily':
          shouldCreate = true;
          break;
        case 'weekly':
          shouldCreate = rec.recurrence_day === dayOfWeek;
          break;
        case 'biweekly':
          const weeksDiff = Math.floor((current - new Date(rec.start_date)) / (7 * 24 * 60 * 60 * 1000));
          shouldCreate = rec.recurrence_day === dayOfWeek && weeksDiff % 2 === 0;
          break;
        case 'monthly':
          shouldCreate = rec.recurrence_day === current.getDate();
          break;
      }

      if (shouldCreate) {
        // Check if appointment already exists
        const [existing] = await pool.query(
          `SELECT * FROM appointments 
           WHERE recurring_id = ? 
           AND appointment_date = ? 
           AND start_time = ?`,
          [recurring_id, current.toISOString().split('T')[0], rec.start_time]
        );

        if (existing.length === 0) {
          // Check staff availability
          if (rec.staff_id) {
            const availability = await checkStaffAvailability(
              rec.staff_id,
              current.toISOString().split('T')[0],
              rec.start_time,
              rec.end_time
            );

            if (availability.available) {
              const [apptResult] = await pool.query(
                `INSERT INTO appointments 
                 (client_id, service_id, appointment_date, start_time, end_time, 
                  notes, staff_id, status, recurring_id, is_recurring_instance)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, 1)`,
                [
                  rec.client_id, rec.service_id, current.toISOString().split('T')[0],
                  `${current.toISOString().split('T')[0]} ${rec.start_time}:00`,
                  `${current.toISOString().split('T')[0]} ${rec.end_time}:00`,
                  rec.notes, rec.staff_id, recurring_id
                ]
              );
              generated.push(apptResult.insertId);
            }
          } else {
            // No staff assigned, create anyway
            const [apptResult] = await pool.query(
              `INSERT INTO appointments 
               (client_id, service_id, appointment_date, start_time, end_time, 
                notes, staff_id, status, recurring_id, is_recurring_instance)
               VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, 1)`,
              [
                rec.client_id, rec.service_id, current.toISOString().split('T')[0],
                `${current.toISOString().split('T')[0]} ${rec.start_time}:00`,
                `${current.toISOString().split('T')[0]} ${rec.end_time}:00`,
                rec.notes, null, recurring_id
              ]
            );
            generated.push(apptResult.insertId);
          }
        }
      }

      current.setDate(current.getDate() + 1);
    }

    res.json({ message: `Generated ${generated.length} appointments`, appointment_ids: generated });
  } catch (err) {
    console.error("generateAppointmentsFromRecurring error:", err);
    res.status(500).json({ message: "Server error generating appointments" });
  }
};

// -------------------- UPDATE RECURRING APPOINTMENT --------------------
export const updateRecurringAppointment = async (req, res) => {
  try {
    const { recurring_id } = req.params;
    const updates = req.body;

    const [existing] = await pool.query(
      `SELECT * FROM recurring_appointments WHERE recurring_id = ?`,
      [recurring_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Recurring appointment not found" });
    }

    const allowedFields = [
      'service_id', 'staff_id', 'recurrence_pattern', 'recurrence_day',
      'end_date', 'max_occurrences', 'start_time', 'end_time', 'notes', 'is_active'
    ];

    const updateFields = [];
    const values = [];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        values.push(updates[field]);
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    values.push(recurring_id);
    await pool.query(
      `UPDATE recurring_appointments SET ${updateFields.join(', ')} WHERE recurring_id = ?`,
      values
    );

    await logChange({
      entity_type: "recurring_appointment",
      entity_id: recurring_id,
      action: "update",
      changed_by: getChangedBy(req),
      changes: {
        before: existing[0],
        after: { ...existing[0], ...updates }
      },
    });

    res.json({ message: "Recurring appointment updated successfully" });
  } catch (err) {
    console.error("updateRecurringAppointment error:", err);
    res.status(500).json({ message: "Server error updating recurring appointment" });
  }
};

// -------------------- DELETE RECURRING APPOINTMENT --------------------
export const deleteRecurringAppointment = async (req, res) => {
  try {
    const { recurring_id } = req.params;
    const { delete_future_instances } = req.query; // 'true' to delete future appointments

    const [existing] = await pool.query(
      `SELECT * FROM recurring_appointments WHERE recurring_id = ?`,
      [recurring_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Recurring appointment not found" });
    }

    // Delete or deactivate
    if (delete_future_instances === 'true') {
      // Delete future appointment instances
      await pool.query(
        `DELETE FROM appointments 
         WHERE recurring_id = ? 
         AND appointment_date >= CURDATE() 
         AND status IN ('pending', 'confirmed')`,
        [recurring_id]
      );
    }

    // Deactivate recurring appointment
    await pool.query(
      `UPDATE recurring_appointments SET is_active = 0 WHERE recurring_id = ?`,
      [recurring_id]
    );

    await logChange({
      entity_type: "recurring_appointment",
      entity_id: recurring_id,
      action: "delete",
      changed_by: getChangedBy(req),
      changes: {
        before: existing[0],
        after: null
      },
    });

    res.json({ message: "Recurring appointment deleted successfully" });
  } catch (err) {
    console.error("deleteRecurringAppointment error:", err);
    res.status(500).json({ message: "Server error deleting recurring appointment" });
  }
};

