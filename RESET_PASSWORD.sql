-- ============================================
-- PASSWORD RESET SCRIPT
-- ============================================
-- This script helps reset a user's password
-- Run this in your MySQL database

-- Option 1: Reset password for a specific user by username
-- Replace 'your_username' with the actual username
-- Replace 'new_password_here' with the desired password
-- The password will be hashed using bcrypt

-- First, you need to hash the password using Node.js bcrypt
-- Or use this online tool: https://bcrypt-generator.com/
-- Or run this in Node.js:
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('your_password', 10);
-- console.log(hash);

-- Example: If your hashed password is $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- UPDATE staff 
-- SET hashed_password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
-- WHERE username = 'your_username';

-- Option 2: Check if a user's password hash is valid
-- SELECT staff_id, username, email, 
--        CASE 
--          WHEN hashed_password LIKE '$2a$%' OR hashed_password LIKE '$2b$%' OR hashed_password LIKE '$2y$%' 
--          THEN 'Valid bcrypt hash'
--          ELSE 'Invalid hash format'
--        END AS hash_status,
--        LENGTH(hashed_password) AS hash_length
-- FROM staff
-- WHERE username = 'your_username' OR email = 'your_email';

-- Option 3: List all users and their hash status
SELECT staff_id, username, email, 
       CASE 
         WHEN hashed_password LIKE '$2a$%' OR hashed_password LIKE '$2b$%' OR hashed_password LIKE '$2y$%' 
         THEN 'Valid'
         WHEN hashed_password IS NULL OR hashed_password = ''
         THEN 'Missing'
         ELSE 'Invalid'
       END AS hash_status,
       LENGTH(hashed_password) AS hash_length
FROM staff
ORDER BY staff_id;

