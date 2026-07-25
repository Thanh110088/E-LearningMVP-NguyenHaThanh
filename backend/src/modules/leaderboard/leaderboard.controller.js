const leaderboardService = require('./leaderboard.service');
const { sendSuccess } = require('../../utils/response.util');

class LeaderboardController {
  async getLeaderboard(req, res, next) {
    try {
      const leaderboard = await leaderboardService.getTopStudents();
      return sendSuccess(res, 'Lấy bảng xếp hạng thành công', leaderboard);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LeaderboardController();
