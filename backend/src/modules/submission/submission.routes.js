const express = require('express');
const submissionController = require('./submission.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const validBodyRequest = require('../../middlewares/validBodyRequest');
const { startExamSchema, answersSchema } = require('./submission.schema');

const router = express.Router();

router.get('/my-history', authenticate, submissionController.getMySubmissions);
router.get('/exam/:examId/live', authenticate, submissionController.getLiveSubmissions);

router.post('/start/:examId', authenticate, validBodyRequest(startExamSchema), submissionController.startExam);
router.post('/:id/progress', authenticate, validBodyRequest(answersSchema), submissionController.saveProgress);
router.post('/:id/submit', authenticate, validBodyRequest(answersSchema), submissionController.submitExam);
router.get('/:id/result', authenticate, submissionController.getResult);

module.exports = router;
