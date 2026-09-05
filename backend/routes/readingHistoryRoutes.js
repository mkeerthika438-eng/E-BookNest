const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/readingHistoryController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, ctrl.getHistory);
router.post('/', authenticate, ctrl.updateProgress);

module.exports = router;
