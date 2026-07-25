const express = require('express');
const examController = require('./exam.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Public / Authenticated catalog endpoints
router.get('/', authenticate, examController.getExams);
router.get('/my-exams', authenticate, authorize('TEACHER', 'ADMIN'), examController.getMyExams);
router.get('/:id', authenticate, examController.getExamById);

// Management endpoints (TEACHER & ADMIN)
router.post('/', authenticate, authorize('TEACHER', 'ADMIN'), examController.createExam);
router.put('/:id', authenticate, authorize('TEACHER', 'ADMIN'), examController.updateExam);
router.delete('/:id', authenticate, authorize('TEACHER', 'ADMIN'), examController.deleteExam);

module.exports = router;
