// Seeds an admin account and a demo student account with properly hashed passwords.
// Run with: npm run seed  (after schema.sql and seed_books.sql have been imported)
require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../config/db');

async function seed() {
  try {
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const studentPassword = await bcrypt.hash('Student@123', 10);

    await pool.query(
      `INSERT INTO users (name, email, phone, college_id, password, role)
       VALUES (?, ?, ?, ?, ?, 'admin')
       ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      ['Library Admin', 'admin@ebooknest.edu', '9999999999', 'ADMIN001', adminPassword]
    );

    await pool.query(
      `INSERT INTO users (name, email, phone, college_id, password, role)
       VALUES (?, ?, ?, ?, ?, 'student')
       ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      ['Demo Student', 'student@ebooknest.edu', '9888888888', 'STU2026001', studentPassword]
    );

    console.log('✅ Seeded admin (admin@ebooknest.edu / Admin@123)');
    console.log('✅ Seeded demo student (student@ebooknest.edu / Student@123)');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
