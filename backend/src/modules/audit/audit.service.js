const prisma = require("../../config/prisma");

class AuditService {
  async logAction({ userId, action, resource, details, ipAddress, userAgent }) {
    try {
      return await prisma.auditLog.create({
        data: {
          userId: userId || null,
          action,
          resource,
          details: details ? (typeof details === 'string' ? details : JSON.stringify(details)) : null,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
        },
      });
    } catch (err) {
      console.error('Lỗi khi ghi AuditLog:', err.message);
    }
  }

  async getLogs() {
    return prisma.auditLog.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { fullName: true, email: true, role: true } },
      },
    });
  }
}

module.exports = new AuditService();
