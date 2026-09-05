const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reviewController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/admin/all', authenticate, requireAdmin, ctrl.getAllReviewsAdmin);
router.put('/:id/moderate', authenticate, requireAdmin, ctrl.moderateReview);
router.get('/:bookId', ctrl.getBookReviews);
router.post('/', authenticate, ctrl.createReview);
router.put('/:id', authenticate, ctrl.updateReview);
router.delete('/:id', authenticate, ctrl.deleteReview);

module.exports = router;
