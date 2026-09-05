const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const ctrl = require('../controllers/bookController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Combine cover + ebook upload fields for admin book create/update
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = file.fieldname === 'ebook'
      ? path.join(__dirname, '..', 'uploads', 'ebooks')
      : path.join(__dirname, '..', 'uploads', 'covers');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`)
});
const uploadFields = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }).fields([
  { name: 'cover', maxCount: 1 },
  { name: 'ebook', maxCount: 1 }
]);

router.get('/', ctrl.getBooks);
router.get('/categories/list', ctrl.getCategories);
router.get('/qr/:bookId', ctrl.getByQr);
router.get('/:id', ctrl.getBookById);
router.post('/', authenticate, requireAdmin, uploadFields, ctrl.createBook);
router.put('/:id', authenticate, requireAdmin, uploadFields, ctrl.updateBook);
router.delete('/:id', authenticate, requireAdmin, ctrl.deleteBook);

module.exports = router;
