const examRepository = require('./exam.repository');

class ExamService {
  async getAllExams(filters) {
    return examRepository.findAll(filters);
  }

  async getExamById(id) {
    const exam = await examRepository.findById(id);
    if (!exam) {
      const error = new Error('Không tìm thấy đề thi');
      error.statusCode = 404;
      throw error;
    }
    return exam;
  }

  async createExam(data, userId) {
    if (!data.title || !data.title.trim()) {
      const error = new Error('Tiêu đề đề thi không được để trống');
      error.statusCode = 400;
      throw error;
    }
    if (!data.code || !data.code.trim()) {
      const error = new Error('Mã đề thi không được để trống');
      error.statusCode = 400;
      throw error;
    }

    const existingCode = await examRepository.findByCode(data.code);
    if (existingCode) {
      const error = new Error('Mã đề thi đã tồn tại trong hệ thống');
      error.statusCode = 400;
      throw error;
    }

    return examRepository.create({
      ...data,
      createdById: userId,
      durationMinutes: data.durationMinutes ? parseInt(data.durationMinutes, 10) : 45,
      totalPoints: data.totalPoints ? parseFloat(data.totalPoints) : 10.0,
      passPoints: data.passPoints ? parseFloat(data.passPoints) : 5.0,
    });
  }

  async updateExam(id, data, user) {
    const exam = await this.getExamById(id);

    if (user.role !== 'ADMIN' && exam.createdById !== user.id) {
      const error = new Error('Bạn không có quyền chỉnh sửa đề thi này');
      error.statusCode = 403;
      throw error;
    }

    if (data.code && data.code !== exam.code) {
      const existingCode = await examRepository.findByCode(data.code);
      if (existingCode) {
        const error = new Error('Mã đề thi đã tồn tại trong hệ thống');
        error.statusCode = 400;
        throw error;
      }
    }

    const updatePayload = { ...data };
    if (data.durationMinutes) updatePayload.durationMinutes = parseInt(data.durationMinutes, 10);
    if (data.totalPoints) updatePayload.totalPoints = parseFloat(data.totalPoints);
    if (data.passPoints) updatePayload.passPoints = parseFloat(data.passPoints);

    return examRepository.update(id, updatePayload);
  }

  async deleteExam(id, user) {
    const exam = await this.getExamById(id);

    if (user.role !== 'ADMIN' && exam.createdById !== user.id) {
      const error = new Error('Bạn không có quyền xóa đề thi này');
      error.statusCode = 403;
      throw error;
    }

    return examRepository.delete(id);
  }
}

module.exports = new ExamService();
