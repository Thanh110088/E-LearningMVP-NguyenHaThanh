const reportService = require('./report.service');
const { sendSuccess } = require('../../utils/response.util');

class ReportController {
  async getReports(req, res, next) {
    try {
      const reports = await reportService.getSubmissionReports();
      return sendSuccess(res, 'Lấy báo cáo kết quả làm bài thành công', reports);
    } catch (error) {
      next(error);
    }
  }

  async exportCSV(req, res, next) {
    try {
      const csv = await reportService.exportSubmissionsCSV();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="elearning-submissions-report.csv"');
      return res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportController();
