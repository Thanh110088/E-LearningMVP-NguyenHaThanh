const adminService = require("./admin.service");
const { sendSuccess } = require("../../utils/response.util");

class AdminController {
  async getDashboardStats(req, res, next) {
    // TODO: Viết logic lấy thống kê tổng quan ở đây
  }

  async getUsers(req, res, next) {
    // TODO: Viết logic lấy danh sách người dùng ở đây
  }

  async updateUserRole(req, res, next) {
    // TODO: Viết logic cập nhật vai trò người dùng ở đây
  }

  async toggleUserStatus(req, res, next) {
    // TODO: Viết logic khóa/mở khóa tài khoản ở đây
  }

  async getTeachers(req, res, next) {
    // TODO: Viết logic lấy danh sách giảng viên ở đây
  }

  async updateTeacherPlan(req, res, next) {
    // TODO: Viết logic cập nhật gói dịch vụ của giảng viên ở đây
  }

  async getRevenueStats(req, res, next) {
    // TODO: Viết logic lấy báo cáo doanh thu ở đây
  }
}

module.exports = new AdminController();
