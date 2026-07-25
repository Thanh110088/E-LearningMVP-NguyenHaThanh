const questionRepository = require('./question.repository');

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

  async createQuestion(data) {
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

    return questionRepository.create(data);
  }

  async updateQuestion(id, data) {
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

    return questionRepository.update(id, data);
  }

  async deleteQuestion(id) {
    await this.getQuestionById(id);
    return questionRepository.delete(id);
  }
}

module.exports = new QuestionService();
