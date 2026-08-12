const express = require('express');
const subscriptionController = require('./subscription.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get('/my-plan', authenticate, subscriptionController.getMyPlan);
router.post('/upgrade', authenticate, subscriptionController.upgradePlan);
router.get('/history', authenticate, subscriptionController.getHistory);

module.exports = router;
