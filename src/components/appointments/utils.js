// utils.js

/**
 * Show a temporary message (success or error) and auto-hide after duration.
 * @param {Function} setMessage - React state setter
 * @param {string} text - Message text
 * @param {'success'|'error'} type - Message type
 * @param {number} duration - Duration in milliseconds (default 3000)
 */
export function setTimedMessage(
  setMessage,
  text,
  type = "success",
  duration = 3000
) {
  setMessage({ text, type });
  setTimeout(() => setMessage(null), duration);
}

/**
 * Format a date string (YYYY-MM-DD or ISO) to human-readable format.
 * @param {string} dateStr
 * @returns {string} e.g., "Oct 29, 2025"
 */
// utils.js
export function formatDate(dateStr) {
  if (!dateStr) return "-"; // handle null/undefined

  // Ensure we have a string
  const str = typeof dateStr === "string" ? dateStr : String(dateStr);

  // Parse date
  const date = new Date(str);

  // Invalid date check
  if (isNaN(date.getTime())) return "-";

  // Format options (e.g., "Tue, Nov 12, 2025")
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Calculate duration in minutes between two time strings (HH:MM).
 * @param {string} start - e.g., "09:30"
 * @param {string} end - e.g., "10:15"
 * @returns {number} duration in minutes
 */
export function calculateDuration(start, end) {
  if (!start || !end) return 0;
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  const startDate = new Date();
  startDate.setHours(startH, startM, 0, 0);
  const endDate = new Date();
  endDate.setHours(endH, endM, 0, 0);
  const diffMs = endDate - startDate;
  return Math.max(0, Math.floor(diffMs / 60000));
}
