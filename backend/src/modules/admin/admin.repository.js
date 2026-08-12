const prisma = require("../../config/prisma");

class AdminRepository {
  async getDashboardStats() {
    const [
      totalUsers,
      totalTeachers,
      totalWorkspaces,
      totalSubmissions,
      recentActivity,
      topWorkspaces,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "TEACHER" } }),
      prisma.workspace.count(),
      prisma.submission.count(),
      prisma.submission.findMany({
        orderBy: { startedAt: "desc" },
        take: 10,
        select: {
          id: true,
          score: true,
          status: true,
          startedAt: true,
          user: { select: { id: true, fullName: true, email: true } },
          exam: { select: { id: true, title: true } },
        },
      }),
      prisma.user.findMany({
        where: { role: "TEACHER" },
        select: {
          id: true,
          fullName: true,
          email: true,
          plan: true,
          _count: {
            select: { createdExams: true },
          },
        },
        orderBy: {
          createdExams: { _count: "desc" },
        },
        take: 5,
      }),
    ]);

    return {
      totalUsers,
      totalTeachers,
      totalWorkspaces,
      totalSubmissions,
      recentActivity,
      topWorkspaces,
    };
  }

  async findUsers({ search, role } = {}) {
    const where = {};
    if (role && role !== "ALL") {
      where.role = role;
    }
    if (search && search.trim() !== "") {
      const term = search.trim();
      where.OR = [
        { fullName: { contains: term, mode: "insensitive" } },
        { email: { contains: term, mode: "insensitive" } },
      ];
    }
    return prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        plan: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateUserRole(id, role) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      const error = new Error("Không tìm thấy người dùng");
      error.statusCode = 404;
      throw error;
    }
    return prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        plan: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  async toggleUserStatus(id) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      const error = new Error("Không tìm thấy người dùng");
      error.statusCode = 404;
      throw error;
    }
    return prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        plan: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  async findTeachers() {
    return prisma.user.findMany({
      where: { role: "TEACHER" },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        plan: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { createdExams: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateTeacherPlan(id, plan) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      const error = new Error("Không tìm thấy người dùng");
      error.statusCode = 404;
      throw error;
    }
    return prisma.user.update({
      where: { id },
      data: { plan },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        plan: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  async getRevenueStats() {
    const [freeUsers, proUsers, enterpriseUsers] = await Promise.all([
      prisma.user.count({ where: { plan: "FREE" } }),
      prisma.user.count({ where: { plan: "PRO" } }),
      prisma.user.count({ where: { plan: "ENTERPRISE" } }),
    ]);

    const proPrice = 99000;
    const enterprisePrice = 299000;
    const estimatedMRR = proUsers * proPrice + enterpriseUsers * enterprisePrice;

    return {
      freeUsers,
      proUsers,
      enterpriseUsers,
      estimatedMRR,
    };
  }
}

module.exports = new AdminRepository();
