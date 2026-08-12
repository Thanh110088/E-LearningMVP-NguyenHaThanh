const workspaceService = require('./workspace.service');
const { sendSuccess, sendError } = require('../../utils/response.util');

class WorkspaceController {
  async getMyWorkspaces(req, res, next) {
    try {
      const result = await workspaceService.getMyWorkspaces(req.user.id, req.user.plan);
      return sendSuccess(res, 'Lấy danh sách Workspace thành công', result);
    } catch (err) {
      next(err);
    }
  }

  async createWorkspace(req, res, next) {
    try {
      const newWs = await workspaceService.createWorkspace(
        req.user.id,
        req.user.plan,
        req.body
      );
      return sendSuccess(res, 'Tạo Workspace thành công', newWs, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateWorkspace(req, res, next) {
    try {
      const updated = await workspaceService.updateWorkspace(
        req.user.id,
        req.params.id,
        req.body
      );
      return sendSuccess(res, 'Cập nhật Workspace thành công', updated);
    } catch (err) {
      next(err);
    }
  }

  async deleteWorkspace(req, res, next) {
    try {
      const result = await workspaceService.deleteWorkspace(
        req.user.id,
        req.params.id
      );
      return sendSuccess(res, 'Xóa Workspace thành công', result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new WorkspaceController();
