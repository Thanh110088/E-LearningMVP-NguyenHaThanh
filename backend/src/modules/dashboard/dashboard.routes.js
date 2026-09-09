const express = require('express');
const dashboardController = require('./dashboard.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get('/stats', authenticate, authorize('TEACHER', 'ADMIN'), dashboardController.getStats);
router.get('/summary', authenticate, authorize('TEACHER', 'ADMIN'), dashboardController.getStats);

module.exports = router;
