const examRepository = require('./exam.repository');
const auditService = require('../audit/audit.service');

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

    const parseBool = (val) => val === true || val === 'true';
    // parseDate: an toàn, reject null/empty/Invalid Date
    const parseDate = (v) => {
      if (!v || v === 'null') return null;
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d;
    };

    const payload = {
      ...data,
      createdById: userId,
      durationMinutes: data.durationMinutes ? parseInt(data.durationMinutes, 10) : 45,
      totalPoints: data.totalPoints ? parseFloat(data.totalPoints) : 10.0,
      passPoints: data.passPoints ? parseFloat(data.passPoints) : 5.0,
      maxAttempts: data.maxAttempts !== undefined ? parseInt(data.maxAttempts, 10) : 1,
      shuffleQuestions: parseBool(data.shuffleQuestions),
      shuffleOptions: parseBool(data.shuffleOptions),
      showAnswerAfter: parseBool(data.showAnswerAfter),
      proctorEnabled: parseBool(data.proctorEnabled),
      startTime: parseDate(data.startTime),
      endTime: parseDate(data.endTime),
      examPassword: data.examPassword?.trim() || null,
    };
    if (!payload.subjectId) delete payload.subjectId;
    if (!payload.gradeId) delete payload.gradeId;
    if (!payload.workspaceId) delete payload.workspaceId;

    const newExam = await examRepository.create(payload);

    auditService.logAction({
      userId,
      action: 'CREATE_EXAM',
      resource: 'Exam',
      details: { examId: newExam.id, title: newExam.title, code: newExam.code },
    });

    return newExam;
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

    const parseBool = (val) => val === true || val === 'true';
    const parseDate = (v) => {
      if (!v || v === 'null') return null;
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d;
    };
    const updatePayload = { ...data };
    if (data.durationMinutes) updatePayload.durationMinutes = parseInt(data.durationMinutes, 10);
    if (data.totalPoints) updatePayload.totalPoints = parseFloat(data.totalPoints);
    if (data.passPoints) updatePayload.passPoints = parseFloat(data.passPoints);
    if (data.maxAttempts !== undefined) updatePayload.maxAttempts = parseInt(data.maxAttempts, 10);
    if (data.shuffleQuestions !== undefined) updatePayload.shuffleQuestions = parseBool(data.shuffleQuestions);
    if (data.shuffleOptions !== undefined) updatePayload.shuffleOptions = parseBool(data.shuffleOptions);
    if (data.showAnswerAfter !== undefined) updatePayload.showAnswerAfter = parseBool(data.showAnswerAfter);
    if (data.proctorEnabled !== undefined) updatePayload.proctorEnabled = parseBool(data.proctorEnabled);
    if (data.startTime !== undefined) updatePayload.startTime = parseDate(data.startTime);
    if (data.endTime !== undefined) updatePayload.endTime = parseDate(data.endTime);
    if (data.examPassword !== undefined) updatePayload.examPassword = data.examPassword?.trim() || null;

    const updatedExam = await examRepository.update(id, updatePayload);

    auditService.logAction({
      userId: user.id,
      action: 'UPDATE_EXAM',
      resource: 'Exam',
      details: { examId: id, title: updatedExam.title, status: updatedExam.status },
    });

    return updatedExam;
  }

  async deleteExam(id, user) {
    const exam = await this.getExamById(id);

    if (user.role !== 'ADMIN' && exam.createdById !== user.id) {
      const error = new Error('Bạn không có quyền xóa đề thi này');
      error.statusCode = 403;
      throw error;
    }

    const deleted = await examRepository.delete(id);

    auditService.logAction({
      userId: user.id,
      action: 'DELETE_EXAM',
      resource: 'Exam',
      details: { examId: id, title: exam.title },
    });

    return deleted;
  }
}

module.exports = new ExamService();
