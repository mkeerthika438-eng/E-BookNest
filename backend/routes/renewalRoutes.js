const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/renewalController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.post('/', authenticate, ctrl.createRenewal);
router.get('/my', authenticate, ctrl.getMyRenewals);
router.get('/', authenticate, requireAdmin, ctrl.getAllRenewals);

module.exports = router;
