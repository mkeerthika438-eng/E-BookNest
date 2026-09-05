const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/recommendationController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, ctrl.getRecommendations);

module.exports = router;
