const express = require('express');
const catalogController = require('./catalog.controller');

const router = express.Router();

router.get('/exams', catalogController.getCatalog);
router.get('/exams/:id', catalogController.getExamDetail);

module.exports = router;
