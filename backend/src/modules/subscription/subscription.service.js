const subscriptionRepository = require('./subscription.repository');
const auditService = require('../audit/audit.service');

const PLAN_LIMITS = {
  FREE: {
    maxExams: 10,
    maxQuestions: 200,
    maxWorkspaces: 1,
    maxLiveStudents: 30,
    importWord: true,
    exportExcel: true,
    advancedReports: false,
    watermark: true,
  },
  PRO: {
    maxExams: 100,
    maxQuestions: 5000,
    maxWorkspaces: 5,
    maxLiveStudents: 100,
    importWord: true,
    exportExcel: true,
    advancedReports: true,
    watermark: false,
  },
  ENTERPRISE: {
    maxExams: 999999,
    maxQuestions: 999999,
    maxWorkspaces: 999999,
    maxLiveStudents: 500,
    importWord: true,
    exportExcel: true,
    advancedReports: true,
    watermark: false,
  },
};

class SubscriptionService {
  async getMyPlan(userId) {
    const user = await subscriptionRepository.findUserSubscription(userId);
    if (!user) {
      const error = new Error('Không tìm thấy thông tin người dùng');
      error.statusCode = 404;
      throw error;
    }

    const currentPlan = user.plan || 'FREE';
    const limits = PLAN_LIMITS[currentPlan] || PLAN_LIMITS.FREE;

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        plan: currentPlan,
        planExpiresAt: user.planExpiresAt,
      },
      limits,
      usage: {
        examsCount: user._count?.createdExams || 0,
      },
      recentSubscriptions: user.subscriptions || [],
    };
  }

  async upgradePlan(userId, { plan, paymentMethod = 'QR_BANKING' }) {
    if (!['PRO', 'ENTERPRISE'].includes(plan)) {
      const error = new Error('Gói cước không hợp lệ');
      error.statusCode = 400;
      throw error;
    }

    let amount = 0;
    if (plan === 'PRO') amount = 99000;
    if (plan === 'ENTERPRISE') amount = 499000;

    // Plan valid for 30 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const [newSubscription, updatedUser] = await subscriptionRepository.createSubscription({
      userId,
      plan,
      amount,
      paymentMethod,
      expiresAt,
    });

    auditService.logAction({
      userId,
      action: 'UPGRADE_PLAN',
      resource: 'Subscription',
      details: { plan, amount, paymentMethod },
    });

    return {
      subscription: newSubscription,
      user: {
        id: updatedUser.id,
        plan: updatedUser.plan,
        planExpiresAt: updatedUser.planExpiresAt,
      },
    };
  }

  async getHistory(userId) {
    return subscriptionRepository.findHistory(userId);
  }
}

module.exports = new SubscriptionService();
