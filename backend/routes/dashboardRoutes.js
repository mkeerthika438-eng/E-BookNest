const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboardController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/user', authenticate, ctrl.userDashboard);
router.get('/admin', authenticate, requireAdmin, ctrl.adminDashboard);

module.exports = router;
