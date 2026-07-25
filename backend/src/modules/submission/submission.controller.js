const submissionService = require('./submission.service');
const { sendSuccess } = require('../../utils/response.util');

class SubmissionController {
  async startExam(req, res, next) {
    try {
      const examId = req.params.examId;
      const submission = await submissionService.startExam(examId, req.user.id);
      return sendSuccess(res, 'Bắt đầu bài thi thành công', submission);
    } catch (error) {
      next(error);
    }
  }

  async submitExam(req, res, next) {
    try {
      const submissionId = req.params.id;
      const { answers } = req.body;
      const result = await submissionService.submitExam(submissionId, answers, req.user.id);
      return sendSuccess(res, 'Nộp bài thi thành công', result);
    } catch (error) {
      next(error);
    }
  }

  async getResult(req, res, next) {
    try {
      const submissionId = req.params.id;
      const result = await submissionService.getSubmissionResult(submissionId, req.user);
      return sendSuccess(res, 'Lấy kết quả bài thi thành công', result);
    } catch (error) {
      next(error);
    }
  }

  async getMySubmissions(req, res, next) {
    try {
      const history = await submissionService.getMySubmissions(req.user.id);
      return sendSuccess(res, 'Lấy lịch sử làm bài thành công', history);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SubmissionController();
