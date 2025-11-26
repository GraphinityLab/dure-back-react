import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const sqlFilePath = path.join(__dirname, '../salon_booking_db_cleaned.sql');

async function seed() {
  console.log('Reading SQL file...');
  const sql = fs.readFileSync(sqlFilePath, 'utf8');
  
  // Basic splitting by semicolon, might need more robust parsing if there are semicolons in strings
  // But for a dump file, usually it's fine or we can execute the whole thing if the driver supports multiple statements
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true
  });

  console.log('Connected to MySQL.');

  try {
    const dbName = process.env.DB_NAME || 'salon_booking_db';
    console.log(`Creating database ${dbName} if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.query(`USE \`${dbName}\``);
    
    console.log('Executing SQL script...');
    await connection.query(sql);
    
    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await connection.end();
  }
}

seed();
