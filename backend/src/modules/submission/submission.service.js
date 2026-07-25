const submissionRepository = require('./submission.repository');
const prisma = require('../../config/prisma');

class SubmissionService {
  async startExam(examId, userId) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          select: {
            id: true,
            content: true,
            type: true,
            points: true,
            difficulty: true,
            imageUrl: true,
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

    if (exam.status !== 'PUBLISHED') {
      const error = new Error('Bài thi chưa được xuất bản');
      error.statusCode = 400;
      throw error;
    }

    if (!exam.questions || exam.questions.length === 0) {
      const error = new Error('Bài thi chưa có câu hỏi nào');
      error.statusCode = 400;
      throw error;
    }

    // Check if user already has an IN_PROGRESS submission for this exam
    let activeSubmission = await submissionRepository.findActiveSubmission(userId, examId);
    if (activeSubmission) {
      const fullSubmission = await submissionRepository.findById(activeSubmission.id);
      // Strip isCorrect from questions options
      const sanitizedExam = {
        ...fullSubmission.exam,
        questions: fullSubmission.exam.questions.map(q => ({
          ...q,
          options: q.options.map(o => ({ id: o.id, content: o.content })),
        })),
      };
      return {
        ...fullSubmission,
        exam: sanitizedExam,
      };
    }

    // Create new submission
    const newSubmission = await submissionRepository.create({
      examId,
      userId,
      status: 'IN_PROGRESS',
      startedAt: new Date(),
    });

    return newSubmission;
  }

  async submitExam(submissionId, answers, userId) {
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

    // Auto-grading algorithm
    const questions = submission.exam.questions;
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

    const isPassed = totalScore >= submission.exam.passPoints;

    const updatedSubmission = await submissionRepository.update(submissionId, {
      score: totalScore,
      isPassed,
      status: 'COMPLETED',
      submittedAt: new Date(),
      answersJson: answers,
    });

    return {
      submissionId: updatedSubmission.id,
      score: totalScore,
      totalPoints: submission.exam.totalPoints,
      passPoints: submission.exam.passPoints,
      isPassed,
      status: updatedSubmission.status,
      submittedAt: updatedSubmission.submittedAt,
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

    return submission;
  }

  async getMySubmissions(userId) {
    return submissionRepository.findUserSubmissions(userId);
  }
}

module.exports = new SubmissionService();
