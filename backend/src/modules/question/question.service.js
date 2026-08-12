const questionRepository = require('./question.repository');
const auditService = require('../audit/audit.service');

class QuestionService {
  async getAllQuestions(filters) {
    return questionRepository.findAll(filters);
  }

  async getQuestionById(id) {
    const question = await questionRepository.findById(id);
    if (!question) {
      const error = new Error('Không tìm thấy câu hỏi');
      error.statusCode = 404;
      throw error;
    }
    return question;
  }

  async createQuestion(data, userId) {
    if (!data.content || !data.content.trim()) {
      const error = new Error('Nội dung câu hỏi không được để trống');
      error.statusCode = 400;
      throw error;
    }

    if (!data.options || !Array.isArray(data.options) || data.options.length < 2) {
      const error = new Error('Câu hỏi phải có ít nhất 2 lựa chọn (đáp án)');
      error.statusCode = 400;
      throw error;
    }

    const hasCorrectOption = data.options.some(opt => opt.isCorrect);
    if (!hasCorrectOption) {
      const error = new Error('Phải chọn ít nhất 1 đáp án đúng cho câu hỏi');
      error.statusCode = 400;
      throw error;
    }

    const payload = { ...data };
    if (!payload.subjectId) delete payload.subjectId;
    if (!payload.examId) delete payload.examId;
    if (!payload.workspaceId) delete payload.workspaceId;

    const newQuestion = await questionRepository.create(payload);

    auditService.logAction({
      userId: userId || null,
      action: 'CREATE_QUESTION',
      resource: 'Question',
      details: { questionId: newQuestion.id, type: newQuestion.type, subjectId: newQuestion.subjectId },
    });

    return newQuestion;
  }

  async updateQuestion(id, data, userId) {
    await this.getQuestionById(id);

    if (data.options) {
      if (!Array.isArray(data.options) || data.options.length < 2) {
        const error = new Error('Câu hỏi phải có ít nhất 2 lựa chọn (đáp án)');
        error.statusCode = 400;
        throw error;
      }
      const hasCorrectOption = data.options.some(opt => opt.isCorrect);
      if (!hasCorrectOption) {
        const error = new Error('Phải chọn ít nhất 1 đáp án đúng cho câu hỏi');
        error.statusCode = 400;
        throw error;
      }
    }

    const updated = await questionRepository.update(id, data);

    auditService.logAction({
      userId: userId || null,
      action: 'UPDATE_QUESTION',
      resource: 'Question',
      details: { questionId: id },
    });

    return updated;
  }

  async deleteQuestion(id, userId) {
    await this.getQuestionById(id);
    const deleted = await questionRepository.delete(id);

    auditService.logAction({
      userId: userId || null,
      action: 'DELETE_QUESTION',
      resource: 'Question',
      details: { questionId: id },
    });

    return deleted;
  }
}

module.exports = new QuestionService();
