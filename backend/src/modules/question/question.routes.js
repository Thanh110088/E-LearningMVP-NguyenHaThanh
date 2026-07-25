const express = require('express');
const questionController = require('./question.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Get questions filterable by subjectId, examId, difficulty, type
router.get('/', authenticate, questionController.getQuestions);
router.get('/:id', authenticate, questionController.getQuestionById);

// Question Management (TEACHER & ADMIN)
router.post('/', authenticate, authorize('TEACHER', 'ADMIN'), questionController.createQuestion);
router.put('/:id', authenticate, authorize('TEACHER', 'ADMIN'), questionController.updateQuestion);
router.delete('/:id', authenticate, authorize('TEACHER', 'ADMIN'), questionController.deleteQuestion);

module.exports = router;
