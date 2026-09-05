// MySQL connection pool for E-BookNest Digital Library Platform
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ebooknest',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

// Quick sanity check on boot
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL connected: ebooknest database');
    conn.release();
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
    console.error('   Check your .env DB_HOST/DB_USER/DB_PASSWORD/DB_NAME values.');
  }
})();

module.exports = pool;
