/* eslint-disable no-undef */
import { pool } from '../utils/db.js';

// -------------------- GET NOTIFICATIONS --------------------
export const getNotifications = async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "No active session" });
    }

    const { is_read, limit = 50 } = req.query;

    let query = `
      SELECT * FROM notifications 
      WHERE recipient_id = ?
    `;
    const params = [userId];

    if (is_read !== undefined) {
      query += ` AND is_read = ?`;
      params.push(is_read === 'true' ? 1 : 0);
    }

    query += ` ORDER BY sent_at DESC LIMIT ?`;
    params.push(parseInt(limit));

    const [notifications] = await pool.query(query, params);

    // Get unread count
    const [[{ unread_count }]] = await pool.query(
      `SELECT COUNT(*) AS unread_count FROM notifications 
       WHERE recipient_id = ? AND is_read = 0`,
      [userId]
    );

    res.json({
      notifications,
      unread_count: unread_count || 0
    });
  } catch (err) {
    console.error("getNotifications error:", err);
    res.status(500).json({ message: "Server error fetching notifications" });
  }
};

// -------------------- MARK NOTIFICATION AS READ --------------------
export const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "No active session" });
    }

    const { notification_id } = req.params;

    await pool.query(
      `UPDATE notifications 
       SET is_read = 1, read_at = NOW() 
       WHERE notification_id = ? AND recipient_id = ?`,
      [notification_id, userId]
    );

    res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("markNotificationAsRead error:", err);
    res.status(500).json({ message: "Server error updating notification" });
  }
};

// -------------------- MARK ALL AS READ --------------------
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "No active session" });
    }

    await pool.query(
      `UPDATE notifications 
       SET is_read = 1, read_at = NOW() 
       WHERE recipient_id = ? AND is_read = 0`,
      [userId]
    );

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("markAllAsRead error:", err);
    res.status(500).json({ message: "Server error updating notifications" });
  }
};

// -------------------- GET NOTIFICATION PREFERENCES --------------------
export const getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "No active session" });
    }

    const [preferences] = await pool.query(
      `SELECT * FROM notification_preferences 
       WHERE staff_id = ? OR staff_id IS NULL
       ORDER BY staff_id DESC, notification_type`,
      [userId]
    );

    res.json({ preferences });
  } catch (err) {
    console.error("getNotificationPreferences error:", err);
    res.status(500).json({ message: "Server error fetching preferences" });
  }
};

// -------------------- UPDATE NOTIFICATION PREFERENCES --------------------
export const updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "No active session" });
    }

    const { notification_type, email_enabled, sms_enabled, in_app_enabled, reminder_minutes_before } = req.body;

    if (!notification_type) {
      return res.status(400).json({ message: "Notification type is required" });
    }

    await pool.query(
      `INSERT INTO notification_preferences 
       (staff_id, notification_type, email_enabled, sms_enabled, in_app_enabled, reminder_minutes_before)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         email_enabled = VALUES(email_enabled),
         sms_enabled = VALUES(sms_enabled),
         in_app_enabled = VALUES(in_app_enabled),
         reminder_minutes_before = VALUES(reminder_minutes_before)`,
      [userId, notification_type, email_enabled !== undefined ? email_enabled : 1,
       sms_enabled !== undefined ? sms_enabled : 0, in_app_enabled !== undefined ? in_app_enabled : 1,
       reminder_minutes_before || null]
    );

    res.json({ message: "Preferences updated successfully" });
  } catch (err) {
    console.error("updateNotificationPreferences error:", err);
    res.status(500).json({ message: "Server error updating preferences" });
  }
};

// -------------------- CREATE NOTIFICATION (Internal helper) --------------------
export const createNotification = async (recipientId, type, title, message, relatedEntityType = null, relatedEntityId = null, sentVia = 'in_app') => {
  try {
    await pool.query(
      `INSERT INTO notifications 
       (recipient_id, notification_type, title, message, related_entity_type, related_entity_id, sent_via)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [recipientId, type, title, message, relatedEntityType, relatedEntityId, sentVia]
    );
  } catch (err) {
    console.error("createNotification error:", err);
  }
};

// -------------------- SCHEDULE APPOINTMENT REMINDERS --------------------
export const scheduleAppointmentReminders = async (appointmentId, appointmentDate, startTime) => {
  try {
    const appointmentDateTime = new Date(`${appointmentDate}T${startTime}:00`);
    
    // 24h reminder
    const reminder24h = new Date(appointmentDateTime);
    reminder24h.setHours(reminder24h.getHours() - 24);
    
    // 2h reminder
    const reminder2h = new Date(appointmentDateTime);
    reminder2h.setHours(reminder2h.getHours() - 2);

    // Only schedule if in the future
    if (reminder24h > new Date()) {
      await pool.query(
        `INSERT INTO appointment_reminders 
         (appointment_id, reminder_type, scheduled_for, status)
         VALUES (?, '24h', ?, 'pending')`,
        [appointmentId, reminder24h]
      );
    }

    if (reminder2h > new Date()) {
      await pool.query(
        `INSERT INTO appointment_reminders 
         (appointment_id, reminder_type, scheduled_for, status)
         VALUES (?, '2h', ?, 'pending')`,
        [appointmentId, reminder2h]
      );
    }
  } catch (err) {
    console.error("scheduleAppointmentReminders error:", err);
  }
};

