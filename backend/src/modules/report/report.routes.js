const express = require('express');
const reportController = require('./report.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get('/', authenticate, authorize('TEACHER', 'ADMIN'), reportController.getReports);
router.get('/export', authenticate, authorize('TEACHER', 'ADMIN'), reportController.exportCSV);

module.exports = router;
