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

