const pool = require('../config/db');

// GET /api/wishlist
exports.getWishlist = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT w.id AS wishlist_id, w.created_at, b.*
      FROM wishlist w JOIN books b ON b.id = w.book_id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `, [req.user.id]);
    res.json({ success: true, wishlist: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching wishlist.' });
  }
};

// POST /api/wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { book_id } = req.body;
    if (!book_id) return res.status(400).json({ success: false, message: 'book_id is required.' });

    const [book] = await pool.query('SELECT id FROM books WHERE id = ?', [book_id]);
    if (book.length === 0) return res.status(404).json({ success: false, message: 'Book not found.' });

    const [existing] = await pool.query(
      'SELECT id FROM wishlist WHERE user_id = ? AND book_id = ?', [req.user.id, book_id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'This book is already in your wishlist.' });
    }

    await pool.query('INSERT INTO wishlist (user_id, book_id) VALUES (?, ?)', [req.user.id, book_id]);
    res.status(201).json({ success: true, message: 'Added to wishlist.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error adding to wishlist.' });
  }
};

// DELETE /api/wishlist/:bookId
exports.removeFromWishlist = async (req, res) => {
  try {
    const { bookId } = req.params;
    const [result] = await pool.query(
      'DELETE FROM wishlist WHERE user_id = ? AND book_id = ?', [req.user.id, bookId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Item not found in wishlist.' });
    }
    res.json({ success: true, message: 'Removed from wishlist.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error removing from wishlist.' });
  }
};
