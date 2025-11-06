/* eslint-disable no-undef */
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

// Load environment variables
dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "salon_booking_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Optional: test connection
export const testConnection = async () => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS now");
    console.log("Database connected! Current time:", rows[0].now);
  } catch (err) {
    console.error("Database connection failed:", err);
  }
};


export default pool;
