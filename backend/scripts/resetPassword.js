/* eslint-disable no-undef */
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { pool } from '../utils/db.js';

dotenv.config();

// Reset password for a user
async function resetPassword(username, newPassword) {
  try {
    // Check if user exists
    const [users] = await pool.query(
      'SELECT staff_id, username, email FROM staff WHERE username = ? OR email = ?',
      [username, username]
    );

    if (users.length === 0) {
      console.error(`User "${username}" not found`);
      return;
    }

    const user = users[0];
    console.log(`Found user: ${user.username} (${user.email})`);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('Generated hash:', hashedPassword.substring(0, 20) + '...');

    // Update the password
    await pool.query(
      'UPDATE staff SET hashed_password = ? WHERE staff_id = ?',
      [hashedPassword, user.staff_id]
    );

    console.log(`✅ Password reset successfully for ${user.username}`);
    console.log(`New password: ${newPassword}`);
    console.log('You can now log in with this password.');
  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    await pool.end();
  }
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node resetPassword.js <username> <new_password>');
  console.log('Example: node resetPassword.js admin newpassword123');
  process.exit(1);
}

const [username, newPassword] = args;
resetPassword(username, newPassword);

