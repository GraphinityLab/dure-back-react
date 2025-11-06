import { pool } from '../utils/db.js';

/**
 * Get all change logs
 */
export async function getLogs(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM ChangeLogs ORDER BY created_at DESC`
    );

    const logs = rows.map((log) => ({
      ...log,
      changes: log.changes ? JSON.parse(log.changes) : {},
    }));

    res.json({ logs });
  } catch (err) {
    console.error("getLogs error:", err);
    res.status(500).json({ message: "Server error fetching logs" });
  }
}

/**
 * Optionally: Get single log by ID
 */
export async function getLogByID(req, res) {
  try {
    const { log_id } = req.params;
    const [rows] = await pool.query(
      `SELECT * FROM ChangeLogs WHERE log_id = ?`,
      [log_id]
    );

    if (rows.length === 0) return res.status(404).json({ message: "Log not found" });

    const log = {
      ...rows[0],
      changes: rows[0].changes ? JSON.parse(rows[0].changes) : {},
    };

    res.json({ log });
  } catch (err) {
    console.error("getLogByID error:", err);
    res.status(500).json({ message: "Server error fetching log" });
  }
}
