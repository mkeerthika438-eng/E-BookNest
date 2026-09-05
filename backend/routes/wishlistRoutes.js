const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/wishlistController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, ctrl.getWishlist);
router.post('/', authenticate, ctrl.addToWishlist);
router.delete('/:bookId', authenticate, ctrl.removeFromWishlist);

module.exports = router;
