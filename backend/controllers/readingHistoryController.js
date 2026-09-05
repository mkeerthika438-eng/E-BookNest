const pool = require('../config/db');

// GET /api/reading-history
exports.getHistory = async (req, res) => {
  try {
    const { category, from, to } = req.query;
    let query = `
      SELECT rh.*, b.title, b.author, b.category, b.cover_image
      FROM reading_history rh JOIN books b ON b.id = rh.book_id
      WHERE rh.user_id = ?`;
    const params = [req.user.id];
    if (category) { query += ' AND b.category = ?'; params.push(category); }
    if (from) { query += ' AND rh.last_read_at >= ?'; params.push(from); }
    if (to) { query += ' AND rh.last_read_at <= ?'; params.push(to); }
    query += ' ORDER BY rh.last_read_at DESC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, history: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching reading history.' });
  }
};

// POST /api/reading-history — upsert progress (called by the e-book reader as the user reads)
exports.updateProgress = async (req, res) => {
  try {
    const { book_id, progress, last_page } = req.body;
    if (!book_id) return res.status(400).json({ success: false, message: 'book_id is required.' });

    await pool.query(`
      INSERT INTO reading_history (user_id, book_id, progress, last_page, last_read_at)
      VALUES (?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE progress = VALUES(progress), last_page = VALUES(last_page), last_read_at = NOW()
    `, [req.user.id, book_id, progress || 0, last_page || 1]);

    res.json({ success: true, message: 'Reading progress saved.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error saving reading progress.' });
  }
};
