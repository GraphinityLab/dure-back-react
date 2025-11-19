/* eslint-disable no-undef */
import bcrypt from 'bcryptjs';

import { pool } from '../utils/db.js';

// -------------------- LOGIN --------------------
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: "Email/Username and password are required" });
    }

    // 1️⃣ Find user by email OR username
    const [userRows] = await pool.query(
      `SELECT staff_id, username, email, hashed_password, first_name, last_name, role_id 
       FROM staff 
       WHERE email = ? OR username = ? 
       LIMIT 1`,
      [identifier, identifier]
    );

    const user = userRows[0];
    if (!user || !user.hashed_password) {
      return res
        .status(401)
        .json({ message: "Invalid email/username or password" });
    }

    // 2️⃣ Compare hashed password
    const isMatch = await bcrypt.compare(password, user.hashed_password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid email/username or password" });
    }

    // 3️⃣ Get permissions based on user's role
    const [permissionRows] = await pool.query(
      `SELECT p.permission_name 
       FROM permissions p
       JOIN rolepermissions rp ON p.permission_id = rp.permission_id
       WHERE rp.role_id = ?`,
      [user.role_id]
    );

    const permissions = permissionRows.map((p) => p.permission_name);

    // 4️⃣ Create session only here
    req.session.user = {
      id: user.staff_id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role_id: user.role_id,
      permissions,
    };

    // Save session before sending response
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ message: "Server error saving session" });
      }

      res.json({
        message: "Login successful",
        user: req.session.user,
      });
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
};

// -------------------- LOGOUT --------------------
export const logout = (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Error logging out" });
      }
      // Clear the cookie with your custom name
      res.clearCookie(process.env.SESSION_NAME || "sid");
      return res.json({ message: "Logout successful" });
    });
  } else {
    res.status(400).json({ message: "No active session" });
  }
};

// -------------------- CHECK SESSION --------------------
export const checkSession = (req, res) => {
  if (req.session && req.session.user) {
    return res.json({
      loggedIn: true,
      user: req.session.user,
    });
  }
  res.status(401).json({ loggedIn: false, message: "No active session" });
};

// -------------------- CHECK USERNAME OR EMAIL --------------------
export const checkUsernameOrEmail = async (req, res) => {
  try {
    const { username, email } = req.body;

    if (!username && !email) {
      return res.status(400).json({ message: "Username or email required" });
    }

    const [rows] = await pool.query(
      `SELECT staff_id, username, email, first_name, last_name 
       FROM staff 
       WHERE username = ? OR email = ? 
       LIMIT 1`,
      [username || '', email || '']
    );

    if (rows.length === 0) {
      return res.json({ exists: false }); // easier for frontend handling
    }

    res.json({ exists: true, user: rows[0] });
  } catch (err) {
    console.error("checkUsernameOrEmail error:", err);
    res.status(500).json({ message: "Server error while checking user" });
  }
};

// -------------------- GET CURRENT USER INFO --------------------
export const getCurrentUser = async (req, res) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json({ message: "No active session" });
    }

    const userId = req.session.user.id;
    const [rows] = await pool.query(
      `SELECT staff_id, first_name, last_name, username, email, role_id,
              phone_number, address, city, province, postal_code, online
       FROM staff
       WHERE staff_id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: rows[0] });
  } catch (err) {
    console.error("getCurrentUser error:", err);
    res.status(500).json({ message: "Server error fetching user info" });
  }
};

// -------------------- UPDATE CURRENT USER INFO --------------------
export const updateCurrentUser = async (req, res) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json({ message: "No active session" });
    }

    const userId = req.session.user.id;
    const payload = { ...req.body };

    // Get current user data
    const [existingRows] = await pool.query("SELECT * FROM staff WHERE staff_id = ?", [userId]);
    if (existingRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const before = existingRows[0];
    const updates = [];
    const values = [];

    // Fields users can update themselves (excluding role_id and staff_id)
    const allowedFields = [
      "first_name",
      "last_name",
      "username",
      "email",
      "phone_number",
      "address",
      "city",
      "province",
      "postal_code",
    ];

    // Check if username or email is being changed and if it's already taken
    if (payload.username && payload.username !== before.username) {
      const [existing] = await pool.query(
        "SELECT staff_id FROM staff WHERE username = ? AND staff_id != ?",
        [payload.username, userId]
      );
      if (existing.length > 0) {
        return res.status(409).json({ message: "Username already exists" });
      }
    }

    if (payload.email && payload.email !== before.email) {
      const [existing] = await pool.query(
        "SELECT staff_id FROM staff WHERE email = ? AND staff_id != ?",
        [payload.email, userId]
      );
      if (existing.length > 0) {
        return res.status(409).json({ message: "Email already exists" });
      }
    }

    // Handle password separately
    if (payload.password) {
      const hashed_password = await bcrypt.hash(payload.password, 10);
      updates.push("hashed_password = ?");
      values.push(hashed_password);
    }

    // Only add allowed fields
    for (const key of allowedFields) {
      if (payload[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(payload[key]);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    values.push(userId);
    await pool.query(`UPDATE staff SET ${updates.join(", ")} WHERE staff_id = ?`, values);

    // Get updated user data
    const [afterRows] = await pool.query("SELECT * FROM staff WHERE staff_id = ?", [userId]);
    const after = afterRows[0];

    // Update session with new user info
    req.session.user = {
      ...req.session.user,
      username: after.username,
      email: after.email,
      first_name: after.first_name,
      last_name: after.last_name,
    };
    req.session.save();

    // Log the change
    const { logChange } = await import('../utils/logChange.js');
    await logChange({
      entity_type: "staff",
      entity_id: userId,
      action: "update",
      changed_by: `${before.first_name || "Unknown"} ${before.last_name || ""}`.trim(),
      changes: {
        before: { ...before, hashed_password: "•••••••" },
        after: { ...after, hashed_password: payload.password ? "•••••••" : "•••••••" },
      },
    });

    res.json({
      message: "Profile updated successfully",
      user: {
        staff_id: after.staff_id,
        first_name: after.first_name,
        last_name: after.last_name,
        username: after.username,
        email: after.email,
        phone_number: after.phone_number,
        address: after.address,
        city: after.city,
        province: after.province,
        postal_code: after.postal_code,
      },
    });
  } catch (err) {
    console.error("updateCurrentUser error:", err);
    res.status(500).json({ message: "Server error updating profile" });
  }
};

// -------------------- GET CURRENT USER STATISTICS --------------------
export const getCurrentUserStats = async (req, res) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json({ message: "No active session" });
    }

    const userId = req.session.user.id;

    // Total appointments assigned to this user
    const [[totalAppointments]] = await pool.query(
      `SELECT COUNT(*) AS count FROM appointments WHERE staff_id = ?`,
      [userId]
    );

    // Upcoming appointments (future dates)
    const [[upcomingAppointments]] = await pool.query(
      `SELECT COUNT(*) AS count 
       FROM appointments 
       WHERE staff_id = ? AND appointment_date >= CURDATE() AND status != 'completed' AND status != 'cancelled' AND status != 'declined'`,
      [userId]
    );

    // Today's appointments
    const [[todaysAppointments]] = await pool.query(
      `SELECT COUNT(*) AS count 
       FROM appointments 
       WHERE staff_id = ? AND appointment_date = CURDATE()`,
      [userId]
    );

    // Completed appointments
    const [[completedAppointments]] = await pool.query(
      `SELECT COUNT(*) AS count 
       FROM appointments 
       WHERE staff_id = ? AND status = 'completed'`,
      [userId]
    );

    // Pending appointments
    const [[pendingAppointments]] = await pool.query(
      `SELECT COUNT(*) AS count 
       FROM appointments 
       WHERE staff_id = ? AND status = 'pending'`,
      [userId]
    );

    res.json({
      counts: {
        totalAppointments: totalAppointments.count || 0,
        upcomingAppointments: upcomingAppointments.count || 0,
        todaysAppointments: todaysAppointments.count || 0,
        completedAppointments: completedAppointments.count || 0,
        pendingAppointments: pendingAppointments.count || 0,
      },
    });
  } catch (err) {
    console.error("getCurrentUserStats error:", err);
    res.status(500).json({ message: "Server error fetching user statistics" });
  }
};

