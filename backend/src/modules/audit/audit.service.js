const prisma = require('../../config/prisma');

class AuditService {
  async logAction({ userId, action, resource, details, ipAddress, userAgent }) {
    return prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        resource,
        details: details ? JSON.stringify(details) : null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });
  }

  async getLogs() {
    return prisma.auditLog.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true, email: true, role: true } },
      },
    });
  }
}

module.exports = new AuditService();
