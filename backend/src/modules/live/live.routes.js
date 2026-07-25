const express = require('express');
const liveController = require('./live.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.post('/join', authenticate, liveController.joinRoom);

module.exports = router;
