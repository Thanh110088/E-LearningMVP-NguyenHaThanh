const subscriptionService = require('./subscription.service');
const { sendSuccess } = require('../../utils/response.util');

class SubscriptionController {
  async getMyPlan(req, res, next) {
    try {
      const planData = await subscriptionService.getMyPlan(req.user.id);
      return sendSuccess(res, 'Lấy thông tin gói cước thành công', planData);
    } catch (error) {
      next(error);
    }
  }

  async upgradePlan(req, res, next) {
    try {
      const { plan, paymentMethod } = req.body;
      const result = await subscriptionService.upgradePlan(req.user.id, { plan, paymentMethod });
      return sendSuccess(res, `Nâng cấp thành công lên gói ${plan}`, result);
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req, res, next) {
    try {
      const history = await subscriptionService.getHistory(req.user.id);
      return sendSuccess(res, 'Lấy lịch sử giao dịch thành công', history);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SubscriptionController();
