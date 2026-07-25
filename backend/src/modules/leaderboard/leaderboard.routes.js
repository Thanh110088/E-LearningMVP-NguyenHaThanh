const express = require('express');
const leaderboardController = require('./leaderboard.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get('/', authenticate, leaderboardController.getLeaderboard);

module.exports = router;
