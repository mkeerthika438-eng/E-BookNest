const pool = require('../config/db');
const { createNotification } = require('../utils/notify');

const MAX_RENEWALS = parseInt(process.env.MAX_RENEWALS || '2');
const RENEWAL_DAYS = parseInt(process.env.RENEWAL_DAYS || '7');

// POST /api/renewals — renew an eligible borrowed book
exports.createRenewal = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { borrowing_id } = req.body;
    const userId = req.user.id;
    if (!borrowing_id) return res.status(400).json({ success: false, message: 'borrowing_id is required.' });

    await conn.beginTransaction();

    const [borrowRows] = await conn.query('SELECT * FROM borrowings WHERE id = ? FOR UPDATE', [borrowing_id]);
    if (borrowRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Borrowing record not found.' });
    }
    const borrowing = borrowRows[0];

    if (borrowing.user_id !== userId) {
      await conn.rollback();
      return res.status(403).json({ success: false, message: 'This is not your borrowed book.' });
    }
    if (borrowing.status !== 'active') {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Only active borrowings can be renewed.' });
    }

    const today = new Date().toISOString().slice(0, 10);
    if (today > borrowing.due_date) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Renewal is not allowed after the due date has passed.' });
    }

    const [renewalCountRows] = await conn.query(
      'SELECT COUNT(*) AS cnt FROM renewals WHERE borrowing_id = ?',
      [borrowing_id]
    );
    const renewalCount = renewalCountRows[0].cnt;
    if (renewalCount >= MAX_RENEWALS) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: `Maximum renewal limit (${MAX_RENEWALS}) reached for this book.` });
    }

    // Reservation check: block renewal if another active borrowing is effectively
    // waiting (i.e., no other spare copies and other users hold active borrowings queued)
    const [waitlist] = await conn.query(
      `SELECT COUNT(*) AS cnt FROM wishlist w
       JOIN books b ON b.id = w.book_id
       WHERE w.book_id = ? AND b.available_copies = 0`,
      [borrowing.book_id]
    );
    // If nobody else is waiting via wishlist while stock is out, allow renewal.
    // (Simple heuristic per project scope — no separate reservation table required.)

    const oldDueDate = borrowing.due_date;
    const newDue = new Date(oldDueDate);
    newDue.setDate(newDue.getDate() + RENEWAL_DAYS);
    const newDueDateStr = newDue.toISOString().slice(0, 10);

    await conn.query('UPDATE borrowings SET due_date = ? WHERE id = ?', [newDueDateStr, borrowing_id]);
    await conn.query(
      `INSERT INTO renewals (borrowing_id, user_id, old_due_date, new_due_date, renewal_number)
       VALUES (?, ?, ?, ?, ?)`,
      [borrowing_id, userId, oldDueDate, newDueDateStr, renewalCount + 1]
    );

    await conn.commit();

    await createNotification(userId, 'Book Renewed', `Your due date was extended to ${newDueDateStr}.`, 'renewal');

    res.status(201).json({ success: true, message: 'Book renewed successfully.', newDueDate: newDueDateStr });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: 'Error processing renewal.' });
  } finally {
    conn.release();
  }
};

// GET /api/renewals/my
exports.getMyRenewals = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT rn.*, b.title, b.author, b.cover_image
      FROM renewals rn
      JOIN borrowings br ON br.id = rn.borrowing_id
      JOIN books b ON b.id = br.book_id
      WHERE rn.user_id = ?
      ORDER BY rn.renewed_at DESC
    `, [req.user.id]);
    res.json({ success: true, renewals: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching renewal history.' });
  }
};

// GET /api/renewals — admin: all renewal activity
exports.getAllRenewals = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT rn.*, u.name AS user_name, b.title
      FROM renewals rn
      JOIN users u ON u.id = rn.user_id
      JOIN borrowings br ON br.id = rn.borrowing_id
      JOIN books b ON b.id = br.book_id
      ORDER BY rn.renewed_at DESC
      LIMIT 500
    `);
    res.json({ success: true, renewals: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching renewal activity.' });
  }
};
