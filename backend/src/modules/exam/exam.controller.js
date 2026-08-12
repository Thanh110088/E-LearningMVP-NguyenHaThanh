const examService = require('./exam.service');
const { sendSuccess } = require('../../utils/response.util');

class ExamController {
  async getExams(req, res, next) {
    try {
      const { search, subjectId, gradeId, status } = req.query;
      const exams = await examService.getAllExams({ search, subjectId, gradeId, status });
      return sendSuccess(res, 'Lấy danh sách đề thi thành công', exams);
    } catch (error) {
      next(error);
    }
  }

  async getMyExams(req, res, next) {
    try {
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
    } catch (error) {
      next(error);
    }
  }

  async getExamById(req, res, next) {
    try {
      const exam = await examService.getExamById(req.params.id);
      return sendSuccess(res, 'Lấy thông tin đề thi thành công', exam);
    } catch (error) {
      next(error);
    }
  }

  async createExam(req, res, next) {
    try {
      const workspaceId = req.headers['x-workspace-id'] || req.body.workspaceId;
      const examData = { ...req.body };
      if (workspaceId) examData.workspaceId = workspaceId;
      const exam = await examService.createExam(examData, req.user.id);
      return sendSuccess(res, 'Tạo đề thi thành công', exam, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateExam(req, res, next) {
    try {
      const exam = await examService.updateExam(req.params.id, req.body, req.user);
      return sendSuccess(res, 'Cập nhật đề thi thành công', exam);
    } catch (error) {
      next(error);
    }
  }

  async deleteExam(req, res, next) {
    try {
      await examService.deleteExam(req.params.id, req.user);
      return sendSuccess(res, 'Xóa đề thi thành công');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ExamController();
