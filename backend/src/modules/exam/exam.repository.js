const prisma = require('../../config/prisma');

class ExamRepository {
  async findAll({ search, subjectId, gradeId, status, createdById }) {
    const where = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (subjectId) where.subjectId = subjectId;
    if (gradeId) where.gradeId = gradeId;
    if (status) where.status = status;
    if (createdById) where.createdById = createdById;

    return prisma.exam.findMany({
      where,
      include: {
        subject: { select: { id: true, name: true, code: true } },
        grade: { select: { id: true, name: true, code: true } },
        createdBy: { select: { id: true, fullName: true, email: true } },
        _count: { select: { questions: true, submissions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id) {
    return prisma.exam.findUnique({
      where: { id },
      include: {
        subject: true,
        grade: true,
        createdBy: { select: { id: true, fullName: true, email: true } },
        questions: {
          include: { options: true },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { submissions: true } },
      },
    });
  }

  async findByCode(code) {
    return prisma.exam.findUnique({ where: { code } });
  }

  async create(data) {
    return prisma.exam.create({
      data,
      include: {
        subject: true,
        grade: true,
      },
    });
  }

  async update(id, data) {
    return prisma.exam.update({
      where: { id },
      data,
      include: {
        subject: true,
        grade: true,
      },
    });
  }

  async delete(id) {
    return prisma.exam.delete({ where: { id } });
  }
}

module.exports = new ExamRepository();
