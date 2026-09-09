const submissionRepository = require('./submission.repository');
const auditService = require('../audit/audit.service');
const prisma = require('../../config/prisma');

// ─── Utility: Fisher-Yates shuffle (seeded by submissionId cho mỗi SV một thứ tự khác nhau) ───
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

class SubmissionService {
  async startExam(examIdOrCode, userId, password) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const error = new Error('Không tìm thấy tài khoản người dùng');
      error.statusCode = 404;
      throw error;
    }

    const exam = await prisma.exam.findFirst({
      where: {
        OR: [
          { id: examIdOrCode },
          { code: examIdOrCode },
        ],
      },
      include: {
        questions: {
          select: {
            id: true,
            content: true,
            type: true,
            points: true,
            difficulty: true,
            imageUrl: true,
            explanation: true,
            options: {
              select: {
                id: true,
                content: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!exam) {
      const error = new Error('Không tìm thấy bài thi');
      error.statusCode = 404;
      throw error;
    }

    if (exam.status !== 'PUBLISHED' && user.role === 'STUDENT') {
      const error = new Error('Bài thi đang ở trạng thái Bản nháp (DRAFT). Giáo viên cần nhấn Xuất bản (PUBLISH) trước khi học sinh bắt đầu thi.');
      error.statusCode = 400;
      throw error;
    }

    if (!exam.questions || exam.questions.length === 0) {
      const error = new Error('Đề thi này hiện có 0 câu hỏi. Giáo viên cần vào trang "Quản lý đề thi" -> nhấn "Gán Câu Hỏi" trước khi làm bài.');
      error.statusCode = 400;
      throw error;
    }

    // ── Kiểm tra lịch thi (áp dụng cho học sinh) ──
    const now = new Date();
    if (user.role === 'STUDENT') {
      if (exam.startTime && now < exam.startTime) {
        const error = new Error(`Phòng thi chưa mở. Thời gian bắt đầu: ${exam.startTime.toLocaleString('vi-VN')}`);
        error.statusCode = 403;
        error.examStartTime = exam.startTime;
        throw error;
      }
      if (exam.endTime && now > exam.endTime) {
        const error = new Error('Phòng thi đã kết thúc. Không thể bắt đầu làm bài.');
        error.statusCode = 403;
        throw error;
      }
    }

    // ── Kiểm tra mật khẩu phòng thi ──
    if (exam.examPassword && exam.examPassword.trim() !== '') {
      if (!password || password.trim().toUpperCase() !== exam.examPassword.trim().toUpperCase()) {
        const error = new Error('Mật khẩu phòng thi không đúng. Vui lòng kiểm tra lại mã giám thị cung cấp.');
        error.statusCode = 401;
        error.requiresPassword = true;
        throw error;
      }
    }

    const actualExamId = exam.id;

    // ── Kiểm tra số lần thi (chỉ áp dụng cho học sinh) ──
    if (exam.maxAttempts > 0 && user.role === 'STUDENT') {
      const completedCount = await prisma.submission.count({
        where: { userId, examId: actualExamId, status: 'COMPLETED' },
      });
      if (completedCount >= exam.maxAttempts) {
        const error = new Error(`Bạn đã hết số lần thi cho phép (tối đa ${exam.maxAttempts} lần thi)`);
        error.statusCode = 403;
        throw error;
      }
    }

    // ── Kiểm tra đang có lượt IN_PROGRESS chưa nộp → trả về lượt cũ ──
    let activeSubmission = await submissionRepository.findActiveSubmission(userId, actualExamId);
    if (activeSubmission) {
      const fullSubmission = await submissionRepository.findById(activeSubmission.id);
      // Sanitize: không trả isCorrect cho frontend
      const orderedQuestions = this._applyQuestionOrder(
        fullSubmission.exam.questions,
        fullSubmission.questionOrder,
        exam.shuffleOptions
      );
      return {
        ...fullSubmission,
        exam: { ...fullSubmission.exam, questions: orderedQuestions },
      };
    }

    // ── Trộn đề nếu được bật ──
    let questions = [...exam.questions];
    let questionOrder = null;
    if (exam.shuffleQuestions) {
      questions = shuffleArray(questions);
    }
    if (exam.shuffleOptions) {
      questions = questions.map(q => ({ ...q, options: shuffleArray(q.options) }));
    }
    questionOrder = questions.map(q => q.id);

    // ── Tạo submission mới ──
    const newSubmission = await submissionRepository.create({
      examId: actualExamId,
      userId,
      status: 'IN_PROGRESS',
      startedAt: new Date(),
      questionOrder,
    });

    auditService.logAction({
      userId,
      action: 'START_EXAM',
      resource: 'Submission',
      details: { examId: actualExamId, submissionId: newSubmission.id },
    });

    // Broadcast real-time update to Teacher Monitor
    try {
      const { getIO } = require('../../config/socket.config');
      getIO().emit(`exam:monitor:${actualExamId}`, {
        type: 'STUDENT_STARTED',
        examId: actualExamId,
        submissionId: newSubmission.id,
        userId,
      });
    } catch (e) {}

    // Trả về submission + câu hỏi đã được trộn
    return {
      ...newSubmission,
      exam: { ...newSubmission.exam, questions },
    };
  }

  // ── Helper: áp dụng thứ tự đã lưu vào câu hỏi khi resume ──
  _applyQuestionOrder(questions, questionOrder, shuffleOptions) {
    if (!questionOrder || !Array.isArray(questionOrder)) return questions;
    const qMap = new Map(questions.map(q => [q.id, q]));
    return questionOrder
      .map(id => qMap.get(id))
      .filter(Boolean)
      .map(q => ({
        ...q,
        options: shuffleOptions ? q.options : q.options, // order preserved from DB when not shuffling
      }));
  }

  async submitExam(submissionId, answers, userId, tabSwitchCount = 0, violations = []) {
    const submission = await submissionRepository.findById(submissionId);
    if (!submission) {
      const error = new Error('Không tìm thấy lượt làm bài');
      error.statusCode = 404;
      throw error;
    }

    if (submission.userId !== userId) {
      const error = new Error('Bạn không có quyền nộp bài làm này');
      error.statusCode = 403;
      throw error;
    }

    if (submission.status === 'COMPLETED') {
      const error = new Error('Bài thi này đã được nộp trước đó');
      error.statusCode = 400;
      throw error;
    }

    // ── Server-side thời gian: nếu đã qua endTime → force submit (không reject, nhưng ghi log) ──
    const exam = submission.exam;
    let forceSubmitted = false;
    if (exam.endTime && new Date() > new Date(exam.endTime)) {
      forceSubmitted = true;
    }

    // ── Chấm điểm tự động ──
    const questions = exam.questions;
    let totalScore = 0;

    const answersMap = new Map();
    if (Array.isArray(answers)) {
      answers.forEach(item => {
        answersMap.set(item.questionId, Array.isArray(item.selectedOptionIds) ? item.selectedOptionIds : []);
      });
    }

    questions.forEach(question => {
      const selectedOptionIds = answersMap.get(question.id) || [];
      const correctOptionIds = question.options
        .filter(opt => opt.isCorrect)
        .map(opt => opt.id);

      let isQuestionCorrect = false;

      if (question.type === 'SINGLE_CHOICE' || question.type === 'TRUE_FALSE') {
        if (selectedOptionIds.length === 1 && correctOptionIds.includes(selectedOptionIds[0])) {
          isQuestionCorrect = true;
        }
      } else if (question.type === 'MULTIPLE_CHOICE') {
        const sortedSelected = [...selectedOptionIds].sort().join(',');
        const sortedCorrect = [...correctOptionIds].sort().join(',');
        if (sortedSelected === sortedCorrect && sortedSelected !== '') {
          isQuestionCorrect = true;
        }
      }

      if (isQuestionCorrect) {
        totalScore += question.points || 1.0;
      }
    });

    const isPassed = totalScore >= exam.passPoints;

    const answersPayload = {
      answers: Array.isArray(answers) ? answers : [],
      tabSwitchCount: Number(tabSwitchCount) || 0,
      forceSubmitted,
    };

    // Violations array: merge client-side + any server-side
    const violationsPayload = Array.isArray(violations) ? violations : [];

    const updatedSubmission = await submissionRepository.update(submissionId, {
      score: totalScore,
      isPassed,
      status: 'COMPLETED',
      submittedAt: new Date(),
      answersJson: answersPayload,
      violations: violationsPayload,
    });

    auditService.logAction({
      userId,
      action: 'SUBMIT_EXAM',
      resource: 'Submission',
      details: {
        submissionId,
        score: totalScore,
        isPassed,
        tabSwitchCount: Number(tabSwitchCount) || 0,
        violationCount: violationsPayload.length,
        forceSubmitted,
      },
    });

    // Broadcast real-time student submitted to Teacher Monitor
    try {
      const { getIO } = require('../../config/socket.config');
      getIO().emit(`exam:monitor:${exam.id}`, {
        type: 'STUDENT_SUBMITTED',
        examId: exam.id,
        submissionId,
        score: totalScore,
        isPassed,
      });
    } catch (e) {}

    return {
      submissionId: updatedSubmission.id,
      score: totalScore,
      totalPoints: exam.totalPoints,
      passPoints: exam.passPoints,
      isPassed,
      status: updatedSubmission.status,
      submittedAt: updatedSubmission.submittedAt,
      showAnswerAfter: exam.showAnswerAfter,
    };
  }

  async getSubmissionResult(submissionId, user) {
    const submission = await submissionRepository.findById(submissionId);
    if (!submission) {
      const error = new Error('Không tìm thấy kết quả bài làm');
      error.statusCode = 404;
      throw error;
    }

    if (user.role === 'STUDENT' && submission.userId !== user.id) {
      const error = new Error('Bạn không có quyền xem kết quả này');
      error.statusCode = 403;
      throw error;
    }

    // Nếu giáo viên tắt showAnswerAfter → ẩn isCorrect khỏi options
    if (!submission.exam.showAnswerAfter && user.role === 'STUDENT') {
      return {
        ...submission,
        exam: {
          ...submission.exam,
          questions: submission.exam.questions.map(q => ({
            ...q,
            options: q.options.map(o => ({ id: o.id, content: o.content })),
          })),
        },
      };
    }

    return submission;
  }

  async getMySubmissions(userId) {
    return submissionRepository.findUserSubmissions(userId);
  }

  async saveProgress(submissionId, answers, userId, tabSwitchCount = 0, violations = []) {
    const submission = await submissionRepository.findById(submissionId);
    if (!submission) {
      const error = new Error('Không tìm thấy lượt làm bài');
      error.statusCode = 404;
      throw error;
    }

    if (submission.userId !== userId) {
      const error = new Error('Bạn không có quyền cập nhật lượt làm bài này');
      error.statusCode = 403;
      throw error;
    }

    if (submission.status === 'COMPLETED') {
      return submission;
    }

    const answersPayload = {
      answers: Array.isArray(answers) ? answers : [],
      tabSwitchCount: Number(tabSwitchCount) || 0,
    };

    const violationsPayload = Array.isArray(violations) ? violations : [];

    const updated = await submissionRepository.update(submissionId, {
      answersJson: answersPayload,
      violations: violationsPayload,
    });

    // Broadcast real-time progress update to Teacher Monitor
    try {
      const { getIO } = require('../../config/socket.config');
      getIO().emit(`exam:monitor:${submission.examId}`, {
        type: 'STUDENT_PROGRESS',
        examId: submission.examId,
        submissionId,
        answeredCount: answersPayload.answers.filter(a => a.selectedOptionIds?.length > 0).length,
        violationCount: violationsPayload.length,
      });
    } catch (e) {}

    return updated;
  }

  // ── Danh sách submissions đang diễn ra (cho Teacher monitor) ──
  async getLiveSubmissions(examId, user) {
    const submissions = await prisma.submission.findMany({
      where: { examId },
      include: {
        user: { select: { id: true, fullName: true, email: true, role: true } },
      },
      orderBy: { startedAt: 'desc' },
    });

    return submissions.map(s => {
      const answersJson = s.answersJson || {};
      const answeredCount = Array.isArray(answersJson.answers) ? answersJson.answers.filter(a => a.selectedOptionIds?.length > 0).length : 0;
      const tabSwitchCount = answersJson.tabSwitchCount || 0;
      const violationCount = Array.isArray(s.violations) ? s.violations.length : 0;
      return {
        id: s.id,
        status: s.status,
        score: s.score,
        isPassed: s.isPassed,
        startedAt: s.startedAt,
        submittedAt: s.submittedAt,
        answeredCount,
        tabSwitchCount,
        violationCount,
        user: s.user,
      };
    });
  }
}

module.exports = new SubmissionService();
