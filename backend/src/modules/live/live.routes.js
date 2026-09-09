const express = require('express');
const liveController = require('./live.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const validBodyRequest = require('../../middlewares/validBodyRequest');
const { joinLiveSchema } = require('./live.schema');

const router = express.Router();

router.post('/join', authenticate, validBodyRequest(joinLiveSchema), liveController.joinRoom);

module.exports = router;
