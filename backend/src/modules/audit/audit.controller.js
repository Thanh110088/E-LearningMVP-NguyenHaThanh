const auditService = require('./audit.service');
const { sendSuccess } = require('../../utils/response.util');

class AuditController {
  async getLogs(req, res, next) {
    try {
      const logs = await auditService.getLogs();
      return sendSuccess(res, 'Lấy danh sách Audit Logs thành công', logs);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuditController();
