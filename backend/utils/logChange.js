// src/utils/logChange.js
import { pool } from '../utils/db.js';

const SENSITIVE_KEYS = ["hashed_password", "password"];

function sanitize(obj) {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitize(item));
  }

  const clone = {};
  for (const key of Object.keys(obj)) {
    clone[key] = SENSITIVE_KEYS.includes(key) ? "***hidden***" : sanitize(obj[key]);
  }
  return clone;
}

/**
 * Log changes for auditing
 * @param {Object} params
 * @param {"staff"|"appointment"|"service"|"client"|"role"} params.entity_type
 * @param {number} params.entity_id
 * @param {"create"|"update"|"delete"} params.action
 * @param {string|null} params.changed_by
 * @param {Object} [params.changes]
 * @param {Object} [params.req] - optional Express request object to get session user
 */
export async function logChange({ entity_type, entity_id, action, changed_by, changes, req }) {
  try {
    const timestamp = new Date();

    if (!changed_by && req?.session?.user) {
      const user = req.session.user;
      changed_by = `${user.first_name || "Unknown"} ${user.last_name || ""}`.trim();
    }

    // Inspect what is being passed
    console.log("===== LOG CHANGE =====");
    console.log("Entity Type:", entity_type);
    console.log("Entity ID:", entity_id);
    console.log("Action:", action);
    console.log("Changed By:", changed_by);
    console.log("Raw Changes:", changes);

    const safeChanges =
      changes && typeof changes === "object"
        ? {
            old: sanitize(changes.before || changes.old),
            new: sanitize(changes.after || changes.new),
          }
        : changes;

    console.log("Sanitized Changes:", safeChanges);
    console.log("======================");

    await pool.execute(
      `INSERT INTO ChangeLogs (entity_type, entity_id, action, changed_by, changes, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [entity_type, entity_id, action, changed_by ?? "Unknown", JSON.stringify(safeChanges ?? {}), timestamp]
    );
  } catch (err) {
    console.error("Error logging change:", err);
  }
}

