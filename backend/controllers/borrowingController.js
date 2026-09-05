const pool = require('../config/db');
const { createNotification } = require('../utils/notify');

const BORROW_DAYS = parseInt(process.env.BORROW_DAYS || '14');
const FINE_PER_DAY = parseFloat(process.env.FINE_PER_DAY || '5');

// For books still active (not yet returned) but past due, show the fine that
// WOULD apply if returned today — this is a live estimate, not yet charged.
function attachLiveFine(borrowing) {
  if (borrowing.status !== 'active') return borrowing;
  const today = new Date(); today.setHours(0,0,0,0);
  const dueDate = new Date(borrowing.due_date); dueDate.setHours(0,0,0,0);
  if (today <= dueDate) return { ...borrowing, live_fine: 0 };
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysLate = Math.ceil((today - dueDate) / msPerDay);
  return { ...borrowing, live_fine: Number((daysLate * FINE_PER_DAY).toFixed(2)) };
}

// POST /api/borrowings — student requests/borrows a book
exports.createBorrowing = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { book_id } = req.body;
    const userId = req.user.id;
    if (!book_id) return res.status(400).json({ success: false, message: 'book_id is required.' });

    await conn.beginTransaction();

    const [bookRows] = await conn.query('SELECT * FROM books WHERE id = ? FOR UPDATE', [book_id]);
    if (bookRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Book not found.' });
    }
    const book = bookRows[0];
    if (book.available_copies < 1) {
      await conn.rollback();
      return res.status(409).json({ success: false, message: 'No copies currently available for this book.' });
    }

    const [already] = await conn.query(
      `SELECT id FROM borrowings WHERE user_id = ? AND book_id = ? AND status = 'active'`,
      [userId, book_id]
    );
    if (already.length > 0) {
      await conn.rollback();
      return res.status(409).json({ success: false, message: 'You already have this book borrowed.' });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + BORROW_DAYS);
    const dueDateStr = dueDate.toISOString().slice(0, 10);

    const [result] = await conn.query(
      `INSERT INTO borrowings (user_id, book_id, due_date, status) VALUES (?, ?, ?, 'active')`,
      [userId, book_id, dueDateStr]
    );
    await conn.query('UPDATE books SET available_copies = available_copies - 1 WHERE id = ?', [book_id]);

    await conn.commit();

    await createNotification(userId, 'Book Borrowed', `You borrowed "${book.title}". Due on ${dueDateStr}.`, 'general');

    res.status(201).json({ success: true, message: 'Book borrowed successfully.', borrowingId: result.insertId, dueDate: dueDateStr });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: 'Error processing borrow request.' });
  } finally {
    conn.release();
  }
};

// GET /api/borrowings/my — student's own borrowings
exports.getMyBorrowings = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT br.*, b.title, b.author, b.cover_image, b.book_id AS book_code
      FROM borrowings br JOIN books b ON b.id = br.book_id
      WHERE br.user_id = ?`;
    const params = [req.user.id];
    if (status) { query += ' AND br.status = ?'; params.push(status); }
    query += ' ORDER BY br.borrowed_at DESC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, borrowings: rows.map(attachLiveFine) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching your borrowed books.' });
  }
};

// PUT /api/borrowings/:id/return — mark as returned (admin, or student self-return)
exports.returnBorrowing = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    await conn.beginTransaction();

    const [rows] = await conn.query('SELECT * FROM borrowings WHERE id = ? FOR UPDATE', [id]);
    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Borrowing record not found.' });
    }
    const borrowing = rows[0];

    if (req.user.role !== 'admin' && borrowing.user_id !== req.user.id) {
      await conn.rollback();
      return res.status(403).json({ success: false, message: 'You cannot modify this record.' });
    }
    if (borrowing.status === 'returned') {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'This book has already been returned.' });
    }

    // Calculate a late fine if returned after the due date
    const today = new Date();
    const dueDate = new Date(borrowing.due_date);
    let fineAmount = 0;
    if (today > dueDate) {
      const msPerDay = 1000 * 60 * 60 * 24;
      const daysLate = Math.ceil((today.setHours(0,0,0,0) - dueDate.setHours(0,0,0,0)) / msPerDay);
      fineAmount = Math.max(0, daysLate) * FINE_PER_DAY;
    }

    await conn.query(
      `UPDATE borrowings SET status = 'returned', returned_at = NOW(), fine_amount = ? WHERE id = ?`,
      [fineAmount, id]
    );
    await conn.query('UPDATE books SET available_copies = available_copies + 1 WHERE id = ?', [borrowing.book_id]);

    await conn.commit();

    if (fineAmount > 0) {
      await createNotification(
        borrowing.user_id,
        'Late Return Fine',
        `This book was returned late. A fine of ₹${fineAmount.toFixed(2)} has been applied.`,
        'general'
      );
    }

    res.json({ success: true, message: 'Book marked as returned.', fineAmount });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: 'Error returning book.' });
  } finally {
    conn.release();
  }
};

// PUT /api/borrowings/:id/pay-fine — admin marks a fine as paid (e.g. paid in cash at the desk)
exports.payFine = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM borrowings WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Borrowing record not found.' });
    if (Number(rows[0].fine_amount) <= 0) {
      return res.status(400).json({ success: false, message: 'There is no fine on this record.' });
    }
    await pool.query('UPDATE borrowings SET fine_paid = TRUE WHERE id = ?', [id]);
    res.json({ success: true, message: 'Fine marked as paid.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error updating fine.' });
  }
};

// GET /api/borrowings — admin: view all borrowing activity
exports.getAllBorrowings = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT br.*, u.name AS user_name, u.email, b.title, b.book_id AS book_code
      FROM borrowings br
      JOIN users u ON u.id = br.user_id
      JOIN books b ON b.id = br.book_id
      ORDER BY br.borrowed_at DESC
      LIMIT 500
    `);
    res.json({ success: true, borrowings: rows.map(attachLiveFine) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching borrowing activity.' });
  }
};
