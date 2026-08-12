const questionService = require('./question.service');
const { sendSuccess } = require('../../utils/response.util');

class QuestionController {
  async getQuestions(req, res, next) {
    try {
      const { subjectId, examId, difficulty, type } = req.query;
      const workspaceId = req.headers['x-workspace-id'] || req.query.workspaceId;
      const questions = await questionService.getAllQuestions({ subjectId, examId, difficulty, type, workspaceId });
      return sendSuccess(res, 'Lấy danh sách câu hỏi thành công', questions);
    } catch (error) {
      next(error);
    }
  }

  async getQuestionById(req, res, next) {
    try {
      const question = await questionService.getQuestionById(req.params.id);
      return sendSuccess(res, 'Lấy thông tin câu hỏi thành công', question);
    } catch (error) {
      next(error);
    }
  }

  async createQuestion(req, res, next) {
    try {
      const workspaceId = req.headers['x-workspace-id'] || req.body.workspaceId;
      const questionData = { ...req.body };
      if (workspaceId) questionData.workspaceId = workspaceId;
      const question = await questionService.createQuestion(questionData, req.user?.id);
      return sendSuccess(res, 'Tạo câu hỏi thành công', question, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateQuestion(req, res, next) {
    try {
      const question = await questionService.updateQuestion(req.params.id, req.body);
      return sendSuccess(res, 'Cập nhật câu hỏi thành công', question);
    } catch (error) {
      next(error);
    }
  }

  async deleteQuestion(req, res, next) {
    try {
      await questionService.deleteQuestion(req.params.id);
      return sendSuccess(res, 'Xóa câu hỏi thành công');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new QuestionController();
