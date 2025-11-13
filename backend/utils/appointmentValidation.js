/* eslint-disable no-undef */
import { pool } from './db.js';

/**
 * Check if staff member is available at the given time
 * @param {number} staffId - Staff ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @param {number} excludeAppointmentId - Appointment ID to exclude from conflict check
 * @returns {Promise<{available: boolean, conflicts: Array, reason: string}>}
 */
export const checkStaffAvailability = async (staffId, date, startTime, endTime, excludeAppointmentId = null) => {
  try {
    if (!staffId) {
      return { available: true, conflicts: [], reason: 'No staff assigned' };
    }

    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.getDay(); // 0 = Sunday, 6 = Saturday

    // Check if staff has a schedule for this day
    const [schedules] = await pool.query(
      `SELECT * FROM staff_schedules 
       WHERE staff_id = ? AND day_of_week = ? AND is_available = 1`,
      [staffId, dayOfWeek]
    );

    if (schedules.length === 0) {
      return {
        available: false,
        conflicts: [],
        reason: 'Staff member does not have a schedule for this day'
      };
    }

    const schedule = schedules[0];
    const scheduleStart = schedule.start_time;
    const scheduleEnd = schedule.end_time;

    // Check if appointment time is within schedule
    if (startTime < scheduleStart || endTime > scheduleEnd) {
      return {
        available: false,
        conflicts: [],
        reason: `Appointment time is outside staff schedule (${scheduleStart} - ${scheduleEnd})`
      };
    }

    // Check for break time conflicts
    if (schedule.break_start_time && schedule.break_end_time) {
      if (
        (startTime >= schedule.break_start_time && startTime < schedule.break_end_time) ||
        (endTime > schedule.break_start_time && endTime <= schedule.break_end_time) ||
        (startTime <= schedule.break_start_time && endTime >= schedule.break_end_time)
      ) {
        return {
          available: false,
          conflicts: [],
          reason: `Appointment conflicts with staff break time (${schedule.break_start_time} - ${schedule.break_end_time})`
        };
      }
    }

    // Check for availability overrides
    const [overrides] = await pool.query(
      `SELECT * FROM staff_availability_overrides 
       WHERE staff_id = ? AND override_date = ?`,
      [staffId, date]
    );

    if (overrides.length > 0) {
      const override = overrides[0];
      if (!override.is_available) {
        return {
          available: false,
          conflicts: [],
          reason: override.reason || 'Staff member is unavailable on this date'
        };
      }
      // If override has specific times, check against them
      if (override.start_time && override.end_time) {
        if (startTime < override.start_time || endTime > override.end_time) {
          return {
            available: false,
            conflicts: [],
            reason: `Appointment time is outside override availability (${override.start_time} - ${override.end_time})`
          };
        }
      }
    }

    // Check for time-off requests
    const [timeOff] = await pool.query(
      `SELECT * FROM time_off_requests 
       WHERE staff_id = ? 
       AND status = 'approved' 
       AND start_date <= ? 
       AND end_date >= ?`,
      [staffId, date, date]
    );

    if (timeOff.length > 0) {
      return {
        available: false,
        conflicts: [],
        reason: 'Staff member has approved time-off on this date'
      };
    }

    // Check for existing appointment conflicts
    let conflictQuery = `
      SELECT a.*, c.first_name, c.last_name, s.name AS service_name
      FROM appointments a
      JOIN clients c ON a.client_id = c.client_id
      JOIN services s ON a.service_id = s.service_id
      WHERE a.staff_id = ?
      AND a.appointment_date = ?
      AND a.status NOT IN ('cancelled', 'declined', 'completed')
      AND (
        (TIME(a.start_time) < ? AND TIME(a.end_time) > ?) OR
        (TIME(a.start_time) < ? AND TIME(a.end_time) > ?) OR
        (TIME(a.start_time) >= ? AND TIME(a.end_time) <= ?)
      )
    `;
    const conflictParams = [staffId, date, endTime, startTime, startTime, endTime, startTime, endTime];

    if (excludeAppointmentId) {
      conflictQuery += ' AND a.appointment_id != ?';
      conflictParams.push(excludeAppointmentId);
    }

    const [conflicts] = await pool.query(conflictQuery, conflictParams);

    if (conflicts.length > 0) {
      return {
        available: false,
        conflicts: conflicts.map(c => ({
          appointment_id: c.appointment_id,
          client_name: `${c.first_name} ${c.last_name}`,
          service_name: c.service_name,
          start_time: c.start_time,
          end_time: c.end_time
        })),
        reason: `Staff member has ${conflicts.length} conflicting appointment(s)`
      };
    }

    return { available: true, conflicts: [], reason: null };
  } catch (err) {
    console.error('checkStaffAvailability error:', err);
    return {
      available: false,
      conflicts: [],
      reason: 'Error checking availability'
    };
  }
};

/**
 * Check for appointment conflicts (any overlapping appointments)
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @param {number} excludeAppointmentId - Appointment ID to exclude
 * @returns {Promise<{hasConflict: boolean, conflicts: Array}>}
 */
export const checkAppointmentConflicts = async (date, startTime, endTime, excludeAppointmentId = null) => {
  try {
    let query = `
      SELECT a.*, 
             c.first_name AS client_first_name, 
             c.last_name AS client_last_name,
             s.name AS service_name,
             st.first_name AS staff_first_name,
             st.last_name AS staff_last_name
      FROM appointments a
      JOIN clients c ON a.client_id = c.client_id
      JOIN services s ON a.service_id = s.service_id
      LEFT JOIN staff st ON a.staff_id = st.staff_id
      WHERE a.appointment_date = ?
      AND a.status NOT IN ('cancelled', 'declined', 'completed')
      AND (
        (TIME(a.start_time) < ? AND TIME(a.end_time) > ?) OR
        (TIME(a.start_time) < ? AND TIME(a.end_time) > ?) OR
        (TIME(a.start_time) >= ? AND TIME(a.end_time) <= ?)
      )
    `;
    const params = [date, endTime, startTime, startTime, endTime, startTime, endTime];

    if (excludeAppointmentId) {
      query += ' AND a.appointment_id != ?';
      params.push(excludeAppointmentId);
    }

    const [conflicts] = await pool.query(query, params);

    return {
      hasConflict: conflicts.length > 0,
      conflicts: conflicts.map(c => ({
        appointment_id: c.appointment_id,
        client_name: `${c.client_first_name} ${c.client_last_name}`,
        service_name: c.service_name,
        staff_name: c.staff_first_name && c.staff_last_name 
          ? `${c.staff_first_name} ${c.staff_last_name}` 
          : 'Unassigned',
        start_time: c.start_time,
        end_time: c.end_time,
        status: c.status
      }))
    };
  } catch (err) {
    console.error('checkAppointmentConflicts error:', err);
    return { hasConflict: false, conflicts: [] };
  }
};

/**
 * Validate business hours
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @param {object} businessHours - { start: "09:00", end: "17:00" }
 * @returns {boolean}
 */
export const validateBusinessHours = (date, startTime, endTime, businessHours = { start: "09:00", end: "17:00" }) => {
  if (startTime < businessHours.start || endTime > businessHours.end) {
    return false;
  }
  return true;
};

/**
 * Get available time slots for a staff member on a specific date
 * @param {number} staffId - Staff ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {number} durationMinutes - Duration in minutes
 * @param {number} bufferMinutes - Buffer time in minutes
 * @returns {Promise<Array>} Array of available time slots
 */
export const getAvailableTimeSlots = async (staffId, date, durationMinutes = 60, bufferMinutes = 15) => {
  try {
    if (!staffId) {
      return [];
    }

    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.getDay();

    // Get staff schedule
    const [schedules] = await pool.query(
      `SELECT * FROM staff_schedules 
       WHERE staff_id = ? AND day_of_week = ? AND is_available = 1`,
      [staffId, dayOfWeek]
    );

    if (schedules.length === 0) {
      return [];
    }

    const schedule = schedules[0];
    let availableStart = schedule.start_time;
    let availableEnd = schedule.end_time;

    // Check for overrides
    const [overrides] = await pool.query(
      `SELECT * FROM staff_availability_overrides 
       WHERE staff_id = ? AND override_date = ? AND is_available = 1`,
      [staffId, date]
    );

    if (overrides.length > 0) {
      const override = overrides[0];
      if (override.start_time && override.end_time) {
        availableStart = override.start_time;
        availableEnd = override.end_time;
      } else if (!override.is_available) {
        return [];
      }
    }

    // Get existing appointments
    const [appointments] = await pool.query(
      `SELECT start_time, end_time 
       FROM appointments 
       WHERE staff_id = ? 
       AND appointment_date = ? 
       AND status NOT IN ('cancelled', 'declined', 'completed')
       ORDER BY start_time`,
      [staffId, date]
    );

    // Calculate available slots
    const slots = [];
    const slotDuration = durationMinutes + bufferMinutes;
    let currentTime = new Date(`${date}T${availableStart}:00`);

    while (currentTime < new Date(`${date}T${availableEnd}:00`)) {
      const slotStart = currentTime.toTimeString().slice(0, 5);
      const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000).toTimeString().slice(0, 5);

      if (new Date(`${date}T${slotEnd}:00`) > new Date(`${date}T${availableEnd}:00`)) {
        break;
      }

      // Check if slot conflicts with existing appointments
      let hasConflict = false;
      for (const apt of appointments) {
        const aptStart = new Date(`${date}T${apt.start_time}:00`);
        const aptEnd = new Date(`${date}T${apt.end_time}:00`);
        const slotStartTime = new Date(`${date}T${slotStart}:00`);
        const slotEndTime = new Date(`${date}T${slotEnd}:00`);

        if (
          (slotStartTime < aptEnd && slotEndTime > aptStart)
        ) {
          hasConflict = true;
          break;
        }
      }

      // Check break time
      if (schedule.break_start_time && schedule.break_end_time) {
        const breakStart = new Date(`${date}T${schedule.break_start_time}:00`);
        const breakEnd = new Date(`${date}T${schedule.break_end_time}:00`);
        const slotStartTime = new Date(`${date}T${slotStart}:00`);
        const slotEndTime = new Date(`${date}T${slotEnd}:00`);

        if (slotStartTime < breakEnd && slotEndTime > breakStart) {
          hasConflict = true;
        }
      }

      if (!hasConflict) {
        slots.push({
          start: slotStart,
          end: slotEnd,
          available: true
        });
      }

      // Move to next slot (with buffer)
      currentTime = new Date(currentTime.getTime() + slotDuration * 60000);
    }

    return slots;
  } catch (err) {
    console.error('getAvailableTimeSlots error:', err);
    return [];
  }
};

