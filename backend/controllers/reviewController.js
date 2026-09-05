const pool = require('../config/db');

// GET /api/reviews/:bookId
exports.getBookReviews = async (req, res) => {
  try {
    const { bookId } = req.params;
    const [rows] = await pool.query(`
      SELECT r.*, u.name AS user_name
      FROM reviews r JOIN users u ON u.id = r.user_id
      WHERE r.book_id = ? AND r.status = 'visible'
      ORDER BY r.created_at DESC
    `, [bookId]);

    const [agg] = await pool.query(`
      SELECT COALESCE(AVG(rating),0) AS avg_rating, COUNT(*) AS total
      FROM reviews WHERE book_id = ? AND status = 'visible'
    `, [bookId]);

    res.json({ success: true, reviews: rows, avgRating: Number(agg[0].avg_rating).toFixed(1), total: agg[0].total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching reviews.' });
  }
};

// POST /api/reviews
exports.createReview = async (req, res) => {
  try {
    const { book_id, rating, review } = req.body;
    if (!book_id || !rating) return res.status(400).json({ success: false, message: 'book_id and rating are required.' });
    if (rating < 1 || rating > 5) return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });

    const [existing] = await pool.query(
      'SELECT id FROM reviews WHERE user_id = ? AND book_id = ?', [req.user.id, book_id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'You already reviewed this book. Edit your existing review instead.' });
    }

    await pool.query(
      'INSERT INTO reviews (user_id, book_id, rating, review) VALUES (?, ?, ?, ?)',
      [req.user.id, book_id, rating, review || null]
    );
    res.status(201).json({ success: true, message: 'Review submitted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error submitting review.' });
  }
};

// PUT /api/reviews/:id
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;

    const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Review not found.' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ success: false, message: 'You can only edit your own review.' });

    await pool.query('UPDATE reviews SET rating = ?, review = ? WHERE id = ?', [rating, review, id]);
    res.json({ success: true, message: 'Review updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error updating review.' });
  }
};

// DELETE /api/reviews/:id
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Review not found.' });
    if (rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only delete your own review.' });
    }
    await pool.query('DELETE FROM reviews WHERE id = ?', [id]);
    res.json({ success: true, message: 'Review deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error deleting review.' });
  }
};

// GET /api/reviews — admin: all reviews for moderation
exports.getAllReviewsAdmin = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.*, u.name AS user_name, b.title AS book_title
      FROM reviews r JOIN users u ON u.id = r.user_id JOIN books b ON b.id = r.book_id
      ORDER BY r.created_at DESC
    `);
    res.json({ success: true, reviews: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching reviews.' });
  }
};

// PUT /api/reviews/:id/moderate — admin: hide/unhide
exports.moderateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'visible' | 'hidden'
    await pool.query('UPDATE reviews SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, message: `Review ${status === 'hidden' ? 'hidden' : 'made visible'}.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error moderating review.' });
  }
};
