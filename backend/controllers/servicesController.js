import { pool } from '../utils/db.js';
import { logChange } from '../utils/logChange.js';

// -------------------- Helper: Get current user --------------------
const getChangedBy = (req) => {
  const user = req.session?.user;
  if (!user) return "Unknown";
  return `${user.first_name || "Unknown"} ${user.last_name || ""}`.trim();
};

// -------------------- CREATE SERVICE --------------------
export const createService = async (req, res) => {
  try {
    const { name, duration_minutes, price, category, description } = req.body;

    if (!name || !duration_minutes || !price) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const [result] = await pool.query(
      `INSERT INTO services (name, duration_minutes, price, category, description)
       VALUES (?, ?, ?, ?, ?)`,
      [name, duration_minutes, price, category || null, description || null]
    );

    const newService = { name, duration_minutes, price, category, description };

    await logChange({
      entity_type: "service",
      entity_id: result.insertId,
      action: "create",
      changed_by: getChangedBy(req),
      changes: {
        before: null,
        after: newService,
      },
    });

    res
      .status(201)
      .json({ message: "Service created", service_id: result.insertId });
  } catch (err) {
    console.error("createService error:", err);
    res.status(500).json({ message: "Server error creating service" });
  }
};

// -------------------- UPDATE SERVICE --------------------
export const updateService = async (req, res) => {
  try {
    const { service_id } = req.params;
    const payload = { ...req.body };

    const [existingRows] = await pool.query(
      "SELECT * FROM services WHERE service_id = ?",
      [service_id]
    );
    if (existingRows.length === 0)
      return res.status(404).json({ message: "Service not found" });

    const oldData = existingRows[0];

    const allowedFields = [
      "name",
      "duration_minutes",
      "price",
      "category",
      "description",
    ];
    const updates = [];
    const values = [];

    for (const key of allowedFields) {
      if (payload[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(payload[key]);
      }
    }

    if (updates.length === 0)
      return res.status(400).json({ message: "Nothing to update" });

    values.push(service_id);
    await pool.query(
      `UPDATE services SET ${updates.join(", ")} WHERE service_id = ?`,
      values
    );

    const [afterRows] = await pool.query(
      "SELECT * FROM services WHERE service_id = ?",
      [service_id]
    );
    const newData = afterRows[0];

    await logChange({
      entity_type: "service",
      entity_id: service_id,
      action: "update",
      changed_by: getChangedBy(req),
      changes: {
        before: oldData,
        after: newData,
      },
    });

    res.json({ message: "Service updated successfully" });
  } catch (err) {
    console.error("updateService error:", err);
    res.status(500).json({ message: "Server error updating service" });
  }
};

// -------------------- DELETE SERVICE --------------------
export const deleteService = async (req, res) => {
  try {
    const { service_id } = req.params;

    const [existingRows] = await pool.query(
      "SELECT * FROM services WHERE service_id = ?",
      [service_id]
    );
    if (existingRows.length === 0)
      return res.status(404).json({ message: "Service not found" });

    const oldData = existingRows[0];

    await pool.query("DELETE FROM services WHERE service_id = ?", [service_id]);

    await logChange({
      entity_type: "service",
      entity_id: service_id,
      action: "delete",
      changed_by: getChangedBy(req),
      changes: {
        before: oldData,
        after: null,
      },
    });

    res.json({ message: "Service deleted successfully" });
  } catch (err) {
    console.error("deleteService error:", err);
    res.status(500).json({ message: "Server error deleting service" });
  }
};

// -------------------- GET ALL SERVICES --------------------
export const getServices = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT service_id, name, duration_minutes, price, category, description FROM services`
    );
    res.json({ services: rows });
  } catch (err) {
    console.error("getServices error:", err);
    res.status(500).json({ message: "Server error fetching services" });
  }
};

// -------------------- GET SERVICE BY ID --------------------
export const getServiceByID = async (req, res) => {
  try {
    const { service_id } = req.params;

    const [rows] = await pool.query(
      `SELECT service_id, name, duration_minutes, price, category, description
       FROM services WHERE service_id = ?`,
      [service_id]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Service not found" });

    res.json({ service: rows[0] });
  } catch (err) {
    console.error("getServiceByID error:", err);
    res.status(500).json({ message: "Server error fetching service" });
  }
};

// -------------------- DASHBOARD OVERVIEW FOR SERVICES --------------------
export const getServiceDashboard = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
    COUNT(*) AS total_services,
    ROUND(AVG(price), 2) AS avg_price,
    ROUND(AVG(duration_minutes), 0) AS avg_duration_minutes
FROM services;
    `);

    res.json({ services: rows });
  } catch (err) {
    console.error("getServiceDashboard error:", err);
    res
      .status(500)
      .json({ message: "Server error fetching service dashboard" });
  }
};
