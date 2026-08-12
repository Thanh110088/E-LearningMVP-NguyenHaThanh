const prisma = require("../../config/prisma");

class AdminRepository {
  async getDashboardStats() {
    // TODO: Viết logic lấy thống kê tổng quan ở đây
    const [
      totalUsers,
      totalTeachers,
      totalWorkspaces,
      totalSubmissions,
      recentActivity,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.teacher.count(),
      prisma.workspace.count(),
      prisma.submission.count(),
      prisma.activity.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);
    return {
      totalUsers,
      totalTeachers,
      totalWorkspaces,
      totalSubmissions,
      recentActivity,
    };
  }

  async findUsers({ search, role }) {
    // TODO: Viết logic tìm kiếm và lọc người dùng ở đây
  }

  async updateUserRole(id, role) {
    // TODO: Viết logic cập nhật vai trò người dùng ở đây
  }

  async toggleUserStatus(id) {
    // TODO: Viết logic khóa/mở khóa trạng thái tài khoản ở đây
  }

  async findTeachers() {
    // TODO: Viết logic lấy danh sách giảng viên ở đây
  }

  async updateTeacherPlan(id, plan) {
    // TODO: Viết logic cập nhật gói dịch vụ của giảng viên ở đây
  }

  async getRevenueStats() {
    // TODO: Viết logic thống kê doanh thu ở đây
  }
}

module.exports = new AdminRepository();
