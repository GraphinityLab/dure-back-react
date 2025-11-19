/* eslint-disable no-undef */
import { createRequire } from 'node:module';

import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';

import appointmentRoutes from './routes/appointmentsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import clientsRoutes from './routes/clientsRoutes.js';
import clockInOutRoutes from './routes/clockInOutRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import logRoutes from './routes/logRoutes.js';
import notificationsRoutes from './routes/notificationsRoutes.js';
import recurringAppointmentsRoutes
  from './routes/recurringAppointmentsRoutes.js';
import rolesPermissionsRoutes from './routes/rolesPermissionsRoutes.js';
import servicesRoutes from './routes/servicesRoutes.js';
import skillsCertificationsRoutes from './routes/skillsCertificationsRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import staffSchedulesRoutes from './routes/staffSchedulesRoutes.js';
import timeOffRoutes from './routes/timeOffRoutes.js';
import waitlistRoutes from './routes/waitlistRoutes.js';
import { testConnection } from './utils/db.js';

const require = createRequire(import.meta.url);

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// -------------------- SECURITY & MIDDLEWARE --------------------
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-first-name",
      "x-last-name",
    ],
  })
);
app.use(express.json());
app.use(cookieParser());

// -------------------- MYSQL SESSION STORE --------------------
const MySQLStore = require("express-mysql-session")(session);

const sessionStoreOptions = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "salon_booking_db",
};

const sessionStore = new MySQLStore(sessionStoreOptions);

// -------------------- SESSION MIDDLEWARE --------------------
app.use(
  session({
    key: process.env.SESSION_NAME || "sid",
    secret: process.env.SESSION_SECRET || "supersecretvalue",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // ❗ must stay false on localhost (no HTTPS)
      sameSite: "none", // ✅ Chrome-compatible for localhost
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

// -------------------- SESSION ENDPOINTS --------------------

// Extend session
app.post("/api/session/extend", (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: "No active session" });
  }
  req.session.touch();
  res.json({ message: "Session extended" });
});

// Get session status
app.get("/api/session/status", (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: "No active session" });
  }

  const cookieMaxAge = req.session.cookie.maxAge || 0;
  if (!req.session.createdAt) req.session.createdAt = Date.now();

  const expiresAt = req.session.createdAt + cookieMaxAge;
  const remainingTime = expiresAt - Date.now();

  res.json({
    createdAt: req.session.createdAt,
    expiresAt,
    remainingTime: remainingTime > 0 ? remainingTime : 0,
  });
});

// Debug session (optional, shows only if exists)
app.get("/debug-session", (req, res) => {
  res.json({ session: req.session?.user || null });
});

// -------------------- ROUTES --------------------
app.use("/api/auth", authRoutes);
app.use("/api/clock", clockInOutRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/staff-schedules", staffSchedulesRoutes);
app.use("/api/time-off", timeOffRoutes);
app.use("/api/recurring-appointments", recurringAppointmentsRoutes);
app.use("/api/waitlist", waitlistRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/skills", skillsCertificationsRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/clients", clientsRoutes);
app.use("/api/rolePermissions", rolesPermissionsRoutes);
app.use("/api/roles", rolesPermissionsRoutes); // Alias for convenience
app.use("/api/history", historyRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/appointments", appointmentRoutes);

// -------------------- TEST DB --------------------
testConnection();

// -------------------- ROOT --------------------
app.get("/", (req, res) => {
  res.json({ message: "Backend running" });
});

const staffSeedData = [
  {
    email: "testadmin@example.com",
    username: "test",
    password: "admin123",
    role_id: 1,
    first_name: "Test",
    last_name: "User",
    address: "1234 Main St",
    city: "Brampton",
    province: "ON",
    postal_code: "M1A1A1",
  },
];

// Function to seed multiple staff
async function seedStaff(staffList) {
  let connection;
  try {
    connection = await pool.getConnection();

    for (const staff of staffList) {
      try {
        const hashedPassword = await bcrypt.hash(staff.password, 10);

        const sql = `
          INSERT INTO staff 
          (email, username, hashed_password, role_id, first_name, last_name, address, city, province, postal_code)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
          staff.email,
          staff.username,
          hashedPassword,
          staff.role_id,
          staff.first_name,
          staff.last_name,
          staff.address,
          staff.city,
          staff.province,
          staff.postal_code,
        ];

        await connection.execute(sql, values);
        console.log(`Staff '${staff.username}' created successfully.`);
      } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
          console.warn(`Staff '${staff.username}' already exists. Skipping.`);
        } else {
          console.error(`Error creating staff '${staff.username}':`, error);
        }
      }
    }
  } catch (error) {
    console.error("Error connecting to DB for staff seeding:", error);
  } finally {
    if (connection) connection.release();
  }
}

// --- Seed staff (run once) ---
seedStaff(staffSeedData);

// -------------------- START SERVER --------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
