const pool = require('../config/db');

// Central helper so every module (borrowings, renewals, wishlist, admin actions)
// creates notifications the same way.
async function createNotification(userId, title, message, type = 'general') {
  try {
    await pool.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [userId, title, message, type]
    );
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
}

module.exports = { createNotification };
