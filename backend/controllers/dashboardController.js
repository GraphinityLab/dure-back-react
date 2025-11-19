/* eslint-disable no-undef */
import { pool } from '../utils/db.js';

// -------------------- GET GENERAL DASHBOARD OVERVIEW --------------------
export const getDashboardOverview = async (req, res) => {
  try {
    // Total Appointments
    const [[totalAppointments]] = await pool.query(
      `SELECT COUNT(*) AS count FROM appointments`
    );

    // Today's Appointments
    const [[todaysAppointments]] = await pool.query(
      `SELECT COUNT(*) AS count FROM appointments WHERE appointment_date = CURDATE()`
    );

    // Pending Appointments
    const [[pendingAppointments]] = await pool.query(
      `SELECT COUNT(*) AS count FROM appointments WHERE status = 'pending'`
    );

    // Total Clients
    const [[totalClients]] = await pool.query(
      `SELECT COUNT(*) AS count FROM clients`
    );

    // Total Staff
    const [[totalStaff]] = await pool.query(
      `SELECT COUNT(*) AS count FROM staff`
    );

    // Online Staff
    const [[onlineStaff]] = await pool.query(
      `SELECT COUNT(*) AS count FROM staff WHERE online = 1`
    );

    // Total Services
    const [[totalServices]] = await pool.query(
      `SELECT COUNT(*) AS count FROM services`
    );

    // Total History Records
    const [[totalHistory]] = await pool.query(
      `SELECT COUNT(*) AS count FROM appointmenthistory`
    );

    // Completed Appointments (this month)
    const [[completedThisMonth]] = await pool.query(
      `SELECT COUNT(*) AS count 
       FROM appointmenthistory 
       WHERE status = 'completed' 
       AND MONTH(created_at) = MONTH(CURDATE()) 
       AND YEAR(created_at) = YEAR(CURDATE())`
    );

    res.json({
      counts: {
        totalAppointments: totalAppointments.count || 0,
        todaysAppointments: todaysAppointments.count || 0,
        pendingAppointments: pendingAppointments.count || 0,
        totalClients: totalClients.count || 0,
        totalStaff: totalStaff.count || 0,
        onlineStaff: onlineStaff.count || 0,
        totalServices: totalServices.count || 0,
        totalHistory: totalHistory.count || 0,
        completedThisMonth: completedThisMonth.count || 0,
      },
    });
  } catch (err) {
    console.error('getDashboardOverview error:', err);
    res.status(500).json({ message: 'Server error fetching dashboard overview' });
  }
};

