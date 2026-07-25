const express = require('express');
const categoryController = require('./category.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Subjects
router.get('/subjects', categoryController.getSubjects);
router.post('/subjects', authenticate, authorize('ADMIN'), categoryController.createSubject);
router.put('/subjects/:id', authenticate, authorize('ADMIN'), categoryController.updateSubject);
router.delete('/subjects/:id', authenticate, authorize('ADMIN'), categoryController.deleteSubject);

// Grades
router.get('/grades', categoryController.getGrades);
router.post('/grades', authenticate, authorize('ADMIN'), categoryController.createGrade);
router.put('/grades/:id', authenticate, authorize('ADMIN'), categoryController.updateGrade);
router.delete('/grades/:id', authenticate, authorize('ADMIN'), categoryController.deleteGrade);

module.exports = router;
