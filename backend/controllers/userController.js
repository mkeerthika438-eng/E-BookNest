const pool = require('../config/db');

// GET /api/users — admin: view registered users
exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, name, email, phone, college_id, role, created_at,
        (SELECT COUNT(*) FROM borrowings WHERE user_id = users.id) AS total_borrowed,
        (SELECT COUNT(*) FROM borrowings WHERE user_id = users.id AND status = 'active') AS currently_borrowed
      FROM users
      WHERE role = 'student'
      ORDER BY created_at DESC
    `);
    res.json({ success: true, users: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching users.' });
  }
};

// POST /api/users/run-reminders — admin: manually trigger the due-date/overdue
// reminder check instead of waiting for the daily 8 AM schedule (handy for testing).
exports.runRemindersNow = async (req, res) => {
  try {
    const { runReminderCheck } = require('../utils/reminderJob');
    await runReminderCheck();
    res.json({ success: true, message: 'Reminder check completed. See server logs for details.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error running reminder check.' });
  }
};
