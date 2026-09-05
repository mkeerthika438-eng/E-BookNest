const pool = require('../config/db');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

// GET /api/books  — search, filter, sort, paginate
exports.getBooks = async (req, res) => {
  try {
    const {
      search, category, author, availability, ebook, minRating,
      sort = 'recent', page = 1, limit = 12
    } = req.query;

    let where = [];
    let params = [];

    if (search) {
      where.push('(b.title LIKE ? OR b.author LIKE ? OR b.isbn = ? OR b.book_id = ?)');
      params.push(`%${search}%`, `%${search}%`, search, search);
    }
    if (category) { where.push('b.category = ?'); params.push(category); }
    if (author) { where.push('b.author LIKE ?'); params.push(`%${author}%`); }
    if (availability === 'available') where.push('b.available_copies > 0');
    if (ebook === 'true') where.push('b.ebook_file IS NOT NULL');

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    let ratingHaving = '';
    if (minRating) ratingHaving = `HAVING avg_rating >= ${Number(minRating)}`;

    let orderBy = 'b.created_at DESC';
    if (sort === 'az') orderBy = 'b.title ASC';
    else if (sort === 'za') orderBy = 'b.title DESC';
    else if (sort === 'rating') orderBy = 'avg_rating DESC';
    else if (sort === 'popular') orderBy = 'borrow_count DESC';
    else if (sort === 'recent') orderBy = 'b.created_at DESC';

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const query = `
      SELECT b.*,
        COALESCE(AVG(r.rating), 0) AS avg_rating,
        COUNT(DISTINCT r.id) AS rating_count,
        COUNT(DISTINCT br.id) AS borrow_count
      FROM books b
      LEFT JOIN reviews r ON r.book_id = b.id AND r.status = 'visible'
      LEFT JOIN borrowings br ON br.book_id = b.id
      ${whereClause}
      GROUP BY b.id
      ${ratingHaving}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(query, [...params, limitNum, offset]);

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM books b ${whereClause}`,
      params
    );

    res.json({
      success: true,
      books: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: countRows[0].total,
        totalPages: Math.ceil(countRows[0].total / limitNum)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching books.' });
  }
};

// GET /api/books/:id  (numeric id OR book_id code)
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT b.*,
        COALESCE(AVG(r.rating), 0) AS avg_rating,
        COUNT(DISTINCT r.id) AS rating_count
       FROM books b
       LEFT JOIN reviews r ON r.book_id = b.id AND r.status = 'visible'
       WHERE b.id = ? OR b.book_id = ?
       GROUP BY b.id`,
      [id, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Book not found.' });
    }
    res.json({ success: true, book: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching book.' });
  }
};

// POST /api/books  (admin)
exports.createBook = async (req, res) => {
  try {
    const {
      book_id, title, author, isbn, category, description,
      publisher, publication_year, language, total_copies
    } = req.body;

    if (!book_id || !title || !author || !category || !total_copies) {
      return res.status(400).json({ success: false, message: 'Book ID, title, author, category, and total copies are required.' });
    }

    const [existing] = await pool.query('SELECT id FROM books WHERE book_id = ?', [book_id]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'A book with this Book ID already exists.' });
    }

    const cover_image = req.files?.cover ? `/uploads/covers/${req.files.cover[0].filename}` : null;
    const ebook_file = req.files?.ebook ? `/uploads/ebooks/${req.files.ebook[0].filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO books (book_id, title, author, isbn, category, description, publisher, publication_year, language, total_copies, available_copies, cover_image, ebook_file)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [book_id, title, author, isbn || null, category, description || null, publisher || null,
       publication_year || null, language || 'English', total_copies, total_copies, cover_image, ebook_file]
    );

    // Generate QR code containing the book_id, redirecting to the book detail route
    const qrDir = path.join(__dirname, '..', 'uploads', 'qrcodes');
    if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });
    const qrFilename = `${book_id}.png`;
    const qrPath = path.join(qrDir, qrFilename);
    const qrPayload = JSON.stringify({ type: 'ebooknest_book', book_id });
    await QRCode.toFile(qrPath, qrPayload, { width: 400 });
    const qr_code = `/uploads/qrcodes/${qrFilename}`;

    await pool.query('UPDATE books SET qr_code = ? WHERE id = ?', [qr_code, result.insertId]);

    res.status(201).json({ success: true, message: 'Book added successfully.', bookId: result.insertId, qr_code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error creating book.' });
  }
};

// PUT /api/books/:id  (admin)
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const [existingRows] = await pool.query('SELECT * FROM books WHERE id = ?', [id]);
    if (existingRows.length === 0) return res.status(404).json({ success: false, message: 'Book not found.' });
    const existing = existingRows[0];

    const fields = ['title', 'author', 'isbn', 'category', 'description', 'publisher',
      'publication_year', 'language', 'total_copies', 'available_copies'];
    const updates = [];
    const params = [];
    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = ?`);
        params.push(req.body[f]);
      }
    });

    if (req.files?.cover) {
      updates.push('cover_image = ?');
      params.push(`/uploads/covers/${req.files.cover[0].filename}`);
    }
    if (req.files?.ebook) {
      updates.push('ebook_file = ?');
      params.push(`/uploads/ebooks/${req.files.ebook[0].filename}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields provided to update.' });
    }

    params.push(id);
    await pool.query(`UPDATE books SET ${updates.join(', ')} WHERE id = ?`, params);
    res.json({ success: true, message: 'Book updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error updating book.' });
  }
};

// DELETE /api/books/:id  (admin)
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM books WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Book not found.' });
    res.json({ success: true, message: 'Book deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error deleting book. It may have active borrowings.' });
  }
};

// GET /api/books/qr/:bookId — resolve a scanned QR's book_id to full details
exports.getByQr = async (req, res) => {
  try {
    const { bookId } = req.params;
    const [rows] = await pool.query('SELECT * FROM books WHERE book_id = ?', [bookId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No book found for this QR code / Book ID.' });
    }
    res.json({ success: true, book: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error resolving QR code.' });
  }
};

// GET /api/books/categories/list — distinct categories for filter dropdown
exports.getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT category FROM books ORDER BY category');
    res.json({ success: true, categories: rows.map(r => r.category) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching categories.' });
  }
};
