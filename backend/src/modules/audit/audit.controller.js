const { wrapController } = require('../../utils/handleAsync');
const auditService = require('./audit.service');
const { sendSuccess } = require('../../utils/response.util');

class AuditController {
  async getLogs(req, res) {
    const logs = await auditService.getLogs();
    return sendSuccess(res, 'Lấy danh sách Audit Logs thành công', logs);
  }
}

module.exports = wrapController(new AuditController());
