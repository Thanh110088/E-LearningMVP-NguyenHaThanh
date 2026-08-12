const workspaceRepository = require('./workspace.repository');
const subscriptionService = require('../subscription/subscription.service');
const auditService = require('../audit/audit.service');

const PLAN_MAX_WORKSPACES = {
  FREE: 1,
  PRO: 5,
  ENTERPRISE: 999999,
};

class WorkspaceService {
  async getMyWorkspaces(userId, userPlan = 'FREE') {
    let workspaces = await workspaceRepository.findByUserId(userId);
    
    // Auto-create a default workspace for teacher if none exists
    if (workspaces.length === 0) {
      const defaultWs = await workspaceRepository.create({
        name: 'Workspace Mặc Định',
        description: 'Không gian làm việc chính dành cho bài thi và câu hỏi',
        color: '#06b6d4',
        icon: 'FolderKanban',
        isDefault: true,
        userId,
      });
      workspaces = [
        {
          ...defaultWs,
          _count: { exams: 0, questions: 0 },
        },
      ];
    }

    const planKey = (userPlan || 'FREE').toUpperCase();
    const maxLimit = PLAN_MAX_WORKSPACES[planKey] || 1;

    return {
      workspaces,
      usage: {
        total: workspaces.length,
        max: maxLimit,
        canCreateMore: workspaces.length < maxLimit,
        plan: planKey,
      },
    };
  }

  async createWorkspace(userId, userPlan = 'FREE', { name, description, color, icon }) {
    if (!name || !name.trim()) {
      const error = new Error('Tên Workspace không được để trống');
      error.statusCode = 400;
      throw error;
    }

    const planKey = (userPlan || 'FREE').toUpperCase();
    const currentCount = await workspaceRepository.countByUserId(userId);
    const maxAllowed = PLAN_MAX_WORKSPACES[planKey] || 1;

    if (currentCount >= maxAllowed) {
      const error = new Error(
        `Gói ${planKey} của bạn chỉ cho phép tối đa ${maxAllowed} Workspace. Vui lòng nâng cấp gói PRO để sở hữu 5 Workspaces!`
      );
      error.statusCode = 403;
      error.code = 'LIMIT_EXCEEDED';
      throw error;
    }

    const newWorkspace = await workspaceRepository.create({
      name: name.trim(),
      description: description ? description.trim() : null,
      color: color || '#06b6d4',
      icon: icon || 'FolderKanban',
      isDefault: currentCount === 0,
      userId,
    });

    auditService.logAction({
      userId,
      action: 'CREATE_WORKSPACE',
      resource: 'Workspace',
      details: { workspaceId: newWorkspace.id, name: newWorkspace.name, plan: userPlan },
    });

    return newWorkspace;
  }

  async updateWorkspace(userId, workspaceId, { name, description, color, icon }) {
    const existing = await workspaceRepository.findById(workspaceId);
    if (!existing || existing.userId !== userId) {
      const error = new Error('Workspace không tồn tại hoặc bạn không có quyền sửa');
      error.statusCode = 404;
      throw error;
    }

    const updated = await workspaceRepository.update(workspaceId, {
      name: name ? name.trim() : existing.name,
      description: description !== undefined ? description : existing.description,
      color: color || existing.color,
      icon: icon || existing.icon,
    });

    auditService.logAction({
      userId,
      action: 'UPDATE_WORKSPACE',
      resource: 'Workspace',
      details: { workspaceId: updated.id, name: updated.name },
    });

    return updated;
  }

  async deleteWorkspace(userId, workspaceId) {
    const existing = await workspaceRepository.findById(workspaceId);
    if (!existing || existing.userId !== userId) {
      const error = new Error('Workspace không tồn tại hoặc bạn không có quyền xóa');
      error.statusCode = 404;
      throw error;
    }

    if (existing.isDefault) {
      const error = new Error('Không thể xóa Workspace mặc định chính');
      error.statusCode = 400;
      throw error;
    }

    const totalCount = await workspaceRepository.countByUserId(userId);
    if (totalCount <= 1) {
      const error = new Error('Bạn cần giữ ít nhất 1 Workspace');
      error.statusCode = 400;
      throw error;
    }

    await workspaceRepository.delete(workspaceId);

    auditService.logAction({
      userId,
      action: 'DELETE_WORKSPACE',
      resource: 'Workspace',
      details: { workspaceId, name: existing.name },
    });

    return { success: true, message: 'Đã xóa Workspace thành công' };
  }
}

module.exports = new WorkspaceService();
