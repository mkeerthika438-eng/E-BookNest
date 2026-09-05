const pool = require('../config/db');

// GET /api/dashboard/user
exports.userDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const [[borrowedStats]] = await pool.query(`
      SELECT
        COUNT(*) AS total_borrowed,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS currently_borrowed,
        SUM(CASE WHEN status = 'active' AND due_date <= DATE_ADD(CURDATE(), INTERVAL 3 DAY) THEN 1 ELSE 0 END) AS due_soon
      FROM borrowings WHERE user_id = ?
    `, [userId]);

    const [[renewalStats]] = await pool.query(
      'SELECT COUNT(*) AS renewed_count FROM renewals WHERE user_id = ?', [userId]
    );
    const [[wishlistStats]] = await pool.query(
      'SELECT COUNT(*) AS wishlist_count FROM wishlist WHERE user_id = ?', [userId]
    );
    const [[ebookStats]] = await pool.query(
      'SELECT COUNT(*) AS ebooks_read, COALESCE(AVG(progress),0) AS avg_progress FROM reading_history WHERE user_id = ?', [userId]
    );

    const [recentActivity] = await pool.query(`
      SELECT 'borrow' AS action, b.title, br.borrowed_at AS at FROM borrowings br JOIN books b ON b.id = br.book_id WHERE br.user_id = ?
      UNION ALL
      SELECT 'renewal' AS action, b.title, rn.renewed_at AS at FROM renewals rn JOIN borrowings br ON br.id = rn.borrowing_id JOIN books b ON b.id = br.book_id WHERE rn.user_id = ?
      ORDER BY at DESC LIMIT 8
    `, [userId, userId]);

    res.json({
      success: true,
      stats: {
        totalBorrowed: borrowedStats.total_borrowed || 0,
        currentlyBorrowed: borrowedStats.currently_borrowed || 0,
        dueSoon: borrowedStats.due_soon || 0,
        renewedBooks: renewalStats.renewed_count || 0,
        wishlistCount: wishlistStats.wishlist_count || 0,
        ebooksRead: ebookStats.ebooks_read || 0,
        avgReadingProgress: Number(ebookStats.avg_progress).toFixed(1)
      },
      recentActivity
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error loading dashboard.' });
  }
};

// GET /api/dashboard/admin
exports.adminDashboard = async (req, res) => {
  try {
    const [[bookStats]] = await pool.query('SELECT COUNT(*) AS total_books, SUM(available_copies) AS available, COUNT(ebook_file) AS ebook_count FROM books');
    const [[userStats]] = await pool.query(`SELECT COUNT(*) AS total_users FROM users WHERE role = 'student'`);
    const [[borrowStats]] = await pool.query(`SELECT SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) AS active_borrowings, SUM(CASE WHEN status='active' AND due_date < CURDATE() THEN 1 ELSE 0 END) AS overdue FROM borrowings`);
    const [[renewalStats]] = await pool.query('SELECT COUNT(*) AS total_renewals FROM renewals');

    const [byCategory] = await pool.query('SELECT category, COUNT(*) AS count FROM books GROUP BY category ORDER BY count DESC');

    const [monthlyBorrowing] = await pool.query(`
      SELECT DATE_FORMAT(borrowed_at, '%Y-%m') AS month, COUNT(*) AS count
      FROM borrowings
      WHERE borrowed_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY month ORDER BY month
    `);

    const [popularBooks] = await pool.query(`
      SELECT b.title, COUNT(br.id) AS borrow_count
      FROM books b LEFT JOIN borrowings br ON br.book_id = b.id
      GROUP BY b.id ORDER BY borrow_count DESC LIMIT 5
    `);

    const [userActivity] = await pool.query(`
      SELECT u.name, COUNT(br.id) AS borrow_count
      FROM users u LEFT JOIN borrowings br ON br.user_id = u.id
      WHERE u.role = 'student'
      GROUP BY u.id ORDER BY borrow_count DESC LIMIT 5
    `);

    res.json({
      success: true,
      stats: {
        totalBooks: bookStats.total_books || 0,
        totalUsers: userStats.total_users || 0,
        activeBorrowings: borrowStats.active_borrowings || 0,
        overdueBooks: borrowStats.overdue || 0,
        totalRenewals: renewalStats.total_renewals || 0,
        totalEbooks: bookStats.ebook_count || 0
      },
      charts: { byCategory, monthlyBorrowing, popularBooks, userActivity }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error loading admin dashboard.' });
  }
};
