const express = require('express');
const submissionController = require('./submission.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.post('/start/:examId', authenticate, submissionController.startExam);
router.post('/:id/submit', authenticate, submissionController.submitExam);
router.get('/:id/result', authenticate, submissionController.getResult);
router.get('/my-history', authenticate, submissionController.getMySubmissions);

module.exports = router;
