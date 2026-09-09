const prisma = require('../../config/prisma');

class SubmissionRepository {
  async findActiveSubmission(userId, examId) {
    return prisma.submission.findFirst({
      where: {
        userId,
        examId,
        status: 'IN_PROGRESS',
      },
    });
  }

  async findById(id) {
    return prisma.submission.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        exam: {
          include: {
            subject: true,
            grade: true,
            questions: {
              include: { options: true },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });
  }

  async create(data) {
    return prisma.submission.create({
      data,
      include: {
        exam: {
          include: {
            subject: true,
            grade: true,
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
        },
      },
    });
  }

  async update(id, data) {
    return prisma.submission.update({
      where: { id },
      data,
      include: {
        exam: {
          include: {
            subject: true,
            grade: true,
          },
        },
      },
    });
  }

  async findUserSubmissions(userId) {
    return prisma.submission.findMany({
      where: { userId },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            code: true,
            durationMinutes: true,
            totalPoints: true,
            passPoints: true,
            subject: { select: { name: true } },
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    });
  }
}

module.exports = new SubmissionRepository();
