const express = require('express');
const examController = require('./exam.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const validBodyRequest = require('../../middlewares/validBodyRequest');
const { examSchema, updateExamSchema } = require('./exam.schema');

const router = express.Router();

router.get('/', authenticate, examController.getExams);
router.get('/my-exams', authenticate, authorize('TEACHER', 'ADMIN'), examController.getMyExams);
router.get('/:id', authenticate, examController.getExamById);

router.post('/', authenticate, authorize('TEACHER', 'ADMIN'), validBodyRequest(examSchema), examController.createExam);
router.put('/:id', authenticate, authorize('TEACHER', 'ADMIN'), validBodyRequest(updateExamSchema), examController.updateExam);
router.delete('/:id', authenticate, authorize('TEACHER', 'ADMIN'), examController.deleteExam);

module.exports = router;
