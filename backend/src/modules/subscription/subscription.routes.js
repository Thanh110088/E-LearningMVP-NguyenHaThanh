const express = require('express');
const subscriptionController = require('./subscription.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const validBodyRequest = require('../../middlewares/validBodyRequest');
const { upgradePlanSchema } = require('./subscription.schema');

const router = express.Router();

router.get('/my-plan', authenticate, subscriptionController.getMyPlan);
router.post('/upgrade', authenticate, validBodyRequest(upgradePlanSchema), subscriptionController.upgradePlan);
router.get('/history', authenticate, subscriptionController.getHistory);

module.exports = router;
