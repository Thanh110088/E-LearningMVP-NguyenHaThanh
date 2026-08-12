const adminRepository = require("./admin.repository");
const auditService = require("../audit/audit.service");

class AdminService {
  async getDashboardStats() {
    return await adminRepository.getDashboardStats();
  }

  async getUsers(query = {}) {
    return await adminRepository.findUsers(query);
  }

  async updateUserRole(id, role, adminId) {
    const validRoles = ["ADMIN", "TEACHER", "STUDENT"];
    if (!role || !validRoles.includes(role)) {
      const error = new Error("Vai trò không hợp lệ. Cho phép: ADMIN, TEACHER, STUDENT");
      error.statusCode = 400;
      throw error;
    }

    const updatedUser = await adminRepository.updateUserRole(id, role);

    if (adminId) {
      await auditService.logAction({
        userId: adminId,
        action: "UPDATE_USER_ROLE",
        resource: "USER",
        details: { targetUserId: id, newRole: role },
      });
    }

    return updatedUser;
  }

  async toggleUserStatus(id, adminId) {
    if (adminId && adminId === id) {
      const error = new Error("Bạn không thể tự khóa tài khoản của chính mình");
      error.statusCode = 400;
      throw error;
    }

    const updatedUser = await adminRepository.toggleUserStatus(id);

    if (adminId) {
      await auditService.logAction({
        userId: adminId,
        action: "TOGGLE_USER_STATUS",
        resource: "USER",
        details: { targetUserId: id, isActive: updatedUser.isActive },
      });
    }

    return updatedUser;
  }

  async getTeachers() {
    return await adminRepository.findTeachers();
  }

  async updateTeacherPlan(id, plan, adminId) {
    const validPlans = ["FREE", "PRO", "ENTERPRISE"];
    if (!plan || !validPlans.includes(plan)) {
      const error = new Error("Gói dịch vụ không hợp lệ. Cho phép: FREE, PRO, ENTERPRISE");
      error.statusCode = 400;
      throw error;
    }

    const updatedUser = await adminRepository.updateTeacherPlan(id, plan);

    if (adminId) {
      await auditService.logAction({
        userId: adminId,
        action: "UPDATE_TEACHER_PLAN",
        resource: "USER",
        details: { targetUserId: id, newPlan: plan },
      });
    }

    return updatedUser;
  }

  async getRevenueStats() {
    return await adminRepository.getRevenueStats();
  }
}

module.exports = new AdminService();
