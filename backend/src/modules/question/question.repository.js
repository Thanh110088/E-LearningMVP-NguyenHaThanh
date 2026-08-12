const prisma = require('../../config/prisma');

class QuestionRepository {
  async findAll({ subjectId, examId, difficulty, type, workspaceId }) {
    const where = {};
    if (subjectId) where.subjectId = subjectId;
    if (examId) where.examId = examId;
    if (difficulty) where.difficulty = difficulty;
    if (type) where.type = type;
    if (workspaceId) where.workspaceId = workspaceId;

    return prisma.question.findMany({
      where,
      include: {
        options: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id) {
    return prisma.question.findUnique({
      where: { id },
      include: { options: true },
    });
  }

  async create(data) {
    const { options, ...questionData } = data;
    return prisma.question.create({
      data: {
        ...questionData,
        options: options && options.length > 0 ? {
          create: options.map(opt => ({
            content: opt.content,
            isCorrect: Boolean(opt.isCorrect),
          })),
        } : undefined,
      },
      include: { options: true },
    });
  }

  async update(id, data) {
    const { options, ...questionData } = data;

    if (options) {
      // Re-create options if provided
      await prisma.option.deleteMany({ where: { questionId: id } });
      return prisma.question.update({
        where: { id },
        data: {
          ...questionData,
          options: {
            create: options.map(opt => ({
              content: opt.content,
              isCorrect: Boolean(opt.isCorrect),
            })),
          },
        },
        include: { options: true },
      });
    }

    return prisma.question.update({
      where: { id },
      data: questionData,
      include: { options: true },
    });
  }

  async delete(id) {
    return prisma.question.delete({ where: { id } });
  }
}

module.exports = new QuestionRepository();
