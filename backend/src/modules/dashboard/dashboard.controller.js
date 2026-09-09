const { wrapController } = require('../../utils/handleAsync');
const dashboardService = require('./dashboard.service');
const { sendSuccess } = require('../../utils/response.util');

class DashboardController {
  async getStats(req, res) {
    const stats = await dashboardService.getStats();
    return sendSuccess(res, 'Lấy dữ liệu thống kê Dashboard thành công', stats);
  }
}

module.exports = wrapController(new DashboardController());
