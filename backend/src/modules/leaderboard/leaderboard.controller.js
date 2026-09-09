const { wrapController } = require('../../utils/handleAsync');
const leaderboardService = require('./leaderboard.service');
const { sendSuccess } = require('../../utils/response.util');

class LeaderboardController {
  async getLeaderboard(req, res) {
    const leaderboard = await leaderboardService.getTopStudents();
    return sendSuccess(res, 'Lấy bảng xếp hạng thành công', leaderboard);
  }
}

module.exports = wrapController(new LeaderboardController());
