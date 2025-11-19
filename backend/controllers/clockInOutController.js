/* eslint-disable no-undef */
import { pool } from '../utils/db.js';
import { logChange } from '../utils/logChange.js';

// -------------------- Helper: Get current user --------------------
const getChangedBy = (req) => {
  const user = req.session?.user;
  if (!user) return "Unknown";
  return `${user.first_name || "Unknown"} ${user.last_name || ""}`.trim();
};

// -------------------- CLOCK IN --------------------
export const clockIn = async (req, res) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json({ message: "No active session" });
    }

    const staffId = req.session.user.id;
    const now = new Date();

    // Check if already clocked in
    const [activeSession] = await pool.query(
      `SELECT * FROM clock_in_out 
       WHERE staff_id = ? AND clock_out_time IS NULL 
       ORDER BY clock_in_time DESC LIMIT 1`,
      [staffId]
    );

    if (activeSession.length > 0) {
      return res.status(400).json({ 
        message: "You are already clocked in. Please clock out first.",
        currentSession: activeSession[0]
      });
    }

    // Clock in
    const [result] = await pool.query(
      `INSERT INTO clock_in_out (staff_id, clock_in_time, notes) 
       VALUES (?, ?, ?)`,
      [staffId, now, req.body.notes || null]
    );

    // Update staff online status
    await pool.query(
      `UPDATE staff SET online = 1 WHERE staff_id = ?`,
      [staffId]
    );

    // Log the action
    await logChange({
      entity_type: "clock_in_out",
      entity_id: result.insertId,
      action: "clock_in",
      changed_by: getChangedBy(req),
      changes: {
        before: null,
        after: {
          staff_id: staffId,
          clock_in_time: now,
          notes: req.body.notes || null,
        },
      },
    });

    res.json({
      message: "Clocked in successfully",
      clockInId: result.insertId,
      clockInTime: now,
    });
  } catch (err) {
    console.error("clockIn error:", err);
    res.status(500).json({ message: "Server error clocking in" });
  }
};

// -------------------- CLOCK OUT --------------------
export const clockOut = async (req, res) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json({ message: "No active session" });
    }

    const staffId = req.session.user.id;
    const now = new Date();

    // Find active clock-in session
    const [activeSession] = await pool.query(
      `SELECT * FROM clock_in_out 
       WHERE staff_id = ? AND clock_out_time IS NULL 
       ORDER BY clock_in_time DESC LIMIT 1`,
      [staffId]
    );

    if (activeSession.length === 0) {
      return res.status(400).json({ 
        message: "No active clock-in session found. Please clock in first." 
      });
    }

    const sessionId = activeSession[0].clock_id;
    const clockInTime = new Date(activeSession[0].clock_in_time);
    const duration = Math.round((now - clockInTime) / 1000 / 60); // minutes

    // Clock out
    await pool.query(
      `UPDATE clock_in_out 
       SET clock_out_time = ?, notes = COALESCE(?, notes), duration_minutes = ? 
       WHERE clock_id = ?`,
      [now, req.body.notes || null, duration, sessionId]
    );

    // Update staff online status
    await pool.query(
      `UPDATE staff SET online = 0 WHERE staff_id = ?`,
      [staffId]
    );

    // Log the action
    await logChange({
      entity_type: "clock_in_out",
      entity_id: sessionId,
      action: "clock_out",
      changed_by: getChangedBy(req),
      changes: {
        before: {
          clock_out_time: null,
          duration_minutes: null,
        },
        after: {
          clock_out_time: now,
          duration_minutes: duration,
          notes: req.body.notes || activeSession[0].notes,
        },
      },
    });

    res.json({
      message: "Clocked out successfully",
      clockOutTime: now,
      durationMinutes: duration,
    });
  } catch (err) {
    console.error("clockOut error:", err);
    res.status(500).json({ message: "Server error clocking out" });
  }
};

// -------------------- GET CURRENT STATUS --------------------
export const getCurrentStatus = async (req, res) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json({ message: "No active session" });
    }

    const staffId = req.session.user.id;

    // Get current clock-in session
    const [activeSession] = await pool.query(
      `SELECT * FROM clock_in_out 
       WHERE staff_id = ? AND clock_out_time IS NULL 
       ORDER BY clock_in_time DESC LIMIT 1`,
      [staffId]
    );

    // Get staff online status
    const [[staff]] = await pool.query(
      `SELECT online FROM staff WHERE staff_id = ?`,
      [staffId]
    );

    if (activeSession.length > 0) {
      const clockInTime = new Date(activeSession[0].clock_in_time);
      const now = new Date();
      const duration = Math.round((now - clockInTime) / 1000 / 60); // minutes

      res.json({
        isClockedIn: true,
        clockInTime: activeSession[0].clock_in_time,
        durationMinutes: duration,
        sessionId: activeSession[0].clock_id,
        notes: activeSession[0].notes,
        online: staff?.online || 0,
      });
    } else {
      res.json({
        isClockedIn: false,
        online: staff?.online || 0,
      });
    }
  } catch (err) {
    console.error("getCurrentStatus error:", err);
    res.status(500).json({ message: "Server error fetching status" });
  }
};

// -------------------- GET CLOCK LOGS (Current User) --------------------
export const getMyClockLogs = async (req, res) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json({ message: "No active session" });
    }

    const staffId = req.session.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const [logs] = await pool.query(
      `SELECT 
        cio.clock_id,
        cio.clock_in_time,
        cio.clock_out_time,
        cio.duration_minutes,
        cio.notes,
        s.first_name,
        s.last_name,
        s.username
       FROM clock_in_out cio
       JOIN staff s ON cio.staff_id = s.staff_id
       WHERE cio.staff_id = ?
       ORDER BY cio.clock_in_time DESC
       LIMIT ? OFFSET ?`,
      [staffId, limit, offset]
    );

    // Get total count
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM clock_in_out WHERE staff_id = ?`,
      [staffId]
    );

    res.json({
      logs,
      total,
      limit,
      offset,
    });
  } catch (err) {
    console.error("getMyClockLogs error:", err);
    res.status(500).json({ message: "Server error fetching clock logs" });
  }
};

// -------------------- GET ALL CLOCK LOGS (Admin Only) --------------------
export const getAllClockLogs = async (req, res) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json({ message: "No active session" });
    }

    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    const staffId = req.query.staff_id || null;

    let query = `
      SELECT 
        cio.clock_id,
        cio.staff_id,
        cio.clock_in_time,
        cio.clock_out_time,
        cio.duration_minutes,
        cio.notes,
        s.first_name,
        s.last_name,
        s.username,
        s.email
      FROM clock_in_out cio
      JOIN staff s ON cio.staff_id = s.staff_id
      WHERE 1=1
    `;
    const params = [];

    if (staffId) {
      query += ` AND cio.staff_id = ?`;
      params.push(staffId);
    }

    query += ` ORDER BY cio.clock_in_time DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [logs] = await pool.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) AS total FROM clock_in_out WHERE 1=1`;
    const countParams = [];
    if (staffId) {
      countQuery += ` AND staff_id = ?`;
      countParams.push(staffId);
    }
    const [[{ total }]] = await pool.query(countQuery, countParams);

    res.json({
      logs,
      total,
      limit,
      offset,
    });
  } catch (err) {
    console.error("getAllClockLogs error:", err);
    res.status(500).json({ message: "Server error fetching clock logs" });
  }
};

// -------------------- GET CLOCK STATISTICS --------------------
export const getClockStatistics = async (req, res) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json({ message: "No active session" });
    }

    const staffId = req.session.user.id;
    const isAdmin = req.session.user.permissions?.includes('staff_read_all');

    let statsQuery = '';
    let params = [];

    if (isAdmin && !req.query.staff_id) {
      // Admin: all staff stats
      statsQuery = `
        SELECT 
          COUNT(DISTINCT staff_id) AS totalStaff,
          COUNT(*) AS totalSessions,
          SUM(duration_minutes) AS totalMinutes,
          AVG(duration_minutes) AS avgMinutes,
          COUNT(CASE WHEN clock_out_time IS NULL THEN 1 END) AS currentlyClockedIn
        FROM clock_in_out
        WHERE clock_out_time IS NOT NULL
      `;
    } else {
      // Individual staff stats
      const targetStaffId = req.query.staff_id || staffId;
      statsQuery = `
        SELECT 
          COUNT(*) AS totalSessions,
          SUM(duration_minutes) AS totalMinutes,
          AVG(duration_minutes) AS avgMinutes,
          MIN(clock_in_time) AS firstClockIn,
          MAX(clock_in_time) AS lastClockIn
        FROM clock_in_out
        WHERE staff_id = ? AND clock_out_time IS NOT NULL
      `;
      params = [targetStaffId];
    }

    const [[stats]] = await pool.query(statsQuery, params);

    // This week's stats
    const weekQuery = isAdmin && !req.query.staff_id
      ? `SELECT 
          COUNT(*) AS sessionsThisWeek,
          SUM(duration_minutes) AS minutesThisWeek
         FROM clock_in_out
         WHERE clock_in_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
         AND clock_out_time IS NOT NULL`
      : `SELECT 
          COUNT(*) AS sessionsThisWeek,
          SUM(duration_minutes) AS minutesThisWeek
         FROM clock_in_out
         WHERE staff_id = ? 
         AND clock_in_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
         AND clock_out_time IS NOT NULL`;

    const [[weekStats]] = await pool.query(weekQuery, params);

    res.json({
      ...stats,
      ...weekStats,
    });
  } catch (err) {
    console.error("getClockStatistics error:", err);
    res.status(500).json({ message: "Server error fetching statistics" });
  }
};

// -------------------- EXPORT WORK HOURS (CSV) --------------------
export const exportWorkHours = async (req, res) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json({ message: "No active session" });
    }

    const userId = req.session.user.id;
    const userPermissions = req.session.user.permissions || [];
    const isAdmin = userPermissions.includes('staff_read_all');
    
    const staffId = req.query.staff_id || null;
    const startDate = req.query.start_date || null;
    const endDate = req.query.end_date || null;

    // If not admin, only allow exporting own hours
    if (!isAdmin && staffId && parseInt(staffId) !== userId) {
      return res.status(403).json({ message: "You can only export your own work hours" });
    }

    // Build query
    let query = `
      SELECT 
        s.staff_id,
        s.first_name,
        s.last_name,
        s.username,
        s.email,
        cio.clock_id,
        cio.clock_in_time,
        cio.clock_out_time,
        cio.duration_minutes,
        cio.notes,
        DATE(cio.clock_in_time) AS date
      FROM clock_in_out cio
      JOIN staff s ON cio.staff_id = s.staff_id
      WHERE 1=1
    `;
    const params = [];

    // Filter by staff_id
    if (staffId) {
      query += ` AND cio.staff_id = ?`;
      params.push(staffId);
    } else if (!isAdmin) {
      // Non-admin can only see their own
      query += ` AND cio.staff_id = ?`;
      params.push(userId);
    }

    // Filter by date range
    if (startDate) {
      query += ` AND DATE(cio.clock_in_time) >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND DATE(cio.clock_in_time) <= ?`;
      params.push(endDate);
    }

    query += ` ORDER BY cio.clock_in_time DESC`;

    const [logs] = await pool.query(query, params);

    // Generate CSV
    const csvHeaders = [
      'Staff ID',
      'First Name',
      'Last Name',
      'Username',
      'Email',
      'Date',
      'Clock In Time',
      'Clock Out Time',
      'Duration (Minutes)',
      'Duration (Hours)',
      'Notes'
    ];

    const formatDateTime = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    };

    const formatDuration = (minutes) => {
      if (!minutes) return '0';
      const hrs = (minutes / 60).toFixed(2);
      return hrs;
    };

    const escapeCSV = (value) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    let csvContent = csvHeaders.join(',') + '\n';

    logs.forEach((log) => {
      const row = [
        log.staff_id,
        log.first_name,
        log.last_name,
        log.username,
        log.email,
        formatDate(log.clock_in_time),
        formatDateTime(log.clock_in_time),
        log.clock_out_time ? formatDateTime(log.clock_out_time) : 'In Progress',
        log.duration_minutes || '',
        log.duration_minutes ? formatDuration(log.duration_minutes) : '',
        log.notes || ''
      ];
      csvContent += row.map(escapeCSV).join(',') + '\n';
    });

    // Calculate totals
    const totalMinutes = logs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(2);
    const totalSessions = logs.length;

    csvContent += '\n';
    csvContent += `Total Sessions,${totalSessions}\n`;
    csvContent += `Total Minutes,${totalMinutes}\n`;
    csvContent += `Total Hours,${totalHours}\n`;

    // Set headers for CSV download
    const filename = staffId 
      ? `work-hours-${logs[0]?.username || 'staff'}-${new Date().toISOString().split('T')[0]}.csv`
      : `work-hours-all-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
  } catch (err) {
    console.error("exportWorkHours error:", err);
    res.status(500).json({ message: "Server error exporting work hours" });
  }
};

