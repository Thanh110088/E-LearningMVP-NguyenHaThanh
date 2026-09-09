const { wrapController } = require('../../utils/handleAsync');
const adminService = require('./admin.service');
const { sendSuccess } = require('../../utils/response.util');

class AdminController {
  async getDashboardStats(req, res) {
    const stats = await adminService.getDashboardStats();
    return sendSuccess(res, 'Lấy thống kê admin thành công', stats);
  }

  async getUsers(req, res) {
    const users = await adminService.getUsers(req.query);
    return sendSuccess(res, 'Lấy danh sách người dùng thành công', users);
  }

  async updateUserRole(req, res) {
    const { id } = req.params;
    const { role } = req.body;
    const updatedUser = await adminService.updateUserRole(id, role, req.user?.id);
    return sendSuccess(res, 'Cập nhật vai trò người dùng thành công', updatedUser);
  }

  async toggleUserStatus(req, res) {
    const { id } = req.params;
    const updatedUser = await adminService.toggleUserStatus(id, req.user?.id);
    return sendSuccess(res, 'Cập nhật trạng thái tài khoản thành công', updatedUser);
  }

  async getTeachers(req, res) {
    const teachers = await adminService.getTeachers();
    return sendSuccess(res, 'Lấy danh sách giảng viên thành công', teachers);
  }

  async updateTeacherPlan(req, res) {
    const { id } = req.params;
    const { plan } = req.body;
    const updatedTeacher = await adminService.updateTeacherPlan(id, plan, req.user?.id);
    return sendSuccess(res, 'Cập nhật gói dịch vụ thành công', updatedTeacher);
  }

  async getRevenueStats(req, res) {
    const revenue = await adminService.getRevenueStats();
    return sendSuccess(res, 'Lấy báo cáo doanh thu thành công', revenue);
  }
}

module.exports = wrapController(new AdminController());
