const adminService = require("./admin.service");
const { sendSuccess } = require("../../utils/response.util");

class AdminController {
  async getDashboardStats(req, res, next) {
    try {
      const stats = await adminService.getDashboardStats();
      return sendSuccess(res, "Lấy thống kê admin thành công", stats);
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req, res, next) {
    try {
      const users = await adminService.getUsers(req.query);
      return sendSuccess(res, "Lấy danh sách người dùng thành công", users);
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const adminId = req.user?.id;
      const updatedUser = await adminService.updateUserRole(id, role, adminId);
      return sendSuccess(res, "Cập nhật vai trò người dùng thành công", updatedUser);
    } catch (error) {
      next(error);
    }
  }

  async toggleUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const adminId = req.user?.id;
      const updatedUser = await adminService.toggleUserStatus(id, adminId);
      return sendSuccess(res, "Cập nhật trạng thái tài khoản thành công", updatedUser);
    } catch (error) {
      next(error);
    }
  }

  async getTeachers(req, res, next) {
    try {
      const teachers = await adminService.getTeachers();
      return sendSuccess(res, "Lấy danh sách giảng viên thành công", teachers);
    } catch (error) {
      next(error);
    }
  }

  async updateTeacherPlan(req, res, next) {
    try {
      const { id } = req.params;
      const { plan } = req.body;
      const adminId = req.user?.id;
      const updatedTeacher = await adminService.updateTeacherPlan(id, plan, adminId);
      return sendSuccess(res, "Cập nhật gói dịch vụ thành công", updatedTeacher);
    } catch (error) {
      next(error);
    }
  }

  async getRevenueStats(req, res, next) {
    try {
      const revenue = await adminService.getRevenueStats();
      return sendSuccess(res, "Lấy báo cáo doanh thu thành công", revenue);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
