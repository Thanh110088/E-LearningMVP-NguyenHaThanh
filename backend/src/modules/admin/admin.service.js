const adminRepository = require("./admin.repository");
const auditService = require("../audit/audit.service");

class AdminService {
  async getDashboardStats() {
    // TODO: Viết logic gọi Repository để lấy thống kê tổng quan ở đây
  }

  async getUsers(query) {
    // TODO: Viết logic xử lý query (search, role) và gọi Repository để lấy danh sách người dùng
  }

  async updateUserRole(id, role, adminId) {
    // TODO: Viết logic kiểm tra tính hợp lệ của role, gọi Repository để cập nhật và dùng auditService để ghi log
  }

  async toggleUserStatus(id, adminId) {
    // TODO: Viết logic gọi Repository để khóa/mở khóa tài khoản và dùng auditService để ghi log
  }

  async getTeachers() {
    // TODO: Viết logic gọi Repository để lấy danh sách giảng viên
  }

  async updateTeacherPlan(id, plan, adminId) {
    // TODO: Viết logic kiểm tra tính hợp lệ của plan, gọi Repository để cập nhật và dùng auditService để ghi log
  }

  async getRevenueStats() {
    // TODO: Viết logic gọi Repository để lấy thống kê doanh thu
  }
}

module.exports = new AdminService();
