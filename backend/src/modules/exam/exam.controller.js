/**
 * Mọi module (exam, question, workspace...) cùng khuôn với auth:
 * Controller mỏng + wrapController (không try/catch) → service → repository.
 * Chi tiết khái niệm: docs/09-giai-thich-code-auth.md
 */
const { wrapController } = require('../../utils/handleAsync');
const examService = require('./exam.service');
const { sendSuccess } = require('../../utils/response.util');

class ExamController {
  async getExams(req, res) {
    const { search, subjectId, gradeId, status } = req.query;
    const exams = await examService.getAllExams({ search, subjectId, gradeId, status });
    return sendSuccess(res, 'Lấy danh sách đề thi thành công', exams);
  }

  async getMyExams(req, res) {
    const { search, subjectId, gradeId, status } = req.query;
    const workspaceId = req.headers['x-workspace-id'];
    const exams = await examService.getAllExams({
      search,
      subjectId,
      gradeId,
      status,
      createdById: req.user.id,
      workspaceId,
    });
    return sendSuccess(res, 'Lấy danh sách đề thi của tôi thành công', exams);
  }

  async getExamById(req, res) {
    const exam = await examService.getExamById(req.params.id);
    return sendSuccess(res, 'Lấy thông tin đề thi thành công', exam);
  }

  async createExam(req, res) {
    const workspaceId = req.headers['x-workspace-id'] || req.body.workspaceId;
    const examData = { ...req.body };
    if (workspaceId) examData.workspaceId = workspaceId;
    const exam = await examService.createExam(examData, req.user.id);
    return sendSuccess(res, 'Tạo đề thi thành công', exam, 201);
  }

  async updateExam(req, res) {
    const exam = await examService.updateExam(req.params.id, req.body, req.user);
    return sendSuccess(res, 'Cập nhật đề thi thành công', exam);
  }

  async deleteExam(req, res) {
    await examService.deleteExam(req.params.id, req.user);
    return sendSuccess(res, 'Xóa đề thi thành công');
  }
}

module.exports = wrapController(new ExamController());
