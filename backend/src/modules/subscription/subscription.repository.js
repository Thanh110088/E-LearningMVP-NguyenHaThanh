const prisma = require('../../config/prisma');

class SubscriptionRepository {
  async findUserSubscription(userId) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        plan: true,
        planExpiresAt: true,
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            createdExams: true,
          },
        },
      },
    });
  }

  async createSubscription({ userId, plan, amount, paymentMethod, expiresAt }) {
    return prisma.$transaction([
      prisma.subscription.create({
        data: {
          userId,
          plan,
          amount,
          paymentMethod,
          status: 'ACTIVE',
          expiresAt,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          plan,
          planExpiresAt: expiresAt,
        },
      }),
    ]);
  }

  async findHistory(userId) {
    return prisma.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

module.exports = new SubscriptionRepository();
