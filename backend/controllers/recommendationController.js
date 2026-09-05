const pool = require('../config/db');

// GET /api/recommendations
// Simple content-based recommendation: score books by overlap with the user's
// favorite categories/authors (derived from borrow history, ratings, wishlist).
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    const [categoryPrefs] = await pool.query(`
      SELECT b.category, COUNT(*) AS weight
      FROM (
        SELECT book_id FROM borrowings WHERE user_id = ?
        UNION ALL
        SELECT book_id FROM wishlist WHERE user_id = ?
        UNION ALL
        SELECT book_id FROM reviews WHERE user_id = ? AND rating >= 4
      ) AS activity
      JOIN books b ON b.id = activity.book_id
      GROUP BY b.category
      ORDER BY weight DESC
      LIMIT 5
    `, [userId, userId, userId]);

    const [authorPrefs] = await pool.query(`
      SELECT b.author, COUNT(*) AS weight
      FROM (
        SELECT book_id FROM borrowings WHERE user_id = ?
        UNION ALL
        SELECT book_id FROM reviews WHERE user_id = ? AND rating >= 4
      ) AS activity
      JOIN books b ON b.id = activity.book_id
      GROUP BY b.author
      ORDER BY weight DESC
      LIMIT 5
    `, [userId, userId]);

    if (categoryPrefs.length === 0 && authorPrefs.length === 0) {
      // Cold start: no history yet — return the most popular books instead.
      const [popular] = await pool.query(`
        SELECT b.*, COUNT(br.id) AS borrow_count
        FROM books b LEFT JOIN borrowings br ON br.book_id = b.id
        GROUP BY b.id ORDER BY borrow_count DESC LIMIT 10
      `);
      return res.json({ success: true, recommendations: popular, basis: 'popular' });
    }

    const categories = categoryPrefs.map(c => c.category);
    const authors = authorPrefs.map(a => a.author);

    const [alreadyInteracted] = await pool.query(`
      SELECT DISTINCT book_id FROM (
        SELECT book_id FROM borrowings WHERE user_id = ?
        UNION ALL
        SELECT book_id FROM wishlist WHERE user_id = ?
      ) t
    `, [userId, userId]);
    const excludeIds = alreadyInteracted.map(r => r.book_id);
    const excludeClause = excludeIds.length ? `AND b.id NOT IN (${excludeIds.map(() => '?').join(',')})` : '';

    const params = [];
    let scoreParts = [];
    if (categories.length) {
      scoreParts.push(`(CASE WHEN b.category IN (${categories.map(() => '?').join(',')}) THEN 2 ELSE 0 END)`);
      params.push(...categories);
    }
    if (authors.length) {
      scoreParts.push(`(CASE WHEN b.author IN (${authors.map(() => '?').join(',')}) THEN 3 ELSE 0 END)`);
      params.push(...authors);
    }
    const scoreExpr = scoreParts.join(' + ') || '0';

    const query = `
      SELECT b.*, (${scoreExpr}) AS score
      FROM books b
      WHERE 1=1 ${excludeClause}
      HAVING score > 0
      ORDER BY score DESC, b.created_at DESC
      LIMIT 10
    `;
    const [rows] = await pool.query(query, [...params, ...excludeIds]);

    res.json({ success: true, recommendations: rows, basis: 'personalized', topCategories: categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error generating recommendations.' });
  }
};
