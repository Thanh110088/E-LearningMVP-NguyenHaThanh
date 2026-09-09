const express = require('express');
const questionController = require('./question.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const validBodyRequest = require('../../middlewares/validBodyRequest');
const { questionSchema, updateQuestionSchema } = require('./question.schema');

const router = express.Router();

router.get('/', authenticate, questionController.getQuestions);
router.get('/:id', authenticate, questionController.getQuestionById);

router.post('/', authenticate, authorize('TEACHER', 'ADMIN'), validBodyRequest(questionSchema), questionController.createQuestion);
router.put('/:id', authenticate, authorize('TEACHER', 'ADMIN'), validBodyRequest(updateQuestionSchema), questionController.updateQuestion);
router.delete('/:id', authenticate, authorize('TEACHER', 'ADMIN'), questionController.deleteQuestion);

module.exports = router;
