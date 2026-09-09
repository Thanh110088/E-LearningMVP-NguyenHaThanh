const { wrapController } = require('../../utils/handleAsync');
const workspaceService = require('./workspace.service');
const { sendSuccess } = require('../../utils/response.util');

class WorkspaceController {
  async getMyWorkspaces(req, res) {
    const result = await workspaceService.getMyWorkspaces(req.user.id, req.user.plan);
    return sendSuccess(res, 'Lấy danh sách Workspace thành công', result);
  }

  async createWorkspace(req, res) {
    const newWs = await workspaceService.createWorkspace(req.user.id, req.user.plan, req.body);
    return sendSuccess(res, 'Tạo Workspace thành công', newWs, 201);
  }

  async updateWorkspace(req, res) {
    const updated = await workspaceService.updateWorkspace(req.user.id, req.params.id, req.body);
    return sendSuccess(res, 'Cập nhật Workspace thành công', updated);
  }

  async deleteWorkspace(req, res) {
    const result = await workspaceService.deleteWorkspace(req.user.id, req.params.id);
    return sendSuccess(res, 'Xóa Workspace thành công', result);
  }
}

module.exports = wrapController(new WorkspaceController());
