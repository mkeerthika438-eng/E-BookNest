const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/borrowingController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.post('/', authenticate, ctrl.createBorrowing);
router.get('/my', authenticate, ctrl.getMyBorrowings);
router.get('/', authenticate, requireAdmin, ctrl.getAllBorrowings);
router.put('/:id/return', authenticate, ctrl.returnBorrowing);
router.put('/:id/pay-fine', authenticate, requireAdmin, ctrl.payFine);

module.exports = router;
