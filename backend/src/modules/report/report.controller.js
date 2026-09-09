const { wrapController } = require('../../utils/handleAsync');
const reportService = require('./report.service');
const { sendSuccess } = require('../../utils/response.util');

class ReportController {
  async getReports(req, res) {
    const reports = await reportService.getSubmissionReports();
    return sendSuccess(res, 'Lấy báo cáo kết quả làm bài thành công', reports);
  }

  async exportCSV(req, res) {
    const csv = await reportService.exportSubmissionsCSV();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="elearning-submissions-report.csv"');
    return res.status(200).send(csv);
  }
}

module.exports = wrapController(new ReportController());
