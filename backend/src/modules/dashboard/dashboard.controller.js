const dashboardService = require('./dashboard.service');
const { sendSuccess } = require('../../utils/response.util');

class DashboardController {
  async getStats(req, res, next) {
    try {
      const stats = await dashboardService.getStats();
      return sendSuccess(res, 'Lấy dữ liệu thống kê Dashboard thành công', stats);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
