import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000
});

export const testConnection = async () => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS now");
    console.log("Database connected. Current time:", rows[0].now);
  } catch (err) {
    console.error("Database connection failed:", {
      message: err.message,
      code: err.code,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      db: process.env.DB_NAME
    });
  }
};

export default pool;
