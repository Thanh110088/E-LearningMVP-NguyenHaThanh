const { wrapController } = require('../../utils/handleAsync');
const subscriptionService = require('./subscription.service');
const { sendSuccess } = require('../../utils/response.util');

class SubscriptionController {
  async getMyPlan(req, res) {
    const planData = await subscriptionService.getMyPlan(req.user.id);
    return sendSuccess(res, 'Lấy thông tin gói cước thành công', planData);
  }

  async upgradePlan(req, res) {
    const { plan, paymentMethod } = req.body;
    const result = await subscriptionService.upgradePlan(req.user.id, { plan, paymentMethod });
    return sendSuccess(res, `Nâng cấp thành công lên gói ${plan}`, result);
  }

  async getHistory(req, res) {
    const history = await subscriptionService.getHistory(req.user.id);
    return sendSuccess(res, 'Lấy lịch sử giao dịch thành công', history);
  }
}

module.exports = wrapController(new SubscriptionController());
