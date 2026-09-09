const express = require('express');
const categoryController = require('./category.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const validBodyRequest = require('../../middlewares/validBodyRequest');
const {
  subjectSchema,
  updateSubjectSchema,
  gradeSchema,
  updateGradeSchema,
} = require('./category.schema');

const router = express.Router();

router.get('/subjects', categoryController.getSubjects);
router.post('/subjects', authenticate, authorize('ADMIN'), validBodyRequest(subjectSchema), categoryController.createSubject);
router.put('/subjects/:id', authenticate, authorize('ADMIN'), validBodyRequest(updateSubjectSchema), categoryController.updateSubject);
router.delete('/subjects/:id', authenticate, authorize('ADMIN'), categoryController.deleteSubject);

router.get('/grades', categoryController.getGrades);
router.post('/grades', authenticate, authorize('ADMIN'), validBodyRequest(gradeSchema), categoryController.createGrade);
router.put('/grades/:id', authenticate, authorize('ADMIN'), validBodyRequest(updateGradeSchema), categoryController.updateGrade);
router.delete('/grades/:id', authenticate, authorize('ADMIN'), categoryController.deleteGrade);

module.exports = router;
