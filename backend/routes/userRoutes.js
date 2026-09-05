const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', authenticate, requireAdmin, ctrl.getAllUsers);
router.post('/run-reminders', authenticate, requireAdmin, ctrl.runRemindersNow);

module.exports = router;
