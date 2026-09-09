const { wrapController } = require('../../utils/handleAsync');
const submissionService = require('./submission.service');
const { sendSuccess } = require('../../utils/response.util');

class SubmissionController {
  async startExam(req, res) {
    const examId = req.params.examId;
    const password = req.body.password || req.headers['x-exam-password'];
    const submission = await submissionService.startExam(examId, req.user.id, password);
    return sendSuccess(res, 'Bắt đầu bài thi thành công', submission);
  }

  async saveProgress(req, res) {
    const submissionId = req.params.id;
    const { answers, tabSwitchCount, violations } = req.body;
    const result = await submissionService.saveProgress(
      submissionId,
      answers,
      req.user.id,
      tabSwitchCount,
      violations
    );
    return sendSuccess(res, 'Lưu tiến độ bài thi thành công', result);
  }

  async submitExam(req, res) {
    const submissionId = req.params.id;
    const { answers, tabSwitchCount, violations } = req.body;
    const result = await submissionService.submitExam(
      submissionId,
      answers,
      req.user.id,
      tabSwitchCount,
      violations
    );
    return sendSuccess(res, 'Nộp bài thi thành công', result);
  }

  async getResult(req, res) {
    const submissionId = req.params.id;
    const result = await submissionService.getSubmissionResult(submissionId, req.user);
    return sendSuccess(res, 'Lấy kết quả bài thi thành công', result);
  }

  async getMySubmissions(req, res) {
    const history = await submissionService.getMySubmissions(req.user.id);
    return sendSuccess(res, 'Lấy lịch sử làm bài thành công', history);
  }

  async getLiveSubmissions(req, res) {
    const { examId } = req.params;
    const data = await submissionService.getLiveSubmissions(examId, req.user);
    return sendSuccess(res, 'Lấy danh sách thí sinh đang thi thành công', data);
  }
}

module.exports = wrapController(new SubmissionController());
